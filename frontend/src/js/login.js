import { loginUser, setAuthUser } from "./api";
import { renderAuthNavigation } from "./utils/authNav";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

const form = document.querySelector("[data-auth-form]");
const status = document.querySelector("[data-status]");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "")
    };

    try {
      setStatus("Iniciando sesión...");
      const result = await loginUser(payload);
      setAuthUser(result.user);
      window.location.assign("/history.html");
    } catch (error) {
      setStatus(error?.message || "No se pudo iniciar sesión. Inténtalo de nuevo más tarde.");
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
