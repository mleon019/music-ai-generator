process.env.NODE_ENV = "test";

jest.mock("../../src/repository/userRepository", () => ({
  createUser: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock("../../src/utils/authUtils", () => ({
  signToken: jest.fn(),
  buildUserResponse: jest.fn(user => ({
    id: user.id,
    email: user.email,
    name: user.name
  }))
}));

const bcrypt = require("bcryptjs");

const userRepository = require("../../src/repository/userRepository");

const authUtils = require("../../src/utils/authUtils");

const authService = require("../../src/services/authService");

describe("authService", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {

    it("creates a new user", async () => {

      bcrypt.hash.mockResolvedValue("hashed");

      userRepository.createUser.mockResolvedValue({
        id: "id",
        email: "a@b.com",
        name: "Ana"
      });

      authUtils.signToken.mockReturnValue("token");

      const result = await authService.register({
        email: "a@b.com",
        name: "Ana",
        password: "secret123"
      });

      expect(bcrypt.hash).toHaveBeenCalled();

      expect(userRepository.createUser)
        .toHaveBeenCalled();

      expect(result.token).toBe("token");
    });

    it("rejects short passwords", async () => {

      await expect(
        authService.register({
          email: "a@b.com",
          name: "Ana",
          password: "123"
        })
      ).rejects.toMatchObject({
        status: 400
      });
    });

    it("rejects duplicate emails", async () => {

      const dbError = new Error();
      dbError.code = "23505";

      userRepository.createUser
        .mockRejectedValue(dbError);

      await expect(
        authService.register({
          email: "a@b.com",
          name: "Ana",
          password: "secret123"
        })
      ).rejects.toMatchObject({
        status: 409
      });
    });

  });

  describe("login", () => {

    it("logs in successfully", async () => {

      userRepository.findByEmail
        .mockResolvedValue({
          id: "id",
          email: "a@b.com",
          name: "Ana",
          password_hash: "hash"
        });

      bcrypt.compare
        .mockResolvedValue(true);

      authUtils.signToken
        .mockReturnValue("token");

      const result = await authService.login(
        "a@b.com",
        "secret123"
      );

      expect(result.token)
        .toBe("token");
    });

    it("rejects unknown user", async () => {

      userRepository.findByEmail
        .mockResolvedValue(null);

      await expect(
        authService.login(
          "a@b.com",
          "secret123"
        )
      ).rejects.toMatchObject({
        status: 401
      });
    });

    it("rejects invalid password", async () => {

      userRepository.findByEmail
        .mockResolvedValue({
          password_hash: "hash"
        });

      bcrypt.compare
        .mockResolvedValue(false);

      await expect(
        authService.login(
          "a@b.com",
          "wrong"
        )
      ).rejects.toMatchObject({
        status: 401
      });
    });

  });

});