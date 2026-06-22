const BaseExportStrategy = require("../BaseExportStrategy");

class MidiStrategy extends BaseExportStrategy {
  constructor() {
    super();
    this.toolkitPromise = null;
  }

  async getToolkit() {
    if (!this.toolkitPromise) {
      this.toolkitPromise = (async () => {
        const createVerovioModule = require("verovio/wasm").default;
        const { VerovioToolkit } = require("verovio/esm");
        const verovioModule = await createVerovioModule();
        return new VerovioToolkit(verovioModule);
      })();
    }
    return this.toolkitPromise;
  }

  async execute({ musicxml }) {
    const tk = await this.getToolkit();
    tk.loadData(musicxml);
    const midiBase64 = tk.renderToMIDI();

    if (!midiBase64) {
      const error = new Error("No se pudo generar el archivo MIDI a partir del MusicXML.");
      error.status = 500;
      throw error;
    }

    const midiBuffer = Buffer.from(midiBase64, "base64");

    return {
      data: midiBuffer,
      mimeType: this.getMimeType(),
      filename: this.buildFilename()
    };
  }

  getFileExtension() {
    return "midi";
  }

  getMimeType() {
    return "audio/midi";
  }
}

module.exports = MidiStrategy;
