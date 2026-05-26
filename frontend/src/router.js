import { renderGeneratePage } from "./pages/generate";

const routes = {
  "/": renderGeneratePage,
  "/generate": renderGeneratePage
};

function getRoute() {
  const hash = window.location.hash || "#/generate";
  return hash.replace("#", "");
}

export function initRouter(root) {
  function renderRoute() {
    const route = getRoute();
    const render = routes[route] || routes["/"];
    root.innerHTML = "";
    render(root);
  }

  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("load", renderRoute);

  if (!window.location.hash) {
    window.location.hash = "#/generate";
  }

  renderRoute();
}
