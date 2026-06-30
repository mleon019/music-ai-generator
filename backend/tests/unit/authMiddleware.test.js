process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const jwt = require("jsonwebtoken");
const { optionalAuth, requireAuth } = require("../../src/middleware/auth");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe("auth middleware", () => {
  it("optionalAuth allows requests without token", () => {
    const req = { cookies: {} };
    const res = createRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("requireAuth rejects missing token", () => {
    const req = { cookies: {} };
    const res = createRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing authorization token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAuth accepts valid token", () => {
    const token = jwt.sign({ id: "user-id" }, process.env.JWT_SECRET);
    const req = { cookies: { authToken: token } };
    const res = createRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(req.user.id).toBe("user-id");
    expect(next).toHaveBeenCalled();
  });

  it("optionalAuth rejects expired token", () => {
    const token = jwt.sign({ id: "user-id" }, "wrong-secret");
    const req = { cookies: { authToken: token } };
    const res = createRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAuth rejects expired token", () => {
    const token = jwt.sign({ id: "user-id" }, "wrong-secret");
    const req = { cookies: { authToken: token } };
    const res = createRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });
});
