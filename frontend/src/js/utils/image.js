export function svgToPngBase64(svg, scale = 2) {
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = img.naturalWidth * scale;
      tmpCanvas.height = img.naturalHeight * scale;
      const ctx = tmpCanvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(tmpCanvas.toDataURL("image/png", 1.0));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function extractBase64(dataUrl) {
  return dataUrl.split("base64,")[1] || dataUrl;
}
