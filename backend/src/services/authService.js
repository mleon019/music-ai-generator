const bcrypt = require("bcryptjs");
const config = require("../config");
const userRepository = require("../repository/userRepository");
const { signToken, buildUserResponse } = require("../utils/authUtils");

async function register({ email, name, password }) {
  if (password.length < 6) {
    const error = new Error(
      "Password must be at least 6 characters"
    );
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(
    password,
    config.auth.bcryptRounds
  );

  try {
    const user = await userRepository.createUser(
      email,
      name,
      passwordHash
    );

    return {
      token: signToken(user),
      user
    };
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error(
        "Email already registered"
      );
      err.status = 409;
      throw err;
    }

    throw error;
  }
}

async function login(email, password) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    const error = new Error(
      "Invalid credentials"
    );
    error.status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isValid) {
    const error = new Error(
      "Invalid credentials"
    );
    error.status = 401;
    throw error;
  }

  return {
    token: signToken(user),
    user: buildUserResponse(user)
  };
}

async function updateProfile({
  userId,
  name,
  currentPassword,
  newPassword
}) {
  if (!name && !newPassword) {
    const error = new Error(
      "name or newPassword is required"
    );
    error.status = 400;
    throw error;
  }

  const user = await userRepository.findById(
    userId
  );

  if (!user) {
    const error = new Error(
      "User not found"
    );
    error.status = 404;
    throw error;
  }

  let nextName = user.name;
  let nextPasswordHash = user.password_hash;

  if (name) {
    nextName = name;
  }

  if (newPassword !== undefined) {
    if (
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      const error = new Error(
        "newPassword must be at least 6 characters"
      );
      error.status = 400;
      throw error;
    }

    if (
      typeof currentPassword !== "string" ||
      currentPassword.length === 0
    ) {
      const error = new Error(
        "currentPassword is required to change password"
      );
      error.status = 400;
      throw error;
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isValid) {
      const error = new Error(
        "Invalid current password"
      );
      error.status = 401;
      throw error;
    }

    nextPasswordHash = await bcrypt.hash(
      newPassword,
      config.auth.bcryptRounds
    );
  }

  const updatedUser =
    await userRepository.updateUser(
      userId,
      nextName,
      nextPasswordHash
    );

  return {
    token: signToken(updatedUser),
    user: buildUserResponse(updatedUser)
  };
}

async function deleteAccount(userId) {
  const deleted =
    await userRepository.deleteUser(userId);

  if (!deleted) {
    const error = new Error(
      "User not found"
    );
    error.status = 404;
    throw error;
  }
}

module.exports = {
  register,
  login,
  updateProfile,
  deleteAccount
};