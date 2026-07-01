import { createIcons, icons } from "lucide";

const ALLOWED_TIME_SIGNATURES = ["3/4", "4/4"];
const ALLOWED_INSTRUMENTS = ["Piano", "Violín", "Flauta", "Trompeta"];

function createRangeField({ label, min, max, step, value, leftLabel, rightLabel, marks }) {
  const field = document.createElement("div");
  field.className = "field range-field";

  const labelEl = document.createElement("label");
  labelEl.className = "range-label";
  labelEl.textContent = label;
  field.appendChild(labelEl);

  const valueDisplay = document.createElement("output");
  valueDisplay.className = "range-value";
  valueDisplay.textContent = value;
  field.appendChild(valueDisplay);

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  if (step !== undefined) input.step = String(step);
  input.value = String(value);
  input.className = "range-input";
  field.appendChild(input);

  const labels = document.createElement("div");
  labels.className = "range-labels";

  if (leftLabel) {
    const left = document.createElement("span");
    left.className = "range-label-start";
    left.textContent = leftLabel;
    labels.appendChild(left);
  }

  if (rightLabel) {
    const right = document.createElement("span");
    right.className = "range-label-end";
    right.textContent = rightLabel;
    labels.appendChild(right);
  }

  if (marks) {
    const marksContainer = document.createElement("div");
    marksContainer.className = "range-marks";
    for (const m of marks) {
      const mark = document.createElement("span");
      mark.className = "range-mark";
      mark.textContent = String(m);
      marksContainer.appendChild(mark);
    }
    field.appendChild(marksContainer);
  }

  field.appendChild(labels);

  input.addEventListener("input", () => {
    valueDisplay.textContent = input.value;
  });

  return { element: field, input };
}

function createSelectField(label, options, defaultValue) {
  const field = document.createElement("div");
  field.className = "field";

  const labelEl = document.createElement("label");
  labelEl.className = "field-label";
  labelEl.textContent = label;

  const select = document.createElement("select");
  select.className = "field-select";
  for (const opt of options) {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    if (opt === defaultValue) option.selected = true;
    select.appendChild(option);
  }

  labelEl.appendChild(select);
  field.appendChild(labelEl);
  return { element: field, select };
}

function createTimeSignatureGroup(options, defaultValue) {
  const field = document.createElement("div");
  field.className = "field";

  const labelEl = document.createElement("label");
  labelEl.className = "field-label";
  labelEl.textContent = "Indicador de compás";
  field.appendChild(labelEl);

  const group = document.createElement("div");
  group.className = "time-signature-group";

  let selectedValue = defaultValue;

  for (const opt of options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time-signature-btn";
    btn.textContent = opt;
    if (opt === defaultValue) btn.classList.add("active");

    btn.addEventListener("click", () => {
      group.querySelectorAll(".time-signature-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedValue = opt;
    });

    group.appendChild(btn);
  }

  field.appendChild(group);

  return {
    element: field,
    getValue: () => selectedValue
  };
}

export function createConfigForm({ onSubmit }) {
  const form = document.createElement("form");
  form.className = "config-form";

  const instrument = createSelectField("Instrumento", ALLOWED_INSTRUMENTS, "Piano");

  const tempo = createRangeField({
    label: "Tempo",
    min: 40,
    max: 168,
    value: 100,
    leftLabel: "40 Largo",
    rightLabel: "168 Presto"
  });

  const timeSignature = createTimeSignatureGroup(ALLOWED_TIME_SIGNATURES, "4/4");

  const duration = createRangeField({
    label: "Duración",
    min: 1,
    max: 16,
    step: 1,
    value: 8,
    marks: [1, 4, 8, 12, 16]
  });

  const error = document.createElement("p");
  error.className = "form-error";

  const actions = document.createElement("div");
  actions.className = "form-actions";

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "button primary";
  submitButton.innerHTML = '<i data-lucide="music-2" class="icon-sm"></i><span>Generar partitura</span>';

  actions.appendChild(submitButton);

  form.appendChild(instrument.element);
  form.appendChild(tempo.element);
  form.appendChild(timeSignature.element);
  form.appendChild(duration.element);
  form.appendChild(error);
  form.appendChild(actions);

  createIcons({ icons, attrs: { "aria-hidden": "true" } });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const config = {
      timeSignature: timeSignature.getValue(),
      tempo: Number(tempo.input.value),
      instrument: instrument.select.value,
      measures: Number(duration.input.value)
    };

    const errors = [];

    if (!ALLOWED_TIME_SIGNATURES.includes(config.timeSignature)) {
      errors.push("Selecciona un indicador de compás válido.");
    }

    if (!Number.isFinite(config.tempo) || config.tempo < 40 || config.tempo > 168) {
      errors.push("El tempo debe estar entre 40 y 168 BPM.");
    }

    if (!ALLOWED_INSTRUMENTS.includes(config.instrument)) {
      errors.push("Selecciona un instrumento aceptado.");
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
    const span = submitButton.querySelector("span");
    if (span) span.textContent = isLoading ? "Generando..." : "Generar partitura";
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
