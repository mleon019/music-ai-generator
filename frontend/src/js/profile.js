import { clearAuthToken, clearAuthUser, deleteAccount, getAuthUser, requestPasswordReset, setAuthUser, updateProfile } from "./api";
import { renderAuthNavigation } from "./utils/authNav";
import { validatePassword } from "./utils/validation";
import { createIcons, icons } from "lucide";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

let authUser = getAuthUser();

// Card 1 - Personal Info
const profileNameDisplay = document.querySelector("[data-profile-name-display]");
const profileNameText = document.querySelector("[data-profile-name-text]");
const profileEmail = document.querySelector("[data-profile-email]");
const nameDisplay = document.querySelector("[data-name-display]");
const nameEdit = document.querySelector("[data-name-edit]");
const nameInput = document.querySelector("[data-name-input]");
const editNameBtn = document.querySelector("[data-edit-name]");
const saveNameBtn = document.querySelector("[data-save-name]");
const cancelNameBtn = document.querySelector("[data-cancel-name]");

// Card 2 - Security
const status = document.querySelector("[data-status]");
const togglePasswordBtn = document.querySelector("[data-toggle-password]");
const passwordMask = document.querySelector("[data-password-mask]");
const currentPasswordField = document.querySelector("[data-current-password-field]");
const newPasswordField = document.querySelector("[data-new-password-field]");
const passwordActions = document.querySelector("[data-password-actions]");
const savePasswordBtn = document.querySelector("[data-save-password]");
const cancelPasswordBtn = document.querySelector("[data-cancel-password]");
const forgotLink = document.querySelector("[data-forgot-password]");

// Card 3 - Danger Zone
const deleteButton = document.querySelector("[data-delete-account]");
const logoutBtn = document.querySelector("[data-logout]");

// Modals
const deleteModal = document.querySelector("[data-delete-modal]");
const deleteConfirm = document.querySelector("[data-delete-confirm]");
const deleteCancel = document.querySelector("[data-delete-cancel]");
const deleteClose = document.querySelector("[data-delete-close]");
const deletePassword = document.querySelector("[data-delete-password]");
const deleteStatus = document.querySelector("[data-delete-status]");
const forgotModal = document.querySelector("[data-forgot-modal]");
const forgotForm = document.querySelector("[data-forgot-form]");
const forgotEmailDisplay = document.querySelector("[data-forgot-email-display]");
const forgotStatus = document.querySelector("[data-forgot-status]");
const forgotCancel = document.querySelector("[data-forgot-cancel]");
const forgotClose = document.querySelector("[data-forgot-close]");

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
  document.querySelectorAll(".panel input, .panel button").forEach((el) => {
    el.disabled = true;
  });
}

// ── Card 1: Inline name edit ──

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

  const handleOutsideClick = (e) => {
    if (!nameEdit?.isConnected) {
      document.removeEventListener("click", handleOutsideClick);
      return;
    }
    if (!nameEdit.hidden && !nameEdit.contains(e.target) && !editNameBtn?.contains(e.target)) {
      cancelNameEdit();
      document.removeEventListener("click", handleOutsideClick);
    }
  };

  editNameBtn?.addEventListener("click", () => {
    setTimeout(() => document.addEventListener("click", handleOutsideClick), 10);
  });
}

// ── Card 2: Password toggle ──

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

// ── Card 2: Forgot password link ──

if (forgotLink && forgotModal && forgotEmailDisplay) {
  forgotLink.addEventListener("click", (event) => {
    event.preventDefault();
    forgotEmailDisplay.textContent = authUser?.email || "";
    forgotModal.hidden = false;
    createIcons({ icons });
  });
}

// ── Card 3: Logout ──

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearAuthToken();
    clearAuthUser();
    sessionStorage.removeItem("currentScoreState");
    window.location.assign("/index.html");
  });
}

// ── Modal: Delete account ──

if (deleteButton && deleteModal) {
  deleteButton.addEventListener("click", () => {
    deleteModal.hidden = false;
    createIcons({ icons });
  });
}

const resetDeleteModal = () => {
  if (deletePassword) deletePassword.value = "";
  if (deleteStatus) deleteStatus.dataset.state = "idle";
};

if (deleteCancel && deleteModal) {
  deleteCancel.addEventListener("click", () => {
    deleteModal.hidden = true;
    resetDeleteModal();
  });
}

if (deleteModal) {
  deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      deleteModal.hidden = true;
      resetDeleteModal();
    }
  });
}

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
      clearAuthToken();
      clearAuthUser();
      sessionStorage.removeItem("currentScoreState");
      window.location.assign("/index.html");
    } catch (error) {
      if (deleteStatus) {
        deleteStatus.textContent = error?.message || "No se pudo eliminar la cuenta. Inténtalo de nuevo más tarde.";
        deleteStatus.dataset.state = "visible";
      }
    }
  });
}

if (deleteClose && deleteModal) {
  deleteClose.addEventListener("click", () => {
    deleteModal.hidden = true;
    resetDeleteModal();
  });
}

// ── Modal: Forgot password ──

if (forgotCancel && forgotModal) {
  forgotCancel.addEventListener("click", () => {
    forgotModal.hidden = true;
    if (forgotStatus) forgotStatus.dataset.state = "idle";
  });
}

if (forgotModal) {
  forgotModal.addEventListener("click", (event) => {
    if (event.target === forgotModal) {
      forgotModal.hidden = true;
      if (forgotStatus) forgotStatus.dataset.state = "idle";
    }
  });
}

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

if (forgotClose && forgotModal) {
  forgotClose.addEventListener("click", () => {
    forgotModal.hidden = true;
    if (forgotStatus) forgotStatus.dataset.state = "idle";
  });
}

createIcons({ icons });

function setStatus(message) {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = message ? "visible" : "idle";
}
