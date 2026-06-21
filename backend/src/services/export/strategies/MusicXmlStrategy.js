const BaseExportStrategy = require("../BaseExportStrategy");

class MusicXmlStrategy extends BaseExportStrategy {
  async execute(musicxml) {
    return {
      data: Buffer.from(musicxml, "utf-8"),
      mimeType: this.getMimeType(),
      filename: this.buildFilename()
    };
  }

  getFileExtension() {
    return "musicxml";
  }

  getMimeType() {
    return "application/vnd.recordare.musicxml+xml";
  }
}

module.exports = MusicXmlStrategy;
