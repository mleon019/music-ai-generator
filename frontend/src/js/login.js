import { loginUser, setAuthUser, requestPasswordReset, getAuthUser } from "./api";
import { renderAuthNavigation } from "./utils/authNav";
import { validateEmail, validatePassword } from "./utils/validation";
import { createIcons, icons } from "lucide";
import { createSetStatus } from "./utils/status";
import { createModal } from "./utils/modal";

document.documentElement.classList.add("js-ready");

renderAuthNavigation();

const form = document.querySelector("[data-auth-form]");
const status = document.querySelector("[data-status]");
const setStatus = createSetStatus(status);
const modal = document.querySelector("[data-modal]");
const forgotButton = document.querySelector("[data-forgot-password]");
const forgotForm = document.querySelector("[data-forgot-form]");
const forgotEmail = document.querySelector("[data-forgot-email]");
const forgotStatus = document.querySelector("[data-forgot-status]");
const modalClose = document.querySelector("[data-modal-close]");
const modalCancel = document.querySelector("[data-modal-cancel]");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const payload = { email, password };

    const emailError = validateEmail(email);
    if (emailError) { setStatus(emailError); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setStatus(passwordError); return; }

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
  forgotButton.addEventListener("click", (event) => {
    event.preventDefault();
    const user = getAuthUser();
    if (user?.email && forgotEmail) {
      forgotEmail.value = user.email;
    }
    modal.hidden = false;
    createIcons({ icons });
  });
  createModal(modal, {
    onClose: () => {
      if (forgotStatus) forgotStatus.dataset.state = "idle";
    },
  });
}

const closeModal = () => {
  modal.hidden = true;
  if (forgotStatus) forgotStatus.dataset.state = "idle";
};

if (modalClose && modal) {
  modalClose.addEventListener("click", closeModal);
}

if (modalCancel && modal) {
  modalCancel.addEventListener("click", closeModal);
}

if (forgotForm) {
  forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (forgotStatus) {
      forgotStatus.textContent = "Enviando enlace...";
      forgotStatus.dataset.state = "visible";
    }

    const email = String(forgotEmail?.value || "").trim();
    const forgotEmailError = validateEmail(email);

    if (forgotEmailError) {
      if (forgotStatus) {
        forgotStatus.textContent = forgotEmailError;
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

createIcons({ icons });
