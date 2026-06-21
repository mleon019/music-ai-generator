const PDFDocument = require("pdfkit");
const SVGtoPDF = require("svg-to-pdfkit");
const BaseExportStrategy = require("../BaseExportStrategy");

class PdfStrategy extends BaseExportStrategy {
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

  async execute(musicxml) {
    const tk = await this.getToolkit();
    tk.loadData(musicxml);

    const svg = tk.renderToSVG(1, {});

    if (!svg) {
      const error = new Error("No se pudo renderizar la partitura a SVG.");
      error.status = 500;
      throw error;
    }

    const svgWidth = this.extractSvgWidth(svg);
    const svgHeight = this.extractSvgHeight(svg);

    const pageWidth = svgWidth > 0 ? svgWidth + 40 : 595;
    const pageHeight = svgHeight > 0 ? svgHeight + 40 : 842;

    const doc = new PDFDocument({
      size: [pageWidth, pageHeight],
      margin: 20
    });

    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve({
          data: pdfBuffer,
          mimeType: this.getMimeType(),
          filename: this.buildFilename()
        });
      });

      doc.on("error", reject);

      try {
        SVGtoPDF(doc, svg, 20, 20, {
          width: svgWidth > 0 ? svgWidth : pageWidth - 40,
          height: svgHeight > 0 ? svgHeight : pageHeight - 40,
          preserveAspectRatio: "xMinYMin meet"
        });
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  extractSvgWidth(svg) {
    const match = svg.match(/width\s*=\s*["'](\d+(?:\.\d+)?)["']/);
    if (match) {
      return parseFloat(match[1]);
    }
    const viewBoxMatch = svg.match(/viewBox\s*=\s*["'][^"']*["']/);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[0].match(/[\d.]+/g);
      if (parts && parts.length >= 3) {
        return parseFloat(parts[2]);
      }
    }
    return 0;
  }

  extractSvgHeight(svg) {
    const match = svg.match(/height\s*=\s*["'](\d+(?:\.\d+)?)["']/);
    if (match) {
      return parseFloat(match[1]);
    }
    const viewBoxMatch = svg.match(/viewBox\s*=\s*["'][^"']*["']/);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[0].match(/[\d.]+/g);
      if (parts && parts.length >= 4) {
        return parseFloat(parts[3]);
      }
    }
    return 0;
  }

  getFileExtension() {
    return "pdf";
  }

  getMimeType() {
    return "application/pdf";
  }
}

module.exports = PdfStrategy;
