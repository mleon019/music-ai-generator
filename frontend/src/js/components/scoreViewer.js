import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { svgToPngBase64 } from "../utils/image";

export function createScoreViewer() {
  const wrapper = document.createElement("div");
  wrapper.className = "score-wrapper";

  const container = document.createElement("div");
  container.className = "score-canvas";
  container.textContent = "No hay ninguna partitura aún.";

  wrapper.appendChild(container);

  async function renderMusicXml(xml) {
    container.textContent = "";
    const osmd = new OpenSheetMusicDisplay(container, {
      autoResize: true,
      drawTitle: false
    });

    await osmd.load(xml);
    osmd.render();
  }

  async function getCanvasDataUrl() {
    await new Promise(resolve => requestAnimationFrame(resolve));

    const canvas = container.querySelector("canvas");
    if (canvas) {
      return canvas.toDataURL("image/png", 1.0);
    }

    const svg = container.querySelector("svg");
    if (svg) {
      return svgToPngBase64(svg);
    }

    return null;
  }

  return {
    element: wrapper,
    renderMusicXml,
    getCanvasDataUrl
  };
}
