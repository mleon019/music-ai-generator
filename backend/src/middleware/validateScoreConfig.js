const ALLOWED_TIME_SIGNATURES = new Set(["3/4", "4/4"]);
const ALLOWED_INSTRUMENTS = new Set(["Piano", "Guitar", "Violin", "Flute", "Trumpet"]);

function normalizeString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function validateScoreConfig(req, res, next) {
  const config = req.body?.config;

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return res.status(400).json({ error: "config must be an object" });
  }

  const timeSignature = normalizeString(config.timeSignature);
  const instrument = normalizeString(config.instrument);
  const tempo = Number(config.tempo);
  const measures = Number(config.measures);

  const errors = [];

  if (!timeSignature || !ALLOWED_TIME_SIGNATURES.has(timeSignature)) {
    errors.push("timeSignature must be one of: 3/4, 4/4");
  }

  if (!Number.isFinite(tempo) || tempo < 40 || tempo > 168) {
    errors.push("tempo must be a number between 40 and 168");
  }

  if (!instrument || !ALLOWED_INSTRUMENTS.has(instrument)) {
    errors.push("instrument must be one of: Piano, Guitar, Violin, Flute, Trumpet");
  }

  if (!Number.isFinite(measures) || measures < 1 || measures > 16) {
    errors.push("measures must be a number between 1 and 16");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join("; ") });
  }

  req.validatedConfig = {
    timeSignature,
    tempo,
    instrument,
    measures
  };

  return next();
}

module.exports = validateScoreConfig;
