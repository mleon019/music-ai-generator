import { createIcons, icons } from "lucide";
import { renderAuthNavigation } from "./utils/authNav";
import { getAuthUser } from "./api";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

const user = getAuthUser();

const ctaSecondary = document.getElementById("cta-secondary");
if (ctaSecondary) {
  if (user) {
    ctaSecondary.textContent = "Ir al historial";
    ctaSecondary.href = "/history.html";
  }
}

const cardCta = document.getElementById("card-cta");
if (cardCta && user) {
  cardCta.style.display = "none";
}

createIcons({ icons });
