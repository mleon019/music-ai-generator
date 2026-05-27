describe("getBestModesForConfig", () => {
  function loadSelector() {
    jest.resetModules();
    process.env.NODE_ENV = "test";
    return require("../../src/services/modelSelector");
  }

  it("filters rankings to configured models", () => {
    process.env.GROQ_MODELS = "groq/compound-mini";
    const { getBestModesForConfig } = loadSelector();

    const result = getBestModesForConfig(1);

    expect(result).toEqual(["groq/compound-mini"]);
  });

  it("falls back to configured models when no ranking matches", () => {
    process.env.GROQ_MODELS = "custom-model";
    const { getBestModesForConfig } = loadSelector();

    const result = getBestModesForConfig(99);

    expect(result).toEqual(["custom-model"]);
  });
});
