export function onClickOutside(element, callback) {
  const handler = (e) => {
    if (!element.isConnected) {
      document.removeEventListener("click", handler);
      return;
    }
    if (!element.contains(e.target)) {
      callback();
      document.removeEventListener("click", handler);
    }
  };
  setTimeout(() => document.addEventListener("click", handler), 10);
}
