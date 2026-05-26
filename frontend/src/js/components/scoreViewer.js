import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

export function createScoreViewer() {
  const wrapper = document.createElement("div");
  wrapper.className = "score-wrapper";

  const container = document.createElement("div");
  container.className = "score-canvas";
  container.textContent = "No score generated yet.";

  wrapper.appendChild(container);

  async function renderMusicXml(xml) {
    container.textContent = "";
    const osmd = new OpenSheetMusicDisplay(container, {
      autoResize: true,
      drawTitle: true
    });

    await osmd.load(xml);
    osmd.render();
  }

  return {
    element: wrapper,
    renderMusicXml
  };
}
