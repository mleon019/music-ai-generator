process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

jest.mock("../../src/db/pool", () => ({
  query: jest.fn()
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn()
}));

const pool = require("../../src/db/pool");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { login, register } = require("../../src/controllers/authController");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe("authController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a new user", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    pool.query.mockResolvedValue({
      rows: [{ id: "id", email: "a@b.com", name: "Ana" }]
    });
    jwt.sign.mockReturnValue("token");

    const req = {
      body: { email: "a@b.com", name: "Ana", password: "secret123" }
    };
    const res = createRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      token: "token",
      user: { id: "id", email: "a@b.com", name: "Ana" }
    });
  });

  it("returns 409 on duplicate email", async () => {
    const error = new Error("duplicate");
    error.code = "23505";
    pool.query.mockRejectedValue(error);

    const req = {
      body: { email: "a@b.com", name: "Ana", password: "secret123" }
    };
    const res = createRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already registered" });
  });

  it("logs in a user", async () => {
    pool.query.mockResolvedValue({
      rows: [{
        id: "id",
        email: "a@b.com",
        name: "Ana",
        password_hash: "hashed"
      }]
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token");

    const req = { body: { email: "a@b.com", password: "secret123" } };
    const res = createRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: "token",
      user: { id: "id", email: "a@b.com", name: "Ana" }
    });
  });

  it("rejects invalid credentials", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const req = { body: { email: "a@b.com", password: "secret123" } };
    const res = createRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });
});
