const config = require("../config");
const pool = require("../db/pool");
const { generateMusicXml } = require("../services/groqService");
const { validateMusicXml } = require("../services/xmlService");
const { getBestModesForConfig } = require("../services/modelSelector");

function buildTitle(promptConfig) {
    return `${promptConfig.instrument} in ${promptConfig.timeSignature} (${promptConfig.tempo} BPM)`;
}

async function generateScore(req, res, next) {
    const promptConfig = req.validatedConfig;
    const maxAttempts = config.groq.maxRetries + 1;
    const bestModels = getBestModesForConfig(promptConfig.measures);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const model = bestModels[attempt % bestModels.length];
        console.log(`Attempt ${attempt + 1}/${maxAttempts} using model ${model}`);
        try {
            
            const { xml } = await generateMusicXml({ model, config: promptConfig });
            const validation = validateMusicXml(xml);

            if (validation.valid) {
                if (req.user) {
                    const title = buildTitle(promptConfig);
                    await pool.query(
                        "INSERT INTO scores (user_id, title, config, musicxml) VALUES ($1, $2, $3, $4)",
                        [req.user.id, title, JSON.stringify(promptConfig), xml]
                    );
                }

                return res.status(200).json({ musicxml: xml });
            }

        } catch (error) {
            if (error.status === 429 || error.status === 413) {
                continue;
            }

            error.status = 502;
            return next(error);
        }
    }

    return res.status(422).json({ error: "MusicXML failed validation" });
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
    listScores
};
