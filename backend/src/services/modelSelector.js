const config = require("../config");

const MODEL_RANKINGS = {
    "1-2": ["openai/gpt-oss-safeguard-20b", "llama-3.1-8b-instant", "meta-llama/llama-4-scout-17b-16e-instruct", "groq/compound-mini"],
    "3-5": ["openai/gpt-oss-120b", "groq/compound", "openai/gpt-oss-20b"],
    "6-12": ["groq/compound-mini", "meta-llama/llama-4-scout-17b-16e-instruct", "openai/gpt-oss-120b", "groq/compound"],
    "13-16": ["groq/compound", "openai/gpt-oss-safeguard-20b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
};

function getBestModesForConfig(measures) {
    let rankingKey;
    if (measures >= 1 && measures <= 2) {
        rankingKey = "1-2";
    } else if (measures >= 3 && measures <= 5) {
        rankingKey = "3-5";
    } else if (measures >= 6 && measures <= 12) {
        rankingKey = "6-12";
    } else if (measures >= 13 && measures <= 16) {
        rankingKey = "13-16";
    }

    const rankedModels = MODEL_RANKINGS[rankingKey] || [];
    const bestModels = rankedModels.filter(model => config.groq.models.includes(model));
    return bestModels.length > 0 ? bestModels : config.groq.models;
}

module.exports = {
    getBestModesForConfig
};