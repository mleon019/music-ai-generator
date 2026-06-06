import { clearAuthToken, clearAuthUser, deleteAccount, getAuthUser, setAuthToken, setAuthUser, updateProfile } from "./api";
import { renderAuthNavigation } from "./authNav";

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
  setStatus("Please sign in to view your profile.");
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
      setStatus("Name is required.");
      return;
    }

    if (!payload.currentPassword) {
      delete payload.currentPassword;
    }

    if (!payload.newPassword) {
      delete payload.newPassword;
    }

    try {
      setStatus("Saving profile...");
      const result = await updateProfile(payload);
      setAuthToken(result.token);
      setAuthUser(result.user);
      renderAuthNavigation();
      if (email) {
        email.textContent = result.user?.email || "";
      }
      setStatus("Profile updated successfully.");
      form.reset();
      if (form.querySelector('input[name="name"]')) {
        form.querySelector('input[name="name"]').value = result.user?.name || "";
      }
    } catch (error) {
      setStatus(error?.message || "Failed to update profile.");
    }
  });
}

if (deleteButton) {
  deleteButton.addEventListener("click", async () => {
    const confirmed = window.confirm("Delete your account and all saved scores? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      setStatus("Deleting account...");
      await deleteAccount();
      clearAuthToken();
      clearAuthUser();
      sessionStorage.removeItem("currentScoreState");
      window.location.assign("/index.html");
    } catch (error) {
      setStatus(error?.message || "Failed to delete account.");
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