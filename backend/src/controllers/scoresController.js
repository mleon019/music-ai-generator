const config = require("../config");
const { generateMusicXml } = require("../services/groqService");
const { validateMusicXml } = require("../services/xmlService");
const { getBestModesForConfig } = require("../services/modelSelector");

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

module.exports = {
    generateScore
};
