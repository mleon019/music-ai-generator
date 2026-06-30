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
        password: "Secret123"
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
          password: "1234567"
        })
      ).rejects.toMatchObject({
        status: 400
      });
    });

    it("rejects weak passwords", async () => {

      await expect(
        authService.register({
          email: "a@b.com",
          name: "Ana",
          password: "abcdefgh"
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
          password: "Secret123"
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

  describe("updateProfile", () => {
    const existingUser = {
      id: "id",
      email: "a@b.com",
      name: "Ana",
      password_hash: "old-hash"
    };

    it("updates name only", async () => {
      userRepository.findById.mockResolvedValue(existingUser);
      userRepository.updateUser.mockResolvedValue({ ...existingUser, name: "Nuevo Nombre" });
      authUtils.signToken.mockReturnValue("new-token");

      const result = await authService.updateProfile({
        userId: "id",
        name: "Nuevo Nombre"
      });

      expect(userRepository.findById).toHaveBeenCalledWith("id");
      expect(userRepository.updateUser).toHaveBeenCalledWith("id", "Nuevo Nombre", "old-hash");
      expect(result.token).toBe("new-token");
    });

    it("rejects when neither name nor newPassword provided", async () => {
      await expect(
        authService.updateProfile({ userId: "id" })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects password change without currentPassword", async () => {
      await expect(
        authService.updateProfile({ userId: "id", newPassword: "newsecret" })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects short newPassword", async () => {
      userRepository.findById.mockResolvedValue(existingUser);

      await expect(
        authService.updateProfile({
          userId: "id",
          currentPassword: "pass",
          newPassword: "1234567"
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects weak newPassword", async () => {
      userRepository.findById.mockResolvedValue(existingUser);

      await expect(
        authService.updateProfile({
          userId: "id",
          currentPassword: "pass",
          newPassword: "newsecret1"
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects wrong currentPassword", async () => {
      userRepository.findById.mockResolvedValue(existingUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.updateProfile({
          userId: "id",
          currentPassword: "wrong",
          newPassword: "NewSecret1"
        })
      ).rejects.toMatchObject({ status: 401 });
    });

    it("updates password successfully", async () => {
      userRepository.findById.mockResolvedValue(existingUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("new-hash");
      userRepository.updateUser.mockResolvedValue({ ...existingUser, password_hash: "new-hash" });
      authUtils.signToken.mockReturnValue("new-token");

      const result = await authService.updateProfile({
        userId: "id",
        currentPassword: "oldpass",
        newPassword: "NewSecret1"
      });

      expect(bcrypt.compare).toHaveBeenCalledWith("oldpass", "old-hash");
      expect(bcrypt.hash).toHaveBeenCalledWith("NewSecret1", expect.any(Number));
      expect(userRepository.updateUser).toHaveBeenCalledWith("id", "Ana", "new-hash");
      expect(result.token).toBe("new-token");
    });

    it("returns 404 when user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        authService.updateProfile({ userId: "nonexistent", name: "Test" })
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("deleteAccount", () => {
    it("returns 404 when user not found", async () => {
      userRepository.deleteUser.mockResolvedValue(null);

      await expect(
        authService.deleteAccount("nonexistent")
      ).rejects.toMatchObject({ status: 404 });
    });
  });

});