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
    ],
    finalUser: readText(path.join(dir, "final.user.md"))
  };

  cachedAssets = assets;
  return assets;
}

function buildMessages() {
  const assets = loadPromptAssets();
  const messages = [];

  for (const example of assets.examples) {
    messages.push({ role: "user", content: example.user });
    messages.push({ role: "assistant", content: example.assistant });
  }

  messages.push({ role: "user", content: assets.finalUser });

  return {
    system: assets.system,
    messages
  };
}

module.exports = {
  buildMessages
};
