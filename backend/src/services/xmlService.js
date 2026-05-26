const fs = require("fs");
const path = require('path');
const { pathToFileURL } = require("url");
const libxmljs = require("libxmljs2");

const config = require("../config");

const xsdPath = config.paths.musicXmlXsd;

function rewriteSchemaLocations(xsdText, xsdFilePath) {
    const xsdDir = path.dirname(xsdFilePath);

    return xsdText.replace(/schemaLocation="([^"]+)"/g, (match, location) => {
        if (!/^https?:\/\//i.test(location)) return match;

        const localCandidate = path.join(xsdDir, path.basename(location));

        if (!fs.existsSync(localCandidate)) return match;

        const fileUrl = pathToFileURL(localCandidate).href;
        return `schemaLocation="${fileUrl}"`;
    });
}

function validateMusicXml(xmlString) {
    try {
        const xmlDoc = libxmljs.parseXml(xmlString);

        let xsdString = fs.readFileSync(xsdPath, "utf8");
        xsdString = rewriteSchemaLocations(xsdString, xsdPath);
        const xsdDoc = libxmljs.parseXml(xsdString);

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
