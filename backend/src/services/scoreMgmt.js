const config = require("../config");
const { generateMusicXml } = require("./groqService");
const { validateMusicXml } = require("./xmlService");
const { getBestModesForConfig } = require("./modelSelector");
const scoreRepository = require("../repository/scoreRepository");

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
            console.log("----------------------------------------------------");
            console.log(xml);
            console.log("----------------------------------------------------");
            const validation = validateMusicXml(xml);

            if (validation.valid) {
                return xml;
            }
        } catch (error) {
            if (error.status === 429 || error.status === 413 || error.status === 502) {
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
    const score = await scoreRepository.createScore(
        user.id,
        title,
        promptConfig,
        xml
    );

    return { musicxml: xml, id: score.id };
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

    const score = await scoreRepository.findByIdAndUser(
        scoreId,
        user.id
    );

    if (!score) {
        const error = new Error("Score not found");
        error.status = 404;
        throw error;
    }

    const xml = await generateValidXml(promptConfig);
    if (!xml) {
        const error = new Error("MusicXML failed validation");
        error.status = 422;
        throw error;
    }
    
    await scoreRepository.updateScore(
        scoreId,
        user.id,
        xml,
        promptConfig
    );
    return { musicxml: xml, id: scoreId };
}

async function getUserScores(userId) {
    const scores = await scoreRepository.findAllByUser(userId);
    return scores.map(score => ({
        id: score.id,
        title: score.title,
        config: score.config,
        musicxml: score.musicxml,
        createdAt: score.created_at
    }));
}

async function updateScoreTitle(scoreId, userId, title) {
    const normalizedTitle = typeof title === "string" ? title.trim() : "";

    if (!normalizedTitle) {
        const error = new Error("title is required");
        error.status = 400;
        throw error;
    }

    const score = await scoreRepository.updateTitle(scoreId, userId, normalizedTitle);
    if (!score) {
        const error = new Error("Score not found or not owned by user");
        error.status = 404;
        throw error;
    }

    return score;
}

async function deleteScore(scoreId, userId) {
    const score = await scoreRepository.deleteById(scoreId, userId);
    if (!score) {
        const error = new Error("Score not found or not owned by user");
        error.status = 404;
        throw error;
    }

    return score;
}

async function deleteAllScores(userId) {
    const result = await scoreRepository.deleteAllByUser(userId);
    return result;
}

module.exports = {
    generateScore,
    regenerateScore,
    getUserScores,
    updateScoreTitle,
    deleteScore,
    deleteAllScores
}