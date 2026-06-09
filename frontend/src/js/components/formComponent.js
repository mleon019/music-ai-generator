const ALLOWED_TIME_SIGNATURES = ["4/4", "3/4"];
const ALLOWED_INSTRUMENTS = ["Piano", "Violín", "Flauta", "Trompeta"];

function createField(labelText, input) {
  const field = document.createElement("div");
  field.className = "field";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.appendChild(input);

  field.appendChild(label);
  return field;
}

function createSelect(options, defaultValue) {
  const select = document.createElement("select");
  for (const optionText of options) {
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    if (optionText === defaultValue) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  return select;
}

export function createConfigForm({ onSubmit }) {
  const form = document.createElement("form");
  form.className = "config-form";

  const grid = document.createElement("div");
  grid.className = "form-grid";

  const timeSignatureSelect = createSelect(ALLOWED_TIME_SIGNATURES, "4/4");
  const tempoInput = document.createElement("input");
  tempoInput.type = "number";
  tempoInput.min = "40";
  tempoInput.max = "168";
  tempoInput.value = "120";

  const instrumentSelect = createSelect(ALLOWED_INSTRUMENTS, "Piano");
  const measuresInput = document.createElement("input");
  measuresInput.type = "number";
  measuresInput.min = "1";
  measuresInput.max = "16";
  measuresInput.value = "4";

  grid.appendChild(createField("Indicador de compás", timeSignatureSelect));
  grid.appendChild(createField("Tempo (BPM)", tempoInput));
  grid.appendChild(createField("Instrumento", instrumentSelect));
  grid.appendChild(createField("Nº de compases", measuresInput));

  const error = document.createElement("p");
  error.className = "form-error";

  const actions = document.createElement("div");
  actions.className = "form-actions";

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "button primary";
  submitButton.textContent = "Generate";

  actions.appendChild(submitButton);

  form.appendChild(grid);
  form.appendChild(error);
  form.appendChild(actions);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const config = {
      timeSignature: timeSignatureSelect.value,
      tempo: Number(tempoInput.value),
      instrument: instrumentSelect.value,
      measures: Number(measuresInput.value)
    };

    const errors = [];

    if (!ALLOWED_TIME_SIGNATURES.includes(config.timeSignature)) {
      errors.push("Selecciona un indicador de compás válido.");
    }

    if (!Number.isFinite(config.tempo) || config.tempo < 40 || config.tempo > 168) {
      errors.push("El tempo debe estar entre 40 y 168 BPM.");
    }

    if (!ALLOWED_INSTRUMENTS.includes(config.instrument)) {
      errors.push("Seleciona un instrumento aceptado.");
    }

    if (!Number.isFinite(config.measures) || config.measures < 1 || config.measures > 16) {
      errors.push("El número de compases debe estar entre 1 y 16.");
    }

    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }

    onSubmit(config);
  });

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Generando..." : "Generar";
  }

  function setError(message) {
    error.textContent = message;
    error.style.display = message ? "block" : "none";
  }

  setError("");

  return {
    element: form,
    setLoading,
    setError
  };
}
