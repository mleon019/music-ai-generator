import "../main";
import { getAuthUser } from "../api/client";
import { createIcons, icons } from "lucide";

const user = getAuthUser();

const ctaSecondary = document.getElementById("cta-secondary");
if (ctaSecondary) {
  if (user) {
    ctaSecondary.textContent = "Ir al historial";
    ctaSecondary.href = "/history";
  }
}

const cardCta = document.getElementById("card-cta");
if (cardCta && user) {
  cardCta.style.display = "none";
}

createIcons({ icons });
