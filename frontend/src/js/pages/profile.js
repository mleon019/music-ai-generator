import "../main";
import { renderAuthNavigation } from "../utils/authNav";
import { deleteAccount, requestPasswordReset, updateProfile } from "../api/auth";
import { getAuthUser, logout, setAuthUser } from "../api/client";
import { validatePassword } from "../utils/validation";
import { createIcons, icons } from "lucide";
import { createSetStatus } from "../utils/status";
import { onClickOutside } from "../utils/clickOutside";
import { createModal } from "../utils/modal";
import { bindModalClose } from "../utils/modalClose";

let authUser = getAuthUser();


const profileNameDisplay = document.querySelector("[data-profile-name-display]");
const profileNameText = document.querySelector("[data-profile-name-text]");
const profileEmail = document.querySelector("[data-profile-email]");
const nameDisplay = document.querySelector("[data-name-display]");
const nameEdit = document.querySelector("[data-name-edit]");
const nameInput = document.querySelector("[data-name-input]");
const editNameBtn = document.querySelector("[data-edit-name]");
const saveNameBtn = document.querySelector("[data-save-name]");
const cancelNameBtn = document.querySelector("[data-cancel-name]");


const status = document.querySelector("[data-status]");
const setStatus = createSetStatus(status);
const togglePasswordBtn = document.querySelector("[data-toggle-password]");
const passwordMask = document.querySelector("[data-password-mask]");
const currentPasswordField = document.querySelector("[data-current-password-field]");
const newPasswordField = document.querySelector("[data-new-password-field]");
const passwordActions = document.querySelector("[data-password-actions]");
const savePasswordBtn = document.querySelector("[data-save-password]");
const cancelPasswordBtn = document.querySelector("[data-cancel-password]");
const forgotLink = document.querySelector("[data-forgot-password]");


const deleteButton = document.querySelector("[data-delete-account]");
const logoutBtn = document.querySelector("[data-logout]");


const deleteModal = document.querySelector("[data-delete-modal]");
const deleteConfirm = document.querySelector("[data-delete-confirm]");
const deletePassword = document.querySelector("[data-delete-password]");
const deleteStatus = document.querySelector("[data-delete-status]");
const forgotModal = document.querySelector("[data-forgot-modal]");
const forgotForm = document.querySelector("[data-forgot-form]");
const forgotEmailDisplay = document.querySelector("[data-forgot-email-display]");
const forgotStatus = document.querySelector("[data-forgot-status]");

function renderUserData() {
  if (!authUser) return;
  if (profileNameDisplay) profileNameDisplay.textContent = authUser.name || "";
  if (profileNameText) profileNameText.textContent = authUser.name || "";
  if (profileEmail) profileEmail.value = authUser.email || "";
  if (nameInput) nameInput.value = authUser.name || "";
}

if (authUser) {
  renderUserData();
} else {
  setStatus("Por favor, inicia sesión primero para ver tu perfil.");
}


const cancelNameEdit = () => {
  if (nameDisplay) nameDisplay.hidden = false;
  if (nameEdit) nameEdit.hidden = true;
  if (nameInput && authUser) nameInput.value = authUser.name || "";
};

const startNameEdit = () => {
  if (nameDisplay) nameDisplay.hidden = true;
  if (nameEdit) {
    nameEdit.hidden = false;
    nameInput?.focus();
    nameInput?.select();
  }
};

if (editNameBtn) {
  editNameBtn.addEventListener("click", startNameEdit);
}

if (cancelNameBtn) {
  cancelNameBtn.addEventListener("click", cancelNameEdit);
}

if (saveNameBtn && nameInput) {
  saveNameBtn.addEventListener("click", async () => {
    const newName = nameInput.value.trim();
    if (!newName || newName === authUser?.name) {
      cancelNameEdit();
      return;
    }

    try {
      const result = await updateProfile({ name: newName });
      setAuthUser(result.user);
      authUser = result.user;
      renderAuthNavigation();
      if (profileNameDisplay) profileNameDisplay.textContent = result.user?.name || "";
      if (profileNameText) profileNameText.textContent = result.user?.name || "";
      cancelNameEdit();
    } catch (error) {
      setStatus(error?.message || "No se pudo actualizar el nombre.");
    }
  });
}

if (nameInput) {
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveNameBtn?.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelNameEdit();
    }
  });

  editNameBtn?.addEventListener("click", () => {
    if (nameEdit) onClickOutside(nameEdit, cancelNameEdit);
  });
}


if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", () => {
    if (passwordMask) passwordMask.hidden = true;
    if (currentPasswordField) currentPasswordField.hidden = false;
    if (newPasswordField) newPasswordField.hidden = false;
    if (passwordActions) passwordActions.hidden = false;
  });
}

if (savePasswordBtn) {
  savePasswordBtn.addEventListener("click", async () => {
    const currentPw = currentPasswordField?.querySelector("input")?.value || "";
    const newPw = newPasswordField?.querySelector("input")?.value || "";

    if (!currentPw) {
      setStatus("Introduce tu contraseña actual.");
      return;
    }

    const passwordError = validatePassword(newPw);
    if (passwordError) { setStatus(passwordError); return; }

    try {
      setStatus("Guardando cambios...");
      const result = await updateProfile({ currentPassword: currentPw, newPassword: newPw });
      setAuthUser(result.user);
      authUser = result.user;
      renderAuthNavigation();

      if (currentPasswordField) {
        currentPasswordField.hidden = true;
        const inp = currentPasswordField.querySelector("input");
        if (inp) inp.value = "";
      }
      if (newPasswordField) {
        newPasswordField.hidden = true;
        const inp = newPasswordField.querySelector("input");
        if (inp) inp.value = "";
      }
      if (passwordActions) passwordActions.hidden = true;
      if (passwordMask) passwordMask.hidden = false;

      setStatus("Contraseña actualizada con éxito.");
    } catch (error) {
      setStatus(error?.message || "No se pudo actualizar la contraseña.");
    }
  });
}

const resetPasswordEdit = () => {
  if (currentPasswordField) {
    currentPasswordField.hidden = true;
    const inp = currentPasswordField.querySelector("input");
    if (inp) inp.value = "";
  }
  if (newPasswordField) {
    newPasswordField.hidden = true;
    const inp = newPasswordField.querySelector("input");
    if (inp) inp.value = "";
  }
  if (passwordActions) passwordActions.hidden = true;
  if (passwordMask) passwordMask.hidden = false;
  setStatus("");
};

if (cancelPasswordBtn) {
  cancelPasswordBtn.addEventListener("click", resetPasswordEdit);
}


const resetForgotModal = () => {
  if (forgotStatus) forgotStatus.dataset.state = "idle";
};

if (forgotLink && forgotModal && forgotEmailDisplay) {
  forgotLink.addEventListener("click", (event) => {
    event.preventDefault();
    forgotEmailDisplay.textContent = authUser?.email || "";
    forgotModal.hidden = false;
    createIcons({ icons });
  });
  createModal(forgotModal, { onClose: resetForgotModal });
}


if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}


const resetDeleteModal = () => {
  if (deletePassword) deletePassword.value = "";
  if (deleteStatus) deleteStatus.dataset.state = "idle";
};

if (deleteButton && deleteModal) {
  deleteButton.addEventListener("click", () => {
    deleteModal.hidden = false;
    createIcons({ icons });
  });
  createModal(deleteModal, { onClose: resetDeleteModal });
}

bindModalClose(deleteModal, [
  document.querySelector("[data-delete-cancel]"),
  document.querySelector("[data-delete-close]"),
].filter(Boolean));

if (deleteConfirm) {
  deleteConfirm.addEventListener("click", async () => {
    const password = deletePassword?.value || "";
    if (!password) {
      if (deleteStatus) {
        deleteStatus.textContent = "Introduce tu contraseña para confirmar.";
        deleteStatus.dataset.state = "visible";
      }
      return;
    }

    try {
      if (deleteStatus) deleteStatus.dataset.state = "idle";
      await deleteAccount(password);
      logout();
    } catch (error) {
      if (deleteStatus) {
        deleteStatus.textContent = error?.message || "No se pudo eliminar la cuenta. Inténtalo de nuevo más tarde.";
        deleteStatus.dataset.state = "visible";
      }
    }
  });
}


bindModalClose(forgotModal, [
  document.querySelector("[data-forgot-cancel]"),
  document.querySelector("[data-forgot-close]"),
].filter(Boolean));

if (forgotForm) {
  forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (forgotStatus) {
      forgotStatus.textContent = "Enviando enlace...";
      forgotStatus.dataset.state = "visible";
    }

    const email = authUser?.email || "";

    if (!email) {
      if (forgotStatus) {
        forgotStatus.textContent = "No se encontró tu correo electrónico.";
        forgotStatus.dataset.state = "visible";
      }
      return;
    }

    try {
      await requestPasswordReset(email);
      if (forgotStatus) {
        forgotStatus.textContent = "Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.";
        forgotStatus.dataset.state = "visible";
      }
    } catch (error) {
      if (forgotStatus) {
        forgotStatus.textContent = error?.message || "No se pudo enviar el enlace. Inténtalo de nuevo más tarde.";
        forgotStatus.dataset.state = "visible";
      }
    }
  });
}

createIcons({ icons });
