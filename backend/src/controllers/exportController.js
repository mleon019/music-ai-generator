const ExportService = require("../services/export/ExportService");

async function exportScore(req, res, next) {
  try {
    const { musicxml, format } = req.body;

    if (!musicxml) {
      const error = new Error("El campo 'musicxml' es obligatorio.");
      error.status = 400;
      throw error;
    }

    if (!format) {
      const error = new Error("El campo 'format' es obligatorio. Formatos disponibles: musicxml, midi, pdf.");
      error.status = 400;
      throw error;
    }

    const result = await ExportService.export({ musicxml, format });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.setHeader("Content-Length", result.data.length);

    return res.send(result.data);
  } catch (error) {
    return next(error);
  }
}

module.exports = { exportScore };
