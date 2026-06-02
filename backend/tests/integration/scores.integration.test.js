process.env.NODE_ENV = "test";
process.env.GROQ_MAX_RETRIES = "1";
process.env.GROQ_MODELS = "groq/compound-mini";
process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tfg";
process.env.DB_RETRY_ATTEMPTS = process.env.DB_RETRY_ATTEMPTS || "5";
process.env.DB_RETRY_DELAY_MS = process.env.DB_RETRY_DELAY_MS || "500";

jest.setTimeout(20000);

// Mocks comunes
jest.mock("../../src/services/groqService", () => ({
  generateMusicXml: jest.fn()
}));

jest.mock("../../src/services/xmlService", () => ({
  validateMusicXml: jest.fn()
}));

const request = require("supertest");
const { randomUUID } = require("crypto");
const app = require("../../app");
const { generateMusicXml } = require("../../src/services/groqService");
const { validateMusicXml } = require("../../src/services/xmlService");
const { pool, runMigrations, resetDatabase } = require("../helpers/db");

const sampleXml = "<score-partwise version=\"4.0\"></score-partwise>";
const newSampleXml = "<score-partwise version=\"4.0\"><new/></score-partwise>";

const validPayload = {
  config: {
    timeSignature: "4/4",
    tempo: 120,
    instrument: "Piano",
    measures: 4
  }
};

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

describe("POST /api/scores/regenerate", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await resetDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("works like generate for anonymous users", async () => {
    generateMusicXml.mockResolvedValue({ xml: sampleXml });
    validateMusicXml.mockReturnValue({ valid: true, errors: [] });

    const response = await request(app)
      .post("/api/scores/regenerate")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body.musicxml).toBe(sampleXml);
    // anonymous regenerate should not expose an id
    expect(response.body.id).toBeFalsy();
  });

  it("updates existing score when authenticated", async () => {
    // register user
    const email = `maria+${randomUUID()}@example.com`;
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({ name: "Maria", email, password: "secret123" });

    const token = registerResponse.body.token;

    // initial generation returns first xml
    generateMusicXml.mockResolvedValueOnce({ xml: sampleXml });
    validateMusicXml.mockReturnValue({ valid: true, errors: [] });

    const genResp = await request(app)
      .post("/api/scores/generate")
      .set("Authorization", `Bearer ${token}`)
      .send(validPayload);

    expect(genResp.status).toBe(200);
    expect(genResp.body.id).toBeTruthy();
    const scoreId = genResp.body.id;

    // prepare regenerate to return a new xml
    generateMusicXml.mockResolvedValueOnce({ xml: newSampleXml });

    const regenResp = await request(app)
      .post("/api/scores/regenerate")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validPayload, id: scoreId });

    expect(regenResp.status).toBe(200);
    expect(regenResp.body.id).toBe(scoreId);
    expect(regenResp.body.musicxml).toBe(newSampleXml);

    // confirm DB was updated
    const historyResp = await request(app)
      .get("/api/scores")
      .set("Authorization", `Bearer ${token}`);

    expect(historyResp.status).toBe(200);
    expect(historyResp.body.scores).toHaveLength(1);
    expect(historyResp.body.scores[0].id).toBe(scoreId);
    expect(historyResp.body.scores[0].musicxml).toBe(newSampleXml);
  });
});
