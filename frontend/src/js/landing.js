document.documentElement.classList.add("js-ready");

const lastScoreLink = document.querySelector("[data-last-score]");
const hasScore = Boolean(localStorage.getItem("musicxml"));

if (lastScoreLink && !hasScore) {
  lastScoreLink.classList.add("is-disabled");
  lastScoreLink.setAttribute("aria-disabled", "true");
  lastScoreLink.addEventListener("click", (event) => {
    event.preventDefault();
  });
}
