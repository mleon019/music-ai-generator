import { registerUser, setAuthUser } from "./api";
import { renderAuthNavigation } from "./utils/authNav";
import { validateEmail, validatePassword } from "./utils/validation";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

const form = document.querySelector("[data-auth-form]");
const status = document.querySelector("[data-status]");

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

function setStatus(message) {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.state = message ? "visible" : "idle";
}
