import { createScoreViewer } from "./components/scoreViewer";

document.documentElement.classList.add("js-ready");

const scoreRoot = document.getElementById("score-root");
const status = document.getElementById("score-status");

if (!scoreRoot) {
  throw new Error("Score root element is missing.");
}

const scoreViewer = createScoreViewer();
scoreRoot.appendChild(scoreViewer.element);

const musicxml = localStorage.getItem("musicxml");

if (!musicxml) {
  setStatus("No saved score yet. Generate one first.");
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

function setStatus(message) {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.state = message ? "visible" : "idle";
}
