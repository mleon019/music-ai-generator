const config = require("../config");
const pool = require("../db/pool");
const { generateMusicXml } = require("../services/groqService");
const { validateMusicXml } = require("../services/xmlService");
const { getBestModesForConfig } = require("../services/modelSelector");

function buildTitle(promptConfig) {
    return `${promptConfig.instrument} in ${promptConfig.timeSignature} (${promptConfig.tempo} BPM)`;
}

async function generateValidXml(promptConfig) {
    const maxAttempts = config.groq.maxRetries + 1;
    const bestModels = getBestModesForConfig(promptConfig.measures);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
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

async function generateScore(req, res, next) {
    const promptConfig = req.validatedConfig;

    try {
        const xml = await generateValidXml(promptConfig);

        if (!xml) {
            return res.status(422).json({ error: "MusicXML failed validation" });
        }

        if (req.user) {
            const title = buildTitle(promptConfig);
            const result = await pool.query(
                "INSERT INTO scores (user_id, title, config, musicxml) VALUES ($1, $2, $3, $4) RETURNING id",
                [req.user.id, title, JSON.stringify(promptConfig), xml]
            );

            return res.status(200).json({ musicxml: xml, id: result.rows[0].id });
        }

        return res.status(200).json({ musicxml: xml });
    } catch (error) {
        return next(error);
    }
}

async function regenerateScore(req, res, next) {
    const promptConfig = req.validatedConfig;
    const scoreId = req.body?.id;

    try {
        if (!req.user) {
            const xml = await generateValidXml(promptConfig);
            if (!xml) {
                return res.status(422).json({ error: "MusicXML failed validation" });
            }
            return res.status(200).json({ musicxml: xml });
        }

        if (!scoreId) {
            return res.status(400).json({ error: "score id is required" });
        }

        const existingScore = await pool.query(
            "SELECT id FROM scores WHERE id = $1 AND user_id = $2",
            [scoreId, req.user.id]
        );
        if (existingScore.rowCount === 0) {
            return res.status(404).json({ error: "Score not found or not owned by user" });
        }

        const xml = await generateValidXml(promptConfig);
        if (!xml) {
            return res.status(422).json({ error: "MusicXML failed validation" });
        }

        const result = await pool.query(
            "UPDATE scores SET musicxml = $1, config = $2, created_at = now() WHERE id = $3 AND user_id = $4 RETURNING id",
            [xml, JSON.stringify(promptConfig), scoreId, req.user.id]
        );

        return res.status(200).json({ musicxml: xml });
    } catch (error) {
        return next(error);
    }
}

async function listScores(req, res, next) {
    try {
        const result = await pool.query(
            "SELECT id, title, config, musicxml, created_at FROM scores WHERE user_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        );

        return res.status(200).json({ scores: result.rows });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    generateScore,
    regenerateScore,
    listScores
};
