import "../main";
import { createScoreViewer } from "../components/scoreViewer";
import { createExportPanel } from "../components/exportPanel";
import { createIcons, icons } from "lucide";
import { regenerateScore } from "../api/scores";
import { getCurrentScoreState, setCurrentScoreState } from "../utils/scoreState";
import { createSetStatus } from "../utils/status";

const scoreRoot = document.getElementById("score-root");
const exportRoot = document.getElementById("export-root");
const status = document.getElementById("score-status");
const regenerateButton = document.getElementById("regenerate-button");

if (!scoreRoot) {
  throw new Error("Hubo un problema con la partitura. Inténtalo de nuevo más tarde.");
}

const setStatus = createSetStatus(status);

const scoreViewer = createScoreViewer();
scoreRoot.appendChild(scoreViewer.element);
createIcons({ icons });

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
      createIcons({ icons });
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
    createIcons({ icons });
    setStatus("Partitura generada correctamente.");
  } catch (error) {
    setStatus(error?.message || "No se pudo generar la partitura. Inténtalo de nuevo más tarde.");
  } finally {
    if (regenerateButton) {
      regenerateButton.disabled = false;
    }
  }
}
