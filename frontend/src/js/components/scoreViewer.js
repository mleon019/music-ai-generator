import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

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

  function svgToPngBase64(svg) {
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = img.naturalWidth * 2;
        tmpCanvas.height = img.naturalHeight * 2;
        const ctx = tmpCanvas.getContext("2d");
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(tmpCanvas.toDataURL("image/png", 1.0));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  return {
    element: wrapper,
    renderMusicXml,
    getCanvasDataUrl
  };
}
