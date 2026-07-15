import "../main";
import { generateScore } from "../api/scores";
import { createConfigForm } from "../components/formComponent";
import { setCurrentScoreState } from "../utils/scoreState";
import { createSetStatus } from "../utils/status";

const formRoot = document.getElementById("form-root");
const status = document.getElementById("status-message");

if (!formRoot) {
  throw new Error("Form root element is missing.");
}

const setStatus = createSetStatus(status);

const formControls = createConfigForm({
  onSubmit: handleSubmit
});

formRoot.appendChild(formControls.element);

async function handleSubmit(config) {
  setStatus("Generando partitura...");
  formControls.setError("");
  formControls.setLoading(true);

  try {
    const result = await generateScore(config);
    if (!result || !result.musicxml) {
      throw new Error("No MusicXML returned from the server.");
    }

    setCurrentScoreState({
      musicxml: result.musicxml,
      config,
      scoreId: result.id || null
    });
    window.location.assign("/score");
  } catch (error) {
    formControls.setError(error?.message || "No se pudo generar la partitura. Inténtalo de nuevo más tarde.");
    setStatus("");
  } finally {
    formControls.setLoading(false);
  }
}
