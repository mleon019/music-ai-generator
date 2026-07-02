export function bindModalClose(modal, triggers) {
  if (!modal) return;
  const close = () => { modal.hidden = true; };
  triggers.forEach(el => { if (el) el.addEventListener("click", close); });
}
