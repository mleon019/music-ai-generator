process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tfg";
process.env.DB_RETRY_ATTEMPTS = process.env.DB_RETRY_ATTEMPTS || "5";
process.env.DB_RETRY_DELAY_MS = process.env.DB_RETRY_DELAY_MS || "500";

jest.setTimeout(20000);

const request = require("supertest");
const { randomUUID } = require("crypto");
const app = require("../../app");
const { pool, runMigrations, resetDatabase } = require("../helpers/db");

describe("Auth integration", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("registers and logs in a user", async () => {
    const email = `ana+${randomUUID()}@example.com`;
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ana", email, password: "secret123" });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.headers["set-cookie"]).toBeDefined();
    expect(registerResponse.headers["set-cookie"][0]).toContain("authToken=");
    expect(registerResponse.body.token).toBeUndefined();
    expect(registerResponse.body.user.email).toBe(email);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "secret123" });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers["set-cookie"]).toBeDefined();
    expect(loginResponse.headers["set-cookie"][0]).toContain("authToken=");
    expect(loginResponse.body.token).toBeUndefined();
    expect(loginResponse.body.user.name).toBe("Ana");
  });
});
