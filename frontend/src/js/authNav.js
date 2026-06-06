import { clearAuthToken, clearAuthUser, getAuthToken, getAuthUser } from "./api";

const PROFILE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 12.5a4.5 4.5 0 1 0-4.5-4.5 4.5 4.5 0 0 0 4.5 4.5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" fill="currentColor" />
  </svg>
`;

export function renderAuthNavigation() {
  const isAuthenticated = Boolean(getAuthToken());
  const user = getAuthUser();

  document.querySelectorAll("[data-auth-nav]").forEach((container) => {
    const mode = container.getAttribute("data-auth-nav") || "topbar";
    container.innerHTML = isAuthenticated
      ? renderLoggedNavigation(mode, user)
      : renderGuestNavigation(mode);
  });

  bindLogoutButtons();
}

function renderLoggedNavigation(mode, user) {
  if (mode === "hero") {
    return `
      <a class="link" href="/history.html">History</a>
      <a class="link icon-link" href="/profile.html" aria-label="Profile">
        ${PROFILE_ICON}
        <span>${escapeHtml(user?.name || "Profile")}</span>
      </a>
      <button class="link link-button" type="button" data-logout>Logout</button>
    `;
  }

  return `
    <a class="link" href="/form.html">Generate</a>
    <a class="link" href="/history.html">History</a>
    <a class="link icon-link" href="/profile.html" aria-label="Profile">
      ${PROFILE_ICON}
      <span>Profile</span>
    </a>
    <button class="button ghost" type="button" data-logout>Logout</button>
  `;
}

function renderGuestNavigation(mode) {
  if (mode === "hero") {
    return `
      <a class="link" href="/login.html">Login</a>
      <a class="link" href="/register.html">Create account</a>
    `;
  }

  return `
    <a class="link" href="/login.html">Login</a>
    <a class="link" href="/register.html">Create account</a>
  `;
}

function bindLogoutButtons() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      clearAuthToken();
      clearAuthUser();
      sessionStorage.removeItem("currentScoreState");
      window.location.assign("/index.html");
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}