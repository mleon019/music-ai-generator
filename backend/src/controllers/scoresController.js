const config = require("../config");
const { generateMusicXml } = require("../services/groqService");
const { validateMusicXml } = require("../services/xmlService");

async function generateScore(req, res, next) {
  const promptConfig = req.validatedConfig;

  const maxAttempts = config.groq.maxRetries + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const model = config.groq.models[attempt % config.groq.models.length];

    try {
      const { xml } = await generateMusicXml({ model, config: promptConfig });
      const validation = validateMusicXml(xml);

      if (validation.valid) {
        return res.status(200).json({ musicxml: xml });
      }

    } catch (error) {
      if (error.status === 429) {
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
