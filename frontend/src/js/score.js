import { createScoreViewer } from "./components/scoreViewer";
import { regenerateScore } from "./api";
import { getCurrentScoreState, setCurrentScoreState } from "./scoreState";

document.documentElement.classList.add("js-ready");

const scoreRoot = document.getElementById("score-root");
const status = document.getElementById("score-status");
const regenerateButton = document.getElementById("regenerate-button");

if (!scoreRoot) {
  throw new Error("Score root element is missing.");
}

const scoreViewer = createScoreViewer();
scoreRoot.appendChild(scoreViewer.element);

let scoreState = getCurrentScoreState();
const musicxml = scoreState?.musicxml;

if (regenerateButton) {
  regenerateButton.addEventListener("click", handleRegenerate);
  regenerateButton.disabled = !scoreState?.config;

  if (!scoreState?.config) {
    regenerateButton.title = "Generate or open a score first to enable regeneration.";
  }
}

if (!musicxml) {
  setStatus("No score loaded. Generate one or open one from history.");
} else {
  scoreViewer
    .renderMusicXml(musicxml)
    .then(() => {
      setStatus("MusicXML rendered successfully.");
    })
    .catch((error) => {
      setStatus(error?.message || "Failed to render the score.");
    });
}

async function handleRegenerate() {
  scoreState = getCurrentScoreState();
  const config = scoreState?.config;
  const scoreId = scoreState?.scoreId || null;

  if (!config) {
    setStatus("No score configuration found for the current score.");
    return;
  }

  if (regenerateButton) {
    regenerateButton.disabled = true;
  }

  setStatus("Regenerating score...");

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
    setStatus("Score regenerated successfully.");
  } catch (error) {
    setStatus(error?.message || "Failed to regenerate the score.");
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
