const Groq = require("groq-sdk");

const config = require("../config");
const { buildMessages } = require("./promptService");

const client = new Groq({ apiKey: config.groq.apiKey });

function extractMusicXml(text) {
  if (!text) {
    return null;
  }

  const cleaned = text.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "");

  const withDeclaration = cleaned.match(
    /<\?xml[\s\S]*?<score-(partwise|timewise)[\s\S]*?<\/score-\1>/
  );
  if (withDeclaration) {
    return withDeclaration[0].trim();
  }

  const withoutDeclaration = cleaned.match(
    /<score-(partwise|timewise)[\s\S]*?<\/score-\1>/
  );
  if (withoutDeclaration) {
    return withoutDeclaration[0].trim();
  }

  return null;
}

function normalizeGroqError(error) {
  const status = error?.status || error?.response?.status;
  const normalized = new Error(error?.message || "Groq request failed");

  if (status) {
    normalized.status = status;
  }

  normalized.cause = error;
  return normalized;
}

async function generateMusicXml({ model, config: promptConfig }) {
  const { system, messages } = buildMessages(promptConfig);

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "system", content: system }, ...messages],
      temperature: config.groq.temperature,
      top_p: config.groq.top_p
    });

    const content = response?.choices?.[0]?.message?.content || "";
    const xml = extractMusicXml(content);

    if (!xml) {
      const error = new Error("No MusicXML found in LLM response");
      error.status = 502;
      throw error;
    }

    return { xml, raw: content };
  } catch (error) {
    throw normalizeGroqError(error);
  }
}

module.exports = {
  extractMusicXml,
  generateMusicXml
};
