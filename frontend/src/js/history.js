import { clearAuthToken, fetchScores, getAuthUser, getAuthToken } from "./api";

document.documentElement.classList.add("js-ready");

const list = document.querySelector("[data-history-list]");
const status = document.querySelector("[data-status]");
const logoutButton = document.querySelector("[data-logout]");
const userName = document.querySelector("[data-user-name]");

const authUser = getAuthUser();
if (userName) {
  userName.textContent = authUser?.name || "";
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    clearAuthToken();
    localStorage.removeItem("authUser");
    window.location.assign("/login.html");
  });
}

loadScores();

async function loadScores() {
  if (!list) {
    return;
  }

  if (!getAuthToken()) {
    list.innerHTML = "<p class=\"empty-state\">Please log in to view your history.</p>";
    setStatus("");
    return;
  }

  try {
    setStatus("Loading your scores...");
    const result = await fetchScores();
    const scores = result?.scores || [];

    if (scores.length === 0) {
      list.innerHTML = "<p class=\"empty-state\">No saved scores yet.</p>";
      setStatus("");
      return;
    }

    list.innerHTML = scores.map(renderScore).join("");
    setStatus("");

    list.querySelectorAll("[data-view-score]").forEach((button) => {
      button.addEventListener("click", () => {
        const xml = button.getAttribute("data-musicxml");
        if (xml) {
          localStorage.setItem("musicxml", xml);
          window.location.assign("/score.html");
        }
      });
    });
  } catch (error) {
    if (error?.status === 401) {
      list.innerHTML = "<p class=\"empty-state\">Session expired. Please log in again.</p>";
      setStatus("");
      return;
    }

    setStatus(error?.message || "Failed to load scores.");
  }
}

function renderScore(score) {
  const createdAt = score.created_at
    ? new Date(score.created_at).toLocaleString()
    : "";
  const config = score.config || {};

  return `
    <article class="score-item">
      <div>
        <h3>${escapeHtml(score.title || "Untitled")}</h3>
        <p class="score-meta">${escapeHtml(createdAt)}</p>
        <div class="score-tags">
          <span class="pill">${escapeHtml(config.instrument || "-")}</span>
          <span class="pill">${escapeHtml(config.timeSignature || "-")}</span>
          <span class="pill">${escapeHtml(String(config.tempo || "-") + " BPM")}</span>
          <span class="pill">${escapeHtml(String(config.measures || "-") + " measures")}</span>
        </div>
      </div>
      <button class="button ghost" data-view-score data-musicxml="${escapeHtml(score.musicxml || "")}">View</button>
    </article>
  `;
}

function setStatus(message) {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.state = message ? "visible" : "idle";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
