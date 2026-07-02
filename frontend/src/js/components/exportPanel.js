import { exportScore } from "../api/scores";
import { downloadBlob } from "../utils/downloadFile";
import { extractBase64 } from "../utils/image";

const FORMATS = ["musicxml", "midi", "pdf"];
const FORMAT_LABELS = {
  musicxml: "MUSICXML",
  midi: "MIDI",
  pdf: "PDF"
};
const FORMAT_ICONS = {
  musicxml: "file-code-2",
  midi: "file-audio-2",
  pdf: "file-text"
};

export function createExportPanel({ musicxml, getCanvasDataUrl }) {
  const wrapper = document.createElement("div");
  wrapper.className = "export-button-group";

  const statusMsg = document.createElement("span");
  statusMsg.className = "export-status";
  statusMsg.hidden = true;
  wrapper.appendChild(statusMsg);

  FORMATS.forEach((format) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "button ghost";
    btn.innerHTML = `<i data-lucide="${FORMAT_ICONS[format]}" class="icon-sm"></i>${FORMAT_LABELS[format]}`;

    btn.addEventListener("click", async () => {
      await handleExport(format);
    });

    wrapper.appendChild(btn);
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
        const raw = extractBase64(imageBase64);
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
    const btns = wrapper.querySelectorAll(".button");
    btns.forEach(b => b.disabled = isLoading);
  }

  function setStatus(message) {
    statusMsg.textContent = message;
    statusMsg.hidden = !message;
  }

  return { element: wrapper };
}
