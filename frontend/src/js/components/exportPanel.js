import { exportScore } from "../api";
import { downloadBlob } from "../utils/downloadFile";

const FORMATS = ["musicxml", "midi", "pdf"];

export function createExportPanel({ musicxml }) {
  const wrapper = document.createElement("div");
  wrapper.className = "export-panel";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button ghost export-trigger";
  button.textContent = "Exportar partitura";
  wrapper.appendChild(button);

  const dropdown = document.createElement("div");
  dropdown.className = "export-dropdown";
  dropdown.hidden = true;
  wrapper.appendChild(dropdown);

  const statusMsg = document.createElement("p");
  statusMsg.className = "export-status";
  statusMsg.hidden = true;
  wrapper.appendChild(statusMsg);

  FORMATS.forEach((format) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "export-option";
    option.textContent = format === "musicxml" ? "MusicXML (.musicxml)" : `${format.toUpperCase()} (.${format})`;

    option.addEventListener("click", async () => {
      dropdown.hidden = true;
      await handleExport(format);
    });

    dropdown.appendChild(option);
  });

  button.addEventListener("click", () => {
    dropdown.hidden = !dropdown.hidden;
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      dropdown.hidden = true;
    }
  });

  async function handleExport(format) {
    setStatus(`Exportando a ${format.toUpperCase()}...`);
    setLoading(true);

    try {
      const blob = await exportScore(musicxml, format);
      const ext = format === "musicxml" ? "musicxml" : format;
      downloadBlob(blob, `partitura.${ext}`);
      setStatus(`Partitura exportada como .${format}`);
    } catch (error) {
      setStatus(error?.message || `No se pudo exportar a ${format}.`);
    } finally {
      setLoading(false);
    }
  }

  function setLoading(isLoading) {
    const options = dropdown.querySelectorAll(".export-option");
    options.forEach(opt => {
      opt.disabled = isLoading;
    });
  }

  function setStatus(message) {
    statusMsg.textContent = message;
    statusMsg.hidden = !message;
    statusMsg.dataset.state = message ? "visible" : "idle";
  }

  return { element: wrapper };
}
