export function createModal(overlayEl, { onClose } = {}) {
  if (!overlayEl) return { close: () => {} };

  const close = () => {
    overlayEl.hidden = true;
    onClose?.();
  };

  overlayEl.addEventListener("click", (event) => {
    if (event.target === overlayEl) close();
  });

  return { close };
}
