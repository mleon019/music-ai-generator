import "../main";
import { registerUser } from "../api/auth";
import { setAuthUser } from "../api/client";
import { validateEmail, validatePassword } from "../utils/validation";
import { createSetStatus } from "../utils/status";

const form = document.querySelector("[data-auth-form]");
const status = document.querySelector("[data-status]");
const setStatus = createSetStatus(status);

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email,
      password
    };

    const emailError = validateEmail(email);
    if (emailError) { setStatus(emailError); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setStatus(passwordError); return; }

    const acceptTerms = form.querySelector("[name='accept-terms']");
    if (!acceptTerms.checked) {
      setStatus("Acepta la Política de Privacidad y los Términos de Uso para continuar.");
      return;
    }

    try {
      setStatus("Creando cuenta...");
      const result = await registerUser(payload);
      setAuthUser(result.user);
      window.location.assign("/history.html");
    } catch (error) {
      setStatus(error?.message || "No se pudo completar el registro. Inténtalo de nuevo más tarde.");
    }
  });
}
