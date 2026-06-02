import { getAuthToken } from "./api";

document.documentElement.classList.add("js-ready");

const historyLink = document.querySelector("[data-history]");
const hasAuth = Boolean(getAuthToken());

if (historyLink && !hasAuth) {
  historyLink.classList.add("is-disabled");
  historyLink.setAttribute("aria-disabled", "true");
  historyLink.addEventListener("click", (event) => {
    event.preventDefault();
  });
}
