const fs = require("fs");
const path = require("path");

const config = require("../config");

let cachedAssets = null;

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").trim();
}

function loadPromptAssets(timeSignature) {
  if (cachedAssets) {
    return cachedAssets;
  }

  const dir = config.paths.promptDir;

  let user1, assistant1, user2, assistant2;
  if (timeSignature === "3/4") {
    user1 = readText(path.join(dir, "user1_34.md"));
    assistant1 = readText(path.join(dir, "example1_34.musicxml"));
    user2 = readText(path.join(dir, "user2_34.md"));
    assistant2 = readText(path.join(dir, "example2_34.musicxml"));
  } 
  else {
    user1 = readText(path.join(dir, "user1_44.md"));
    assistant1 = readText(path.join(dir, "example1_44.musicxml"));
    user2 = readText(path.join(dir, "user2_44.md"));
    assistant2 = readText(path.join(dir, "example2_44.musicxml"));
  }

  const assets = {
    system: readText(path.join(dir, "system_prompt.md")),
    examples: [
      { user: user1, assistant: assistant1 },
      { user: user2, assistant: assistant2 }
    ]
  };

  cachedAssets = assets;
  return assets;
}

function instrumentTraductions(instrument) {
    const traductions = {
        "Piano": "Piano",
        "Pandereta": "Tambourine",
        "Violín": "Violin",
        "Flauta": "Flute",
        "Trompeta": "Trumpet"
    };
    return traductions[instrument] || instrument;
}

function buildFinalUserPrompt(config) {
    const finalUserPrompt = `Compose a ${instrumentTraductions(config.instrument)} piece in ${config.timeSignature} time, ${config.measures} measures long, at ${config.tempo} BPM.`;
    return finalUserPrompt;
}

function buildMessages(config) {
  if (!config) {
    throw new Error("Config is required to build the prompt");
  }

  const assets = loadPromptAssets(config.timeSignature);
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
