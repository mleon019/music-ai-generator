process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");

describe("GET /api/health", () => {
  it("returns ok status payload", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.uptime).toMatch(/s$/);
    expect(response.body.timestamp).toBeTruthy();
  });

  it("returns 404 for unknown route", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found" });
  });
});
