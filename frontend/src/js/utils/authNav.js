import { getAuthUser, logout } from "../api";
import { escapeHtml } from "./html";

const PROFILE_ICON = '<i data-lucide="user" class="icon-sm"></i>';

const LOGOUT_ICON = '<i data-lucide="log-out" class="icon-sm"></i>';

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

  bindLogoutButtons();
}

function injectBrandIcon() {
  document.querySelectorAll(".brand").forEach((el) => {
    if (el.querySelector(".brand-icon")) return;
    el.insertAdjacentHTML("afterbegin", '<i data-lucide="music-2" class="brand-icon" style="width:20px;height:20px;flex-shrink:0"></i>');
  });
}

function renderLoggedNavigation(mode, user) {
  if (mode === "hero") {
    return "";
  }

  return `
    <a class="link" href="/form.html">Generar</a>
    <a class="link" href="/history.html">Historial</a>
    <a class="link" href="/profile.html">Perfil</a>
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
      <a class="link" href="/login.html">Iniciar sesión</a>
      <a class="link" href="/register.html">Crear cuenta</a>
    `;
  }

  return `
    <a class="link" href="/form.html">Generar</a>
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
