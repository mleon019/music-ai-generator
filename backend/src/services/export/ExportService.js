const MusicXmlStrategy = require("./strategies/MusicXmlStrategy");
const MidiStrategy = require("./strategies/MidiStrategy");
const PdfStrategy = require("./strategies/PdfStrategy");

class ExportService {
  constructor() {
    this.strategies = new Map();
    this.register("musicxml", new MusicXmlStrategy());
    this.register("midi", new MidiStrategy());
    this.register("pdf", new PdfStrategy());
  }

  register(format, strategy) {
    this.strategies.set(format, strategy);
  }

  async export({ musicxml, format, imageBase64 }) {
    const strategy = this.strategies.get(format);

    if (!strategy) {
      const error = new Error(`Formato no soportado: "${format}". Los formatos disponibles son: musicxml, midi, pdf.`);
      error.status = 400;
      throw error;
    }

    return strategy.execute({ musicxml, imageBase64 });
  }
}

module.exports = new ExportService();
