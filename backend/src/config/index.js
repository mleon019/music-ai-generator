const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "..", "..", ".env");
dotenv.config({ path: envPath });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const port = Number.parseInt(process.env.PORT || "3000", 10);
const groqModels = (process.env.GROQ_MODELS || "groq/compound-mini,groq/compound")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const config = {
  port,
  groq: {
    apiKey: requireEnv("GROQ_API_KEY"),
    models: groqModels,
    temperature: Number.parseFloat(process.env.GROQ_TEMPERATURE || "0.2"),
    top_p: Number.parseFloat(process.env.GROQ_TOP_P || "0.9"),
    maxRetries: Number.parseInt(process.env.GROQ_MAX_RETRIES || "2", 10)
  },
  paths: {
    promptDir: path.resolve(__dirname, "..", "..", "prompts"),
    musicXmlXsd: path.resolve(__dirname, "..", "..", "..", "schema", "musicxml.xsd")
  }
};

module.exports = config;
