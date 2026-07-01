export function createSetStatus(statusEl) {
  return function setStatus(message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = message ? "visible" : "idle";
  };
}
