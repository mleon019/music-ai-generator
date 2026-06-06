const config = require("../config");
const { generateMusicXml } = require("./groqService");
const { validateMusicXml } = require("./xmlService");
const { getBestModesForConfig } = require("./modelSelector");
const pool = require("../db/pool");

function buildTitle(promptConfig) {
    const { instrument, tempo, timeSignature, measures } = promptConfig;

    const descriptiveTemplates = [
        `${instrument} ${timeSignature} • ${tempo} BPM`,
        `${instrument} en ${timeSignature} (${tempo} BPM)`,
        `${instrument} ${timeSignature} ${tempo} BPM`,
    ];
    const creativeTemplates = [
        `${instrument} del Atardecer`,
        `Melodía de ${instrument}`,
        `Sueños en ${timeSignature}`,
        `Ritmo de ${instrument} ${tempo} BPM`,
        `Exploración de ${instrument}`,
    ];

    if (measures < 3) {
        return `Motivo de ${descriptiveTemplates[Math.floor(Math.random() * descriptiveTemplates.length)]}`;
    } else if (Math.random() < 0.35) {
        return creativeTemplates[Math.floor(Math.random() * creativeTemplates.length)];
    }
    return descriptiveTemplates[Math.floor(Math.random() * descriptiveTemplates.length)];
}

async function generateValidXml(promptConfig) {
    const maxAttempts = config.groq.maxRetries + 1;
    const bestModels = getBestModesForConfig(promptConfig.measures);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const model = bestModels[attempt % bestModels.length];
        console.log(`Attempt ${attempt + 1}/${maxAttempts} using model ${model}`);
        try {
            const { xml } = await generateMusicXml({ model, config: promptConfig });
            const validation = validateMusicXml(xml);

            if (validation.valid) {
                return xml;
            }
        } catch (error) {
            if (error.status === 429 || error.status === 413) {
                continue;
            }

            error.status = 502;
            throw error;
        }
    }

    return null;
}

async function generateScore(promptConfig, user = null) {
    const xml = await generateValidXml(promptConfig);
    if (!xml) {
        const error = new Error("MusicXML failed validation");
        error.status = 422;
        throw error;
    }

    if (!user) {
        return { musicxml: xml };
    }

    const title = buildTitle(promptConfig);
    const result = await pool.query(
        `INSERT INTO scores (user_id, title, config, musicxml, created_at)
         VALUES ($1, $2, $3, $4, now()) 
         RETURNING id`,
        [user.id, title, JSON.stringify(promptConfig), xml]
    );

    return { musicxml: xml, id: result.rows[0].id };
}

async function regenerateScore(promptConfig, scoreId, user) {
    if (!user) {
        return generateScore(promptConfig);
    }
    if (!scoreId) {
        const error = new Error("score id is required");
        error.status = 400;
        throw error;
    }

    const existingScore = await pool.query(
        "SELECT id FROM scores WHERE id = $1 AND user_id = $2",
        [scoreId, user.id]
    );
    if (existingScore.rowCount === 0) {
        const error = new Error("Score not found or not owned by user");
        error.status = 404;
        throw error;
    }

    const xml = await generateValidXml(promptConfig);
    if (!xml) {
        const error = new Error("MusicXML failed validation");
        error.status = 422;
        throw error;
    }
    
    await pool.query(
        "UPDATE scores SET musicxml = $1, config = $2, created_at = now() WHERE id = $3 AND user_id = $4 RETURNING id",
        [xml, JSON.stringify(promptConfig), scoreId, user.id]
    );
    return { musicxml: xml, id: scoreId };
}

async function getUserScores(userId) {
    const result = await pool.query(
        "SELECT id, title, config, musicxml, created_at FROM scores WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
    return result.rows;
}

async function updateScoreTitle(scoreId, userId, title) {
    const normalizedTitle = typeof title === "string" ? title.trim() : "";

    if (!normalizedTitle) {
        const error = new Error("title is required");
        error.status = 400;
        throw error;
    }

    const result = await pool.query(
        `UPDATE scores
         SET title = $1
         WHERE id = $2 AND user_id = $3
         RETURNING id, title, config, musicxml, created_at`,
        [normalizedTitle, scoreId, userId]
    );

    if (result.rowCount === 0) {
        const error = new Error("Score not found or not owned by user");
        error.status = 404;
        throw error;
    }

    return result.rows[0];
}

async function deleteScore(scoreId, userId) {
    const result = await pool.query(
        "DELETE FROM scores WHERE id = $1 AND user_id = $2 RETURNING id",
        [scoreId, userId]
    );

    if (result.rowCount === 0) {
        const error = new Error("Score not found or not owned by user");
        error.status = 404;
        throw error;
    }

    return result.rowCount;
}

async function deleteAllScores(userId) {
    const result = await pool.query(
        "DELETE FROM scores WHERE user_id = $1",
        [userId]
    );

    return result.rowCount;
}

module.exports = {
    generateScore,
    regenerateScore,
    getUserScores,
    updateScoreTitle,
    deleteScore,
    deleteAllScores
}