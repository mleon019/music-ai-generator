process.env.NODE_ENV = "test";
process.env.GROQ_MAX_RETRIES = "1";
process.env.GROQ_MODELS = "groq/compound-mini";

jest.mock("../../src/services/groqService", () => ({
  generateMusicXml: jest.fn()
}));

jest.mock("../../src/services/xmlService", () => ({
  validateMusicXml: jest.fn()
}));

const request = require("supertest");
const app = require("../../app");
const { generateMusicXml } = require("../../src/services/groqService");
const { validateMusicXml } = require("../../src/services/xmlService");

const validPayload = {
  config: {
    timeSignature: "4/4",
    tempo: 120,
    instrument: "Piano",
    measures: 4
  }
};

const sampleXml = "<score-partwise version=\"4.0\"></score-partwise>";

describe("POST /api/scores/generate", () => {
  let logSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("returns 400 for invalid config", async () => {
    const response = await request(app).post("/api/scores/generate").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("config must be an object");
    expect(generateMusicXml).not.toHaveBeenCalled();
  });

  it("returns 200 for a valid score", async () => {
    generateMusicXml.mockResolvedValue({ xml: sampleXml });
    validateMusicXml.mockReturnValue({ valid: true, errors: [] });

    const response = await request(app)
      .post("/api/scores/generate")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body.musicxml).toBe(sampleXml);
  });

  it("retries when validation fails and returns 422", async () => {
    generateMusicXml.mockResolvedValue({ xml: sampleXml });
    validateMusicXml.mockReturnValue({ valid: false, errors: ["invalid"] });

    const response = await request(app)
      .post("/api/scores/generate")
      .send(validPayload);

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("MusicXML failed validation");
    expect(generateMusicXml).toHaveBeenCalledTimes(2);
  });

  it("retries on 429 and returns 422", async () => {
    const rateError = Object.assign(new Error("Rate limit"), { status: 429 });
    generateMusicXml.mockRejectedValueOnce(rateError).mockRejectedValueOnce(rateError);

    const response = await request(app)
      .post("/api/scores/generate")
      .send(validPayload);

    expect(response.status).toBe(422);
    expect(generateMusicXml).toHaveBeenCalledTimes(2);
    expect(validateMusicXml).not.toHaveBeenCalled();
  });

  it("retries on 413 and succeeds on the next attempt", async () => {
    const sizeError = Object.assign(new Error("Too large"), { status: 413 });
    generateMusicXml
      .mockRejectedValueOnce(sizeError)
      .mockResolvedValueOnce({ xml: sampleXml });
    validateMusicXml.mockReturnValue({ valid: true, errors: [] });

    const response = await request(app)
      .post("/api/scores/generate")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body.musicxml).toBe(sampleXml);
    expect(generateMusicXml).toHaveBeenCalledTimes(2);
  });

  it("returns 502 for non-retryable errors", async () => {
    const error = Object.assign(new Error("Boom"), { status: 500 });
    generateMusicXml.mockRejectedValueOnce(error);

    const response = await request(app)
      .post("/api/scores/generate")
      .send(validPayload);

    expect(response.status).toBe(502);
    expect(response.body.error).toBe("Internal server error");
  });
});
