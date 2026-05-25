const fs = require("fs");
const libxmljs = require("libxmljs2");

const config = require("../config");

const xsdContent = fs.readFileSync(config.paths.musicXmlXsd, "utf8");
const xsdDoc = libxmljs.parseXml(xsdContent);

function validateMusicXml(xmlString) {
  try {
    const xmlDoc = libxmljs.parseXml(xmlString);
    const valid = xmlDoc.validate(xsdDoc);
    const errors = valid
      ? []
      : xmlDoc.validationErrors.map((error) => error.message.trim());

    return { valid, errors };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

module.exports = {
  validateMusicXml
};
