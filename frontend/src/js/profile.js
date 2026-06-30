import { clearAuthToken, clearAuthUser, deleteAccount, getAuthUser, requestPasswordReset, setAuthUser, updateProfile } from "./api";
import { renderAuthNavigation } from "./utils/authNav";
import { validatePassword } from "./utils/validation";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

const form = document.querySelector("[data-profile-form]");
const status = document.querySelector("[data-status]");
const email = document.querySelector("[data-profile-email]");
const deleteButton = document.querySelector("[data-delete-account]");
const resetPasswordButton = document.querySelector("[data-reset-password]");
const deleteModal = document.querySelector("[data-delete-modal]");
const deleteConfirm = document.querySelector("[data-delete-confirm]");
const deleteCancel = document.querySelector("[data-delete-cancel]");
const forgotModal = document.querySelector("[data-forgot-modal]");
const forgotForm = document.querySelector("[data-forgot-form]");
const forgotEmail = document.querySelector("[data-forgot-email]");
const forgotStatus = document.querySelector("[data-forgot-status]");
const forgotCancel = document.querySelector("[data-forgot-cancel]");

const authUser = getAuthUser();

if (email) {
  email.textContent = authUser?.email || "";
}

if (form && authUser) {
  const nameInput = form.querySelector('input[name="name"]');
  if (nameInput) {
    nameInput.value = authUser.name || "";
  }
}

if (!authUser) {
  setStatus("Por favor, inicia sesión primero para ver tu perfil.");
  if (form) {
    form.querySelectorAll("input, button").forEach((element) => {
      element.disabled = true;
    });
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      currentPassword: String(formData.get("currentPassword") || ""),
      newPassword: String(formData.get("newPassword") || "")
    };

    if (!payload.name) {
      setStatus("El nombre es necesario.");
      return;
    }

    if (!payload.currentPassword) {
      delete payload.currentPassword;
    }

    if (payload.newPassword) {
      const passwordError = validatePassword(payload.newPassword);
      if (passwordError) { setStatus(passwordError); return; }
    } else {
      delete payload.newPassword;
    }

    try {
      setStatus("Guardando cambios en el perfil...");
      const result = await updateProfile(payload);
      setAuthUser(result.user);
      renderAuthNavigation();
      if (email) {
        email.textContent = result.user?.email || "";
      }
      setStatus("Perfil actualizado con éxito.");
      form.reset();
      if (form.querySelector('input[name="name"]')) {
        form.querySelector('input[name="name"]').value = result.user?.name || "";
      }
    } catch (error) {
      setStatus(error?.message || "No se pudo actualizar los datos del perfil. Inténtalo de nuevo más tarde.");
    }
  });
}

if (deleteButton && deleteModal) {
  deleteButton.addEventListener("click", () => {
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
  deleteConfirm.addEventListener("click", async () => {
    deleteModal.hidden = true;
    try {
      setStatus("Eliminando cuenta...");
      await deleteAccount();
      clearAuthToken();
      clearAuthUser();
      sessionStorage.removeItem("currentScoreState");
      window.location.assign("/index.html");
    } catch (error) {
      setStatus(error?.message || "No se pudo eliminar la cuenta. Inténtalo de nuevo más tarde.");
    }
  });
}

if (resetPasswordButton && forgotModal && forgotEmail) {
  resetPasswordButton.addEventListener("click", () => {
    forgotEmail.value = authUser?.email || "";
    forgotModal.hidden = false;
  });
}

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

    const email = String(forgotEmail?.value || "").trim();

    if (!email) {
      if (forgotStatus) {
        forgotStatus.textContent = "Introduce tu correo electrónico.";
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

function setStatus(message) {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.state = message ? "visible" : "idle";
}
