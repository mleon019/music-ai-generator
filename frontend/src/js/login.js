import { loginUser, setAuthUser, requestPasswordReset, getAuthUser } from "./api";
import { renderAuthNavigation } from "./utils/authNav";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

const form = document.querySelector("[data-auth-form]");
const status = document.querySelector("[data-status]");
const modal = document.querySelector("[data-modal]");
const forgotButton = document.querySelector("[data-forgot-password]");
const forgotForm = document.querySelector("[data-forgot-form]");
const forgotEmail = document.querySelector("[data-forgot-email]");
const forgotStatus = document.querySelector("[data-forgot-status]");
const modalClose = document.querySelector("[data-modal-close]");

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

if (forgotButton && modal) {
  forgotButton.addEventListener("click", () => {
    const user = getAuthUser();
    if (user?.email && forgotEmail) {
      forgotEmail.value = user.email;
    }
    modal.hidden = false;
  });
}

if (modalClose && modal) {
  modalClose.addEventListener("click", () => {
    modal.hidden = true;
    if (forgotStatus) forgotStatus.dataset.state = "idle";
  });
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.hidden = true;
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
        forgotStatus.textContent = "Si el correo existe, recibirás un enlace para restablecer tu contraseña.";
        forgotStatus.dataset.state = "visible";
      }
      if (forgotEmail) forgotEmail.value = "";
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
