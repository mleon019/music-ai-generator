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
      .send({ name: "Ana", email, password: "Secret123" });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.headers["set-cookie"]).toBeDefined();
    expect(registerResponse.headers["set-cookie"][0]).toContain("authToken=");
    expect(registerResponse.body.token).toBeUndefined();
    expect(registerResponse.body.user.email).toBe(email);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Secret123" });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers["set-cookie"]).toBeDefined();
    expect(loginResponse.headers["set-cookie"][0]).toContain("authToken=");
    expect(loginResponse.body.token).toBeUndefined();
    expect(loginResponse.body.user.name).toBe("Ana");
  });

  it("returns 409 when registering a duplicate email", async () => {
    const email = `dup+${randomUUID()}@example.com`;
    await request(app)
      .post("/api/auth/register")
      .send({ name: "First", email, password: "Secret123" });

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "Second", email, password: "Secret123" });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("Email already registered");
  });

  it("logs out a user", async () => {
    const email = `logout+${randomUUID()}@example.com`;
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({ name: "Luis", email, password: "Secret123" });

    const cookie = registerResponse.headers["set-cookie"][0].split(";")[0];

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookie);

    expect(logoutResponse.status).toBe(204);
  });

  it("updates profile when authenticated", async () => {
    const email = `upd+${randomUUID()}@example.com`;
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({ name: "Original", email, password: "Secret123" });

    const cookie = registerResponse.headers["set-cookie"][0].split(";")[0];

    const profileResponse = await request(app)
      .patch("/api/auth/profile")
      .set("Cookie", cookie)
      .send({ name: "Updated" });

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.user.name).toBe("Updated");
  });
});
