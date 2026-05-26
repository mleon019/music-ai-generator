const fs = require("fs");
const path = require('path');
const os = require('os');
const { execSync } = require("child_process");

const config = require("../config");

const xsdPath = config.paths.musicXmlXsd;

async function validateMusicXml(xmlString) {
const xmlPath = path.join(os.tmpdir(), `mxml-${Date.now()}.xml`);
  fs.writeFileSync(xmlPath, xmlString, "utf8");
  try {
    const output = execSync(
      `python C:/TFG/pruebas/schema_validator.py "${xmlPath}" "${xsdPath}"`
    ).toString();

    const lines = output.split("\n");

    const errors = lines
      .filter(l => l.trim().startsWith("validation errors:") || l.trim().startsWith("-") || l.includes("Error"))
      .concat(
        lines.filter(l => l.trim().startsWith("  "))
      )
      .map(l => l.trim())
      .filter(Boolean);

    return {
      valid: output.includes("Validation succeeded."),
      errors,
    };

  } catch (err) {
    return {
      valid: false,
      errors: (err.stdout?.toString() || err.message).split("\n"),
    };
  } finally {
    fs.existsSync(xmlPath) && fs.unlinkSync(xmlPath);
  }
}

module.exports = {
  validateMusicXml
};
