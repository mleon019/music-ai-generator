const { PDFDocument } = require("pdf-lib");
const BaseExportStrategy = require("../BaseExportStrategy");

class PdfStrategy extends BaseExportStrategy {
  async execute({ _musicxml, imageBase64 }) {
    if (!imageBase64) {
      const error = new Error("Para exportar a PDF es necesario enviar la imagen renderizada de la partitura desde el frontend.");
      error.status = 400;
      throw error;
    }

    const raw = imageBase64.includes("base64,")
      ? imageBase64.split("base64,")[1]
      : imageBase64;

    let pngBuffer;
    try {
      pngBuffer = Buffer.from(raw, "base64");
    } catch {
      const error = new Error("La imagen proporcionada no es un base64 válido.");
      error.status = 400;
      throw error;
    }

    const doc = await PDFDocument.create();
    const pngImage = await doc.embedPng(pngBuffer);

    const page = doc.addPage([pngImage.width, pngImage.height]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngImage.width,
      height: pngImage.height
    });

    const pdfBytes = await doc.save();

    return {
      data: Buffer.from(pdfBytes),
      mimeType: this.getMimeType(),
      filename: this.buildFilename()
    };
  }

  getFileExtension() {
    return "pdf";
  }

  getMimeType() {
    return "application/pdf";
  }
}

module.exports = PdfStrategy;
