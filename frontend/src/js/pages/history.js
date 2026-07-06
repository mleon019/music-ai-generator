import "../main";
import { deleteAllScores, deleteScore, exportScore, fetchScores, updateScoreTitle } from "../api/scores";
import { getAuthUser } from "../api/client";
import { setCurrentScoreState } from "../utils/scoreState";
import { downloadBlob } from "../utils/downloadFile";
import { createIcons, icons } from "lucide";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { createSetStatus } from "../utils/status";
import { escapeHtml } from "../utils/html";
import { onClickOutside } from "../utils/clickOutside";
import { createModal } from "../utils/modal";
import { bindModalClose } from "../utils/modalClose";
import { svgToPngBase64, extractBase64 } from "../utils/image";

const list = document.querySelector("[data-history-list]");
const status = document.querySelector("[data-status]");
const deleteAllButton = document.querySelector("[data-delete-all-scores]");
const setStatus = createSetStatus(status);
const deleteModal = document.querySelector("[data-delete-modal]");
const deleteConfirm = document.querySelector("[data-delete-confirm]");
const deleteCancel = document.querySelector("[data-delete-cancel]");
const historyTitle = document.querySelector("[data-history-title]");
const historyCount = document.querySelector("[data-history-count]");
let renderedScores = [];

const authUser = getAuthUser();
if (historyTitle && authUser?.name) {
  historyTitle.textContent = `Historial de ${authUser.name}`;
}

if (deleteAllButton) {
  deleteAllButton.hidden = true;
}

loadScores();

if (deleteAllButton && deleteModal) {
  deleteAllButton.addEventListener("click", () => {
    deleteModal.hidden = false;
  });
  createModal(deleteModal);
}

bindModalClose(deleteModal, [deleteCancel, document.querySelector("[data-delete-close]")].filter(Boolean));

if (deleteConfirm) {
  deleteConfirm.addEventListener("click", handleDeleteAllScores);
}


function startInlineEdit(scoreItem, score) {
  const titleEl = scoreItem.querySelector("[data-score-title]");
  if (!titleEl) return;

  const currentTitle = score.title || "Sin título";
  const h3 = titleEl;

  const editContainer = document.createElement("div");
  editContainer.className = "title-edit";
  editContainer.innerHTML = `
    <input type="text" class="title-input" value="${escapeHtml(currentTitle)}" maxlength="100">
    <div class="title-edit-actions">
      <button class="icon-btn" type="button" data-action="save-title" title="Guardar"><i data-lucide="check" class="icon-sm"></i></button>
      <button class="icon-btn" type="button" data-action="cancel-title" title="Cancelar"><i data-lucide="x" class="icon-sm"></i></button>
    </div>
  `;

  h3.replaceWith(editContainer);
  createIcons({ icons });

  const input = editContainer.querySelector(".title-input");
  const saveBtn = editContainer.querySelector('[data-action="save-title"]');
  const cancelBtn = editContainer.querySelector('[data-action="cancel-title"]');

  input.focus();
  input.select();

  const restoreOriginal = () => {
    if (editContainer.parentNode) {
      const restoredH3 = document.createElement("h3");
      restoredH3.setAttribute("data-score-title", "");
      restoredH3.textContent = currentTitle;
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

  onClickOutside(editContainer, restoreOriginal);
}


function renderScore(score, index) {
    const d = score.createdAt ? new Date(score.createdAt) : null;
  const createdAt = d
    ? `${d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}, ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
    : "";
  const config = score.config || {};

  return `
    <article class="score-item" data-score-id="${escapeHtml(score.id || "")}" data-score-index="${index}">
      <div class="score-item-body">
        <h3 data-score-title>${escapeHtml(score.title || "Sin título")}</h3>
        <div class="score-tags">
          <span class="pill">${escapeHtml(config.instrument || "-")}</span>
          <span class="pill">${escapeHtml(config.timeSignature || "-")}</span>
          <span class="pill">${escapeHtml(String(config.tempo || "-") + " BPM")}</span>
          <span class="pill">${escapeHtml(String(config.measures || "-") + " compases")}</span>
        </div>
        <p class="score-date">${escapeHtml(createdAt)}</p>
      </div>
      <div class="score-actions-right">
        <button class="icon-btn" type="button" data-score-action="view" title="Visualizar partitura"><i data-lucide="eye" class="icon-sm"></i></button>
        <button class="icon-btn" type="button" data-score-action="edit-title" title="Editar título"><i data-lucide="pencil" class="icon-sm"></i></button>
        <div class="score-export-group">
          <button class="export-btn" type="button" data-score-action="export-pdf" title="Descargar PDF">PDF</button>
          <button class="export-btn" type="button" data-score-action="export-midi" title="Descargar MIDI">MIDI</button>
          <button class="export-btn" type="button" data-score-action="export-musicxml" title="Descargar MusicXML">XML</button>
        </div>
        <button class="icon-btn" type="button" data-score-action="delete" title="Eliminar"><i data-lucide="trash-2" class="icon-sm"></i></button>
      </div>
    </article>
  `;
}

async function handleExport(score, format) {
  try {
    if (!score?.musicxml) {
      setStatus("No se pudo exportar esta partitura.");
      return;
    }

    if (format === "pdf") {
      setStatus("Renderizando partitura...");
      const imageBase64 = await renderPdfOffscreen(score.musicxml);
      if (!imageBase64) {
        setStatus("No se pudo generar la imagen de la partitura.");
        return;
      }
      const blob = await exportScore(score.musicxml, format, imageBase64);
      downloadBlob(blob, `partitura-${score.id?.slice(0, 8) || "unknown"}.${format}`);
    } else {
      setStatus(`Exportando .${format}...`);
      const ext = format === "musicxml" ? "musicxml" : format;
      const blob = await exportScore(score.musicxml, format);
      downloadBlob(blob, `partitura-${score.id?.slice(0, 8) || "unknown"}.${ext}`);
    }
    setStatus(`Descargado como .${format === "musicxml" ? "musicxml" : format}`);
  } catch (error) {
    setStatus(error?.message || `Error al exportar .${format}`);
  }
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

  if (!authUser) {
    if (deleteAllButton) deleteAllButton.hidden = true;
    list.innerHTML = "<p class=\"empty-state\">Inicia sesión para ver tu historial.</p>";
    setStatus("");
    updateCount(0);
    createIcons({ icons });
    return;
  }

  try {
    setStatus("Cargando tus partituras...");
    const result = await fetchScores();
    const scores = result?.scores || [];
    renderedScores = scores;
    updateCount(scores.length);

    if (scores.length === 0) {
      if (deleteAllButton) deleteAllButton.hidden = true;
      list.innerHTML = `
        <div class="empty-panel">
          <i data-lucide="music-2" class="empty-icon"></i>
          <p class="empty-title">Sin partituras guardadas</p>
          <p class="empty-subtitle">Tus partituras generadas aparecerán aquí</p>
        </div>
      `;
      setStatus("");
      createIcons({ icons });
      return;
    }

    list.innerHTML = scores.map((score, index) => renderScore(score, index)).join("");
    if (deleteAllButton) deleteAllButton.hidden = false;
    setStatus("");
    createIcons({ icons });
  } catch (error) {
    if (error?.status !== 401) {
      setStatus(error?.message || "No se pudo cargar las partituras. Inténtalo de nuevo más tarde.");
    }
  }
}

function updateCount(count) {
  if (!historyCount) return;
  historyCount.textContent = count === 1 ? "1 partitura guardada" : `${count} partituras guardadas`;
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

  if (action?.startsWith("export-")) {
    const format = action.replace("export-", "");
    await handleExport(score, format);
    return;
  }

  if (action === "edit-title") {
    startInlineEdit(scoreItem, score);
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

async function renderPdfOffscreen(musicxml) {
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;top:0;left:0;width:1000px;opacity:0;pointer-events:none";
  document.body.appendChild(container);

  try {
    const osmd = new OpenSheetMusicDisplay(container, {
      autoResize: true,
      drawTitle: true
    });
    await osmd.load(musicxml);
    osmd.render();

    await new Promise(resolve => requestAnimationFrame(resolve));

    const canvas = container.querySelector("canvas");
    if (canvas) {
      return extractBase64(canvas.toDataURL("image/png", 1.0));
    }

    const svg = container.querySelector("svg");
    if (svg) {
      const dataUrl = await svgToPngBase64(svg);
      return dataUrl ? extractBase64(dataUrl) : null;
    }

    return null;
  } finally {
    document.body.removeChild(container);
  }
}
