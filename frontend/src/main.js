import "./style.css";
import { initRouter } from "./router";

const root = document.getElementById("app");

if (root) {
  initRouter(root);
}
