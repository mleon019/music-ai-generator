import { clearAuthToken, clearAuthUser, deleteAccount, getAuthUser, setAuthToken, setAuthUser, updateProfile } from "./api";
import { renderAuthNavigation } from "./utils/authNav";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

const form = document.querySelector("[data-profile-form]");
const status = document.querySelector("[data-status]");
const email = document.querySelector("[data-profile-email]");
const deleteButton = document.querySelector("[data-delete-account]");

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

    if (!payload.newPassword) {
      delete payload.newPassword;
    }

    try {
      setStatus("Guardando cambios en el perfil...");
      const result = await updateProfile(payload);
      setAuthToken(result.token);
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

if (deleteButton) {
  deleteButton.addEventListener("click", async () => {

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

function setStatus(message) {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.state = message ? "visible" : "idle";
}