import { getAuthToken } from "./api";

document.documentElement.classList.add("js-ready");

const lastScoreLink = document.querySelector("[data-last-score]");
const historyLink = document.querySelector("[data-history]");
const hasScore = Boolean(localStorage.getItem("musicxml"));
const hasAuth = Boolean(getAuthToken());

if (lastScoreLink && !hasScore) {
  lastScoreLink.classList.add("is-disabled");
  lastScoreLink.setAttribute("aria-disabled", "true");
  lastScoreLink.addEventListener("click", (event) => {
    event.preventDefault();
  });
}

if (historyLink && !hasAuth) {
  historyLink.classList.add("is-disabled");
  historyLink.setAttribute("aria-disabled", "true");
  historyLink.addEventListener("click", (event) => {
    event.preventDefault();
  });
}
