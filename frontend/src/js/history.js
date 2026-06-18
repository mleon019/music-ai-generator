import { deleteAllScores, deleteScore, fetchScores, getAuthUser, updateScoreTitle } from "./api";
import { renderAuthNavigation } from "./utils/authNav";
import { setCurrentScoreState } from "./utils/scoreState";

document.documentElement.classList.add("js-ready");
renderAuthNavigation();

const list = document.querySelector("[data-history-list]");
const status = document.querySelector("[data-status]");
const deleteAllButton = document.querySelector("[data-delete-all-scores]");
const deleteModal = document.querySelector("[data-delete-modal]");
const deleteConfirm = document.querySelector("[data-delete-confirm]");
const deleteCancel = document.querySelector("[data-delete-cancel]");
const userName = document.querySelector("[data-user-name]");
let renderedScores = [];

if (deleteAllButton) {
  deleteAllButton.hidden = !getAuthUser();
}

const authUser = getAuthUser();
if (userName) {
  userName.textContent = authUser?.name || "";
}

loadScores();

if (deleteAllButton && deleteModal) {
  deleteAllButton.addEventListener("click", () => {
    deleteModal.hidden = false;
  });
}

if (deleteCancel && deleteModal) {
  deleteCancel.addEventListener("click", () => {
    deleteModal.hidden = true;
  });
}

if (deleteModal) {
  deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      deleteModal.hidden = true;
    }
  });
}

if (deleteConfirm) {
  deleteConfirm.addEventListener("click", handleDeleteAllScores);
}


function startInlineEdit(scoreItem, score) {
  const titleH3 = scoreItem.querySelector("h3");
  if (!titleH3) return;

  const currentTitle = score.title || "Untitled";

  const editContainer = document.createElement("div");
  editContainer.className = "title-edit";
  editContainer.innerHTML = `
    <input type="text" class="title-input" value="${escapeHtml(currentTitle)}" maxlength="100">
    <div class="title-edit-actions">
      <button class="button small" type="button" data-action="save-title">Guardar</button>
      <button class="button small ghost" type="button" data-action="cancel-title">Cancelar</button>
    </div>
  `;

  titleH3.replaceWith(editContainer);

  const input = editContainer.querySelector(".title-input");
  const saveBtn = editContainer.querySelector('[data-action="save-title"]');
  const cancelBtn = editContainer.querySelector('[data-action="cancel-title"]');

  input.focus();
  input.select();

  const restoreOriginal = () => {
    if (editContainer.parentNode) {
      const restoredH3 = document.createElement("h3");
      restoredH3.innerHTML = escapeHtml(currentTitle);
      editContainer.replaceWith(restoredH3);
    }
  };

  const saveTitle = async () => {
    const newTitle = input.value.trim();
    if (!newTitle) {
      restoreOriginal();
      return;
    }

    try {
      setStatus("Actualizando el título...");
      await updateScoreTitle(score.id, newTitle);
      await loadScores();
    } catch (error) {
      setStatus(error?.message || "No se pudo cambiar el título de esta partitura. Inténtalo de nuevo más tarde.");
      restoreOriginal();
    }
  };

  saveBtn.addEventListener("click", saveTitle);
  cancelBtn.addEventListener("click", restoreOriginal);

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await saveTitle();
    } else if (e.key === "Escape") {
      e.preventDefault();
      restoreOriginal();
    }
  });

  const handleOutsideClick = (e) => {
    if (!editContainer.isConnected) {
      document.removeEventListener("click", handleOutsideClick);
      return;
    }
    if (!editContainer.contains(e.target)) {
      restoreOriginal();
      document.removeEventListener("click", handleOutsideClick);
    }
  };

  setTimeout(() => document.addEventListener("click", handleOutsideClick), 10);
}


function renderScore(score, index) {
  const createdAt = score.created_at
    ? new Date(score.created_at).toLocaleString()
    : "";
  const config = score.config || {};

  return `
    <article class="score-item" data-score-id="${escapeHtml(score.id || "")}" data-score-index="${index}">
      <div>
        <h3>${escapeHtml(score.title || "Untitled")}</h3>
        <p class="score-meta">${escapeHtml(createdAt)}</p>
        <div class="score-tags">
          <span class="pill">${escapeHtml(config.instrument || "-")}</span>
          <span class="pill">${escapeHtml(config.timeSignature || "-")}</span>
          <span class="pill">${escapeHtml(String(config.tempo || "-") + " BPM")}</span>
          <span class="pill">${escapeHtml(String(config.measures || "-") + " compases")}</span>
        </div>
      </div>
      <div class="score-actions">
        <button class="button ghost" type="button" data-score-action="view">Visualizar partitura</button>
        <button class="button ghost" type="button" data-score-action="edit-title">Editar título</button>
        <button class="button ghost" type="button" data-score-action="delete">Eliminar</button>
      </div>
    </article>
  `;
}

async function handleDeleteAllScores() {
  if (deleteModal) deleteModal.hidden = true;
  try {
    setStatus("Eliminando todas las partituras...");
    await deleteAllScores();
    await loadScores();
  } catch (error) {
    setStatus(error?.message || "No se pudo eliminar las partituras. Inténtalo de nuevo más tarde.");
  }
}

async function loadScores() {
  if (!list) return;

  if (!getAuthUser()) {
    if (deleteAllButton) deleteAllButton.hidden = true;
    list.innerHTML = "<p class=\"empty-state\">Inicia sesión para ver tu historial.</p>";
    setStatus("");
    return;
  }

  if (deleteAllButton) deleteAllButton.hidden = false;

  try {
    setStatus("Cargando tus partituras...");
    const result = await fetchScores();
    const scores = result?.scores || [];
    renderedScores = scores;

    if (scores.length === 0) {
      list.innerHTML = "<p class=\"empty-state\">Aún no has generado partituras.</p>";
      setStatus("");
      return;
    }

    list.innerHTML = scores.map((score, index) => renderScore(score, index)).join("");
    setStatus("");
  } catch (error) {
    if (error?.status !== 401) {
      setStatus(error?.message || "No se pudo cargar las partituras. Inténtalo de nuevo más tarde.");
    }
  }
}


list?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-score-action]");
  if (!button) return;

  const scoreItem = button.closest(".score-item");
  if (!scoreItem) return;

  const scoreId = scoreItem.getAttribute("data-score-id");
  const scoreIndex = Number(scoreItem.getAttribute("data-score-index"));
  const score = renderedScores[scoreIndex];

  if (!scoreId || !score) {
    setStatus("No se pudo abrir la partitura seleccionada. Inténtalo de nuevo más tarde.");
    return;
  }

  const action = button.getAttribute("data-score-action");

  if (action === "view") {
    if (!score.musicxml || !score.config) {
      setStatus("No se pudo abrir la partitura seleccionada. Inténtalo de nuevo más tarde.");
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
    startInlineEdit(scoreItem, score, scoreIndex);
    return;
  }

  if (action === "delete") {
    try {
      setStatus("Eliminando partitura...");
      await deleteScore(scoreId);
      await loadScores();
    } catch (error) {
      setStatus(error?.message || "No se pudo eliminar la partitura seleccionada. Inténtalo de nuevo más tarde.");
    }
  }
});

function setStatus(message) {
  if (!status) return;
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