import { getAuthUser, logout } from "../api/client";
import { escapeHtml } from "./html";
import { createIcons, icons } from "lucide";

const PROFILE_ICON = '<i data-lucide="user" class="icon-md"></i>';
const LOGOUT_ICON = '<i data-lucide="log-out" class="icon-md"></i>';

const LEGAL_LINKS = [
  { href: "/legal/aviso-legal/", label: "Aviso Legal" },
  { href: "/legal/politica-privacidad/", label: "Política de Privacidad" },
  { href: "/legal/politica-cookies/", label: "Política de Cookies" },
  { href: "/legal/terminos-uso/", label: "Términos de Uso" },
  { href: "/legal/informacion-ia/", label: "Información sobre IA" },
];

function renderLegalDropdown() {
  const items = LEGAL_LINKS
    .map((l) => `<a class="dropdown-item" href="${l.href}">${l.label}</a>`)
    .join("");
  return `
    <div class="dropdown">
      <a class="link dropdown-toggle">Legal</a>
      <div class="dropdown-menu">${items}</div>
    </div>`;
}

export function renderAuthNavigation() {
  injectBrandIcon();

  const isAuthenticated = Boolean(getAuthUser());
  const user = getAuthUser();

  document.querySelectorAll("[data-auth-nav]").forEach((container) => {
    const mode = container.getAttribute("data-auth-nav") || "topbar";
    container.innerHTML = isAuthenticated
      ? renderLoggedNavigation(mode, user)
      : renderGuestNavigation(mode);
  });

  highlightActiveLink();
  bindLogoutButtons();
  createIcons({ icons });
}

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".topbar-actions-links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const pageName = href.replace(/\.html$/, "");
    if (currentPath.startsWith(pageName)) {
      link.classList.add("active");
    }
  });
}

function injectBrandIcon() {
  document.querySelectorAll(".brand").forEach((el) => {
    if (el.querySelector(".brand-icon")) return;
    el.insertAdjacentHTML("afterbegin", '<i data-lucide="music-2" class="brand-icon"></i>');
  });
}

function renderLoggedNavigation(mode, user) {
  if (mode === "hero") {
    return "";
  }

  return `
    <div class="topbar-actions-links">
      <a class="link" href="/form.html">Generar</a>
      <a class="link" href="/history.html">Historial</a>
      <a class="link" href="/profile.html">Perfil</a>
      ${renderLegalDropdown()}
    </div>
    <div class="topbar-actions-right">
      <a class="link icon-link" href="/profile.html" aria-label="Mi perfil">
        ${PROFILE_ICON}
        <span>${escapeHtml(user?.name || "Mi perfil")}</span>
      </a>
      <button class="link-button" type="button" data-logout aria-label="Cerrar sesión">
        ${LOGOUT_ICON}
      </button>
    </div>
  `;
}

function renderGuestNavigation(mode) {
  if (mode === "hero") {
    return `
      <div class="topbar-actions-links">
        ${renderLegalDropdown()}
      </div>
      <div class="topbar-actions-right">
        <a class="link" href="/login.html">Iniciar sesión</a>
        <a class="link" href="/register.html">Crear cuenta</a>
      </div>
    `;
  }

  return `
    <div class="topbar-actions-links">
      <a class="link" href="/form.html">Generar</a>
      ${renderLegalDropdown()}
    </div>
    <div class="topbar-actions-right">
      <a class="link" href="/login.html">Iniciar sesión</a>
      <a class="button primary" href="/register.html">Crear cuenta</a>
    </div>
  `;
}

function bindLogoutButtons() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", logout);
  });
}
