import { exportScore } from "../api";
import { downloadBlob } from "../utils/downloadFile";

const FORMATS = ["musicxml", "midi", "pdf"];

export function createExportPanel({ musicxml, getCanvasDataUrl }) {
  const wrapper = document.createElement("div");
  wrapper.className = "export-inline-group";

  const label = document.createElement("span");
  label.className = "export-label";
  label.textContent = "Descargar:";
  wrapper.appendChild(label);

  const statusMsg = document.createElement("span");
  statusMsg.className = "export-status";
  statusMsg.hidden = true;
  wrapper.appendChild(statusMsg);

  const pillGroup = document.createElement("span");
  pillGroup.className = "export-pill-group";
  wrapper.appendChild(pillGroup);

  FORMATS.forEach((format) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "export-pill";
    pill.textContent = `.${format}`;

    pill.addEventListener("click", async () => {
      await handleExport(format);
    });

    pillGroup.appendChild(pill);
  });

  async function handleExport(format) {
    setLoading(true);
    setStatus(`Exportando .${format}...`);

    try {
      if (format === "pdf") {
        const imageBase64 = await getCanvasDataUrl?.();
        if (!imageBase64) {
          setStatus("No se pudo capturar la imagen de la partitura.");
          return;
        }
        const raw = imageBase64.split("base64,")[1] || imageBase64;
        const blob = await exportScore(musicxml, format, raw);
        downloadBlob(blob, `partitura.${format}`);
      } else {
        const blob = await exportScore(musicxml, format);
        downloadBlob(blob, `partitura.${format}`);
      }
      setStatus(`Descargado como .${format}`);
    } catch (error) {
      setStatus(error?.message || `Error al exportar .${format}`);
    } finally {
      setLoading(false);
    }
  }

  function setLoading(isLoading) {
    const pills = pillGroup.querySelectorAll(".export-pill");
    pills.forEach(p => p.disabled = isLoading);
  }

  function setStatus(message) {
    statusMsg.textContent = message;
    statusMsg.hidden = !message;
  }

  return { element: wrapper };
}
