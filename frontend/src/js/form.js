import { generateScore } from "./api";
import { createConfigForm } from "./components/formComponent";

document.documentElement.classList.add("js-ready");

const formRoot = document.getElementById("form-root");
const status = document.getElementById("status-message");

if (!formRoot) {
  throw new Error("Form root element is missing.");
}

const formControls = createConfigForm({
  onSubmit: handleSubmit
});

formRoot.appendChild(formControls.element);

function setStatus(message) {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.state = message ? "visible" : "idle";
}

async function handleSubmit(config) {
  setStatus("Generating MusicXML...");
  formControls.setError("");
  formControls.setLoading(true);

  try {
    const result = await generateScore(config);
    if (!result || !result.musicxml) {
      throw new Error("No MusicXML returned from the server.");
    }

    localStorage.setItem("musicxml", result.musicxml);
    localStorage.setItem("scoreConfig", JSON.stringify(config));
    window.location.assign("/score.html");
  } catch (error) {
    formControls.setError(error?.message || "Failed to generate score.");
    setStatus("");
  } finally {
    formControls.setLoading(false);
  }
}
