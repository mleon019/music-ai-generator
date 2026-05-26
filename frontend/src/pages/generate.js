import { generateScore } from "../api";
import { createConfigForm } from "../components/form";
import { createScoreViewer } from "../components/score";

export function renderGeneratePage(root) {
  const container = document.createElement("div");
  container.className = "container";

  const header = document.createElement("header");
  header.className = "page-header";
  header.innerHTML = "<h1>MusicXML Generator</h1><p>Create a short score with a few inputs and render it instantly.</p>";

  const formCard = document.createElement("div");
  formCard.className = "card";

  const scoreCard = document.createElement("div");
  scoreCard.className = "card";

  const status = document.createElement("p");
  status.className = "status";

  const scoreViewer = createScoreViewer();
  scoreCard.appendChild(scoreViewer.element);
  scoreCard.appendChild(status);

  const formControls = createConfigForm({
    onSubmit: async (config) => {
      status.textContent = "";
      formControls.setError("");
      formControls.setLoading(true);

      try {
        const result = await generateScore(config);
        await scoreViewer.renderMusicXml(result.musicxml);
        status.textContent = "MusicXML rendered successfully.";
      } catch (error) {
        formControls.setError(error.message || "Failed to generate score.");
      } finally {
        formControls.setLoading(false);
      }
    }
  });

  formCard.appendChild(formControls.element);
  container.appendChild(header);
  container.appendChild(formCard);
  container.appendChild(scoreCard);
  root.appendChild(container);
}
