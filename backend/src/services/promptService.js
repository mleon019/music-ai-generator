const fs = require("fs");
const path = require("path");

const config = require("../config");

let cachedAssets = null;

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").trim();
}

function loadPromptAssets() {
  if (cachedAssets) {
    return cachedAssets;
  }

  const dir = config.paths.promptDir;

  const assets = {
    system: readText(path.join(dir, "system_prompt.md")),
    examples: [
      {
        user: readText(path.join(dir, "example1.user.md")),
        assistant: readText(path.join(dir, "example1.assistant.musicxml"))
      },
      {
        user: readText(path.join(dir, "example2.user.md")),
        assistant: readText(path.join(dir, "example2.assistant.musicxml"))
      }
    ]
  };

  cachedAssets = assets;
  return assets;
}

function buildFinalUserPrompt(config) {
    const finalUserPrompt = `Compose a ${config.instrument} piece in ${config.timeSignature} time, ${config.measures} measures long, at ${config.tempo} BPM.`;
    return finalUserPrompt;
}

function buildMessages(config) {
  if (!config) {
    throw new Error("Config is required to build the prompt");
  }

  const assets = loadPromptAssets();
  const messages = [];

  for (const example of assets.examples) {
    messages.push({ role: "user", content: example.user });
    messages.push({ role: "assistant", content: example.assistant });
  }

  const finalUserPrompt = buildFinalUserPrompt(config);
  messages.push({ role: "user", content: finalUserPrompt });

  return {
    system: assets.system,
    messages
  };
}

module.exports = {
  buildMessages
};
