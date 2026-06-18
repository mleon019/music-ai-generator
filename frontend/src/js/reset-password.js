import { resetPassword, clearAuthUser, clearAuthToken } from "./api";
import { renderAuthNavigation } from "./utils/authNav";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const form = document.getElementById("reset-form");
const status = document.getElementById("reset-status");

if (!token) {
  if (status) {
    status.textContent = "Enlace de restablecimiento inválido o caducado.";
    status.dataset.state = "visible";
  }
  if (form) form.hidden = true;
} else if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const formData = new FormData(form);
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (newPassword !== confirmPassword) {
      setStatus("Las contraseñas no coinciden.");
      return;
    }

    try {
      setStatus("Restableciendo contraseña...");
      await resetPassword(token, newPassword);
      clearAuthUser();
      clearAuthToken();
      setStatus("Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...");
      setTimeout(() => {
        window.location.assign("/login/");
      }, 2000);
    } catch (error) {
      setStatus(error?.message || "No se pudo restablecer la contraseña. Inténtalo de nuevo más tarde.");
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
