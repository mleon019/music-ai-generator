process.env.NODE_ENV = "test";

jest.mock("../../src/services/authService", () => ({
  register: jest.fn(),
  login: jest.fn(),
  updateProfile: jest.fn(),
  deleteAccount: jest.fn()
}));

const authService = require("../../src/services/authService");

const {
  register,
  login,
  updateProfile,
  deleteAccount
} = require("../../src/controllers/authController");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn()
  };
}

describe("authController", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {

    it("returns 201 when registration succeeds", async () => {

      authService.register.mockResolvedValue({
        token: "token",
        user: {
          id: "id",
          email: "a@b.com",
          name: "Ana"
        }
      });

      const req = {
        body: {
          email: "a@b.com",
          name: "Ana",
          password: "secret123"
        }
      };

      const res = createRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith({
        email: "a@b.com",
        name: "Ana",
        password: "secret123"
      });

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        token: "token",
        user: {
          id: "id",
          email: "a@b.com",
          name: "Ana"
        }
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when required fields are missing", async () => {

      const req = {
        body: {}
      };

      const res = createRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(authService.register).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        error: "name, email, and password are required"
      });
    });

    it("forwards service errors to next", async () => {

      const error = new Error("Email already registered");
      error.status = 409;

      authService.register.mockRejectedValue(error);

      const req = {
        body: {
          email: "a@b.com",
          name: "Ana",
          password: "secret123"
        }
      };

      const res = createRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

  });

  describe("login", () => {

    it("returns 200 when login succeeds", async () => {

      authService.login.mockResolvedValue({
        token: "token",
        user: {
          id: "id",
          email: "a@b.com",
          name: "Ana"
        }
      });

      const req = {
        body: {
          email: "a@b.com",
          password: "secret123"
        }
      };

      const res = createRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith(
        "a@b.com",
        "secret123"
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when credentials are missing", async () => {

      const req = {
        body: {}
      };

      const res = createRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(authService.login).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        error: "email and password are required"
      });
    });

    it("forwards service errors", async () => {

      const error = new Error("Invalid credentials");
      error.status = 401;

      authService.login.mockRejectedValue(error);

      const req = {
        body: {
          email: "a@b.com",
          password: "wrong"
        }
      };

      const res = createRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

  });

  describe("updateProfile", () => {

    it("returns 401 when user is missing", async () => {

      const req = {
        user: null,
        body: {}
      };

      const res = createRes();
      const next = jest.fn();

      await updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns updated user", async () => {

      authService.updateProfile.mockResolvedValue({
        token: "new-token",
        user: {
          id: "id",
          email: "a@b.com",
          name: "Nuevo Nombre"
        }
      });

      const req = {
        user: {
          id: "id"
        },
        body: {
          name: "Nuevo Nombre"
        }
      };

      const res = createRes();
      const next = jest.fn();

      await updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(authService.updateProfile).toHaveBeenCalled();
    });

  });

  describe("deleteAccount", () => {

    it("returns 401 when user is missing", async () => {

      const req = {
        user: null
      };

      const res = createRes();
      const next = jest.fn();

      await deleteAccount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 204 when deletion succeeds", async () => {

      authService.deleteAccount.mockResolvedValue();

      const req = {
        user: {
          id: "id"
        }
      };

      const res = createRes();
      const next = jest.fn();

      await deleteAccount(req, res, next);

      expect(authService.deleteAccount)
        .toHaveBeenCalledWith("id");

      expect(res.sendStatus)
        .toHaveBeenCalledWith(204);
    });

  });

});