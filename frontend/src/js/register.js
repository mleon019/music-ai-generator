import { registerUser, setAuthToken, setAuthUser } from "./api";
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
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "")
    };

    try {
      setStatus("Creando cuenta...");
      const result = await registerUser(payload);
      setAuthToken(result.token);
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
