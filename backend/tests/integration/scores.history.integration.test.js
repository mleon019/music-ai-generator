process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tfg";
process.env.DB_RETRY_ATTEMPTS = process.env.DB_RETRY_ATTEMPTS || "5";
process.env.DB_RETRY_DELAY_MS = process.env.DB_RETRY_DELAY_MS || "500";

jest.setTimeout(20000);

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

const payload = {
  config: {
    timeSignature: "4/4",
    tempo: 120,
    instrument: "Piano",
    measures: 4
  }
};

const sampleXml = "<score-partwise version=\"4.0\"></score-partwise>";

describe("Scores history integration", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await resetDatabase();
    generateMusicXml.mockResolvedValue({ xml: sampleXml });
    validateMusicXml.mockReturnValue({ valid: true, errors: [] });
  });

  afterAll(async () => {
    await pool.end();
  });

  it("stores generated scores for authenticated users", async () => {
    const email = `ana+${randomUUID()}@example.com`;
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ana", email, password: "secret123" });

    const cookie = extractAuthCookie(registerResponse);

    const generateResponse = await request(app)
      .post("/api/scores/generate")
      .set("Cookie", cookie)
      .send(payload);

    expect(generateResponse.status).toBe(200);

    const historyResponse = await request(app)
      .get("/api/scores")
      .set("Cookie", cookie);

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.scores).toHaveLength(1);
    expect(historyResponse.body.scores[0].musicxml).toBe(sampleXml);
  });

  function extractAuthCookie(res) {
    const cookies = res.headers["set-cookie"];
    if (!cookies || !cookies[0]) return "";
    return cookies[0].split(";")[0];
  }
});
