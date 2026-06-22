import { createScoreViewer } from "./components/scoreViewer";
import { createExportPanel } from "./components/exportPanel";
import { regenerateScore } from "./api";
import { renderAuthNavigation } from "./utils/authNav";
import { getCurrentScoreState, setCurrentScoreState } from "./utils/scoreState";

document.documentElement.classList.add("js-ready");
renderAuthNavigation();

const scoreRoot = document.getElementById("score-root");
const exportRoot = document.getElementById("export-root");
const status = document.getElementById("score-status");
const regenerateButton = document.getElementById("regenerate-button");

if (!scoreRoot) {
  throw new Error("Hubo un problema con la partitura. Inténtalo de nuevo más tarde.");
}

const scoreViewer = createScoreViewer();
scoreRoot.appendChild(scoreViewer.element);

let scoreState = getCurrentScoreState();
const musicxml = scoreState?.musicxml;

if (regenerateButton) {
  regenerateButton.addEventListener("click", handleRegenerate);
  regenerateButton.disabled = !scoreState?.config;

  if (!scoreState?.config) {
    regenerateButton.title = "Genera o abre una partitura existente primero para regenerarla.";
  }
}

if (!musicxml) {
  setStatus("No se pudo cargar ninguna partitura. Genera una nueva o abre una desde tu historial.");
} else {
  scoreViewer
    .renderMusicXml(musicxml)
    .then(() => {
      setStatus("Partitura generada correctamente.");
      mountExportPanel(musicxml);
    })
    .catch((error) => {
      setStatus(error?.message || "No se pudo visualizar la partitura. Inténtalo de nuevo más tarde.");
    });
}

function mountExportPanel(currentMusicxml) {
  if (!exportRoot) return;
  exportRoot.innerHTML = "";

  const exportPanel = createExportPanel({
    musicxml: currentMusicxml,
    getCanvasDataUrl: () => scoreViewer.getCanvasDataUrl()
  });
  exportRoot.appendChild(exportPanel.element);
}

async function handleRegenerate() {
  scoreState = getCurrentScoreState();
  const config = scoreState?.config;
  const scoreId = scoreState?.scoreId || null;

  if (!config) {
    setStatus("No se pudo encontrar la configuración utilizada en esta partitura.");
    return;
  }

  if (regenerateButton) {
    regenerateButton.disabled = true;
  }

  setStatus("Regenerando partitura...");

  try {
    const result = await regenerateScore(config, scoreId);

    if (!result?.musicxml) {
      throw new Error("No MusicXML returned from the server.");
    }

    scoreState = {
      musicxml: result.musicxml,
      config,
      scoreId: result.id || scoreId || null
    };
    setCurrentScoreState(scoreState);

    await scoreViewer.renderMusicXml(result.musicxml);
    mountExportPanel(result.musicxml);
    setStatus("Partitura generada correctamente.");
  } catch (error) {
    setStatus(error?.message || "No se pudo generar la partitura. Inténtalo de nuevo más tarde.");
  } finally {
    if (regenerateButton) {
      regenerateButton.disabled = false;
    }
  }
}

function setStatus(message) {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.state = message ? "visible" : "idle";
}
