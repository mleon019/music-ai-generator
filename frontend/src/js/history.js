import { deleteAllScores, deleteScore, fetchScores, getAuthToken, getAuthUser, updateScoreTitle } from "./api";
import { renderAuthNavigation } from "./authNav";
import { setCurrentScoreState } from "./scoreState";

document.documentElement.classList.add("js-ready");
renderAuthNavigation();

const list = document.querySelector("[data-history-list]");
const status = document.querySelector("[data-status]");
const deleteAllButton = document.querySelector("[data-delete-all-scores]");
const userName = document.querySelector("[data-user-name]");
let renderedScores = [];

if (deleteAllButton) {
  deleteAllButton.hidden = !getAuthToken();
}

const authUser = getAuthUser();
if (userName) {
  userName.textContent = authUser?.name || "";
}

loadScores();

if (deleteAllButton) {
  deleteAllButton.addEventListener("click", handleDeleteAllScores);
}

async function loadScores() {
  if (!list) {
    return;
  }

  if (!getAuthToken()) {
    if (deleteAllButton) {
      deleteAllButton.hidden = true;
    }
    list.innerHTML = "<p class=\"empty-state\">Please log in to view your history.</p>";
    setStatus("");
    return;
  }

  if (deleteAllButton) {
    deleteAllButton.hidden = false;
  }

  try {
    setStatus("Loading your scores...");
    const result = await fetchScores();
    const scores = result?.scores || [];
    renderedScores = scores;

    if (scores.length === 0) {
      list.innerHTML = "<p class=\"empty-state\">No saved scores yet.</p>";
      setStatus("");
      return;
    }

    list.innerHTML = scores.map((score, index) => renderScore(score, index)).join("");
    setStatus("");
  } catch (error) {
    if (error?.status === 401) {
      list.innerHTML = "<p class=\"empty-state\">Session expired. Please log in again.</p>";
      setStatus("");
      return;
    }

    setStatus(error?.message || "Failed to load scores.");
  }
}

function renderScore(score, index) {
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
      <div class="score-actions" data-score-id="${escapeHtml(score.id || "")}" data-score-index="${index}">
        <button class="button ghost" type="button" data-score-action="view">View</button>
        <button class="button ghost" type="button" data-score-action="edit-title">Edit title</button>
        <button class="button ghost" type="button" data-score-action="delete">Delete</button>
      </div>
    </article>
  `;
}

async function handleDeleteAllScores() {
  const confirmed = window.confirm("Delete all your saved scores? This cannot be undone.");
  if (!confirmed) {
    return;
  }

  try {
    setStatus("Deleting all scores...");
    await deleteAllScores();
    await loadScores();
  } catch (error) {
    setStatus(error?.message || "Failed to delete scores.");
  }
}

list?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-score-action]");
  if (!button) {
    return;
  }

  const container = button.closest("[data-score-id]");
  if (!container) {
    return;
  }

  const scoreId = container.getAttribute("data-score-id");
  const scoreIndex = Number(container.getAttribute("data-score-index"));
  const score = renderedScores[scoreIndex];

  if (!scoreId || !score) {
    setStatus("Unable to open selected score.");
    return;
  }

  const action = button.getAttribute("data-score-action");

  if (action === "view") {
    if (!score.musicxml || !score.config) {
      setStatus("Unable to open selected score.");
      return;
    }

    setCurrentScoreState({
      musicxml: score.musicxml,
      config: score.config,
      scoreId: score.id || null
    });

    window.location.assign("/score.html");
    return;
  }

  if (action === "edit-title") {
    const nextTitle = window.prompt("New title", score.title || "");
    if (nextTitle === null) {
      return;
    }

    try {
      setStatus("Updating title...");
      await updateScoreTitle(scoreId, nextTitle);
      await loadScores();
    } catch (error) {
      setStatus(error?.message || "Failed to update title.");
    }
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm("Delete this score?");
    if (!confirmed) {
      return;
    }

    try {
      setStatus("Deleting score...");
      await deleteScore(scoreId);
      await loadScores();
    } catch (error) {
      setStatus(error?.message || "Failed to delete score.");
    }
  }
});

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
