import "../main";
import { resetPassword } from "../api/auth";
import { clearAuthUser, clearAuthToken } from "../api/client";
import { validatePassword } from "../utils/validation";
import { createSetStatus } from "../utils/status";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const form = document.getElementById("reset-form");
const status = document.getElementById("reset-status");
const setStatus = createSetStatus(status);

if (!token) {
  setStatus("Enlace de restablecimiento inválido o caducado.");
  if (form) form.hidden = true;
} else if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const formData = new FormData(form);
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const passwordError = validatePassword(newPassword);
    if (passwordError) { setStatus(passwordError); return; }

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
