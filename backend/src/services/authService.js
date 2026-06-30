const bcrypt = require("bcryptjs");
const config = require("../config");
const userRepository = require("../repository/userRepository");
const resetTokenRepository = require("../repository/resetTokenRepository");
const { sendResetEmail } = require("./emailService");
const { signToken, buildUserResponse } = require("../utils/authUtils");

function getPasswordCategories(password) {
  let count = 0;
  if (/[a-z]/.test(password)) count++;
  if (/[A-Z]/.test(password)) count++;
  if (/[0-9]/.test(password)) count++;
  if (/[^a-zA-Z0-9]/.test(password)) count++;
  return count;
}

function validatePasswordStrength(password) {
  if (password.length < 8) {
    const error = new Error("La contraseña debe tener al menos 8 caracteres");
    error.status = 400;
    throw error;
  }

  if (getPasswordCategories(password) < 3) {
    const error = new Error("La contraseña debe contener al menos 3 de las siguientes categorías: minúsculas, mayúsculas, números, símbolos");
    error.status = 400;
    throw error;
  }
}

async function register({ email, name, password }) {
  validatePasswordStrength(password);

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
      typeof currentPassword !== "string" ||
      currentPassword.length === 0
    ) {
      const error = new Error(
        "currentPassword is required to change password"
      );
      error.status = 400;
      throw error;
    }

    try {
      validatePasswordStrength(newPassword);
    } catch (error) {
      error.message = error.message.replace(
        "La contraseña",
        "La nueva contraseña"
      );
      throw error;
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isValid) {
      const error = new Error(
        "La contraseña actual es incorrecta"
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

async function requestPasswordReset(email) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    return { message: "Comprueba tu bandeja de entrada. Se ha enviado un enlace para restablecer tu contraseña." };
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const rawToken = await resetTokenRepository.createToken(user.id, expiresAt);

  const resetLink = `${config.frontendUrl}/reset-password/?token=${rawToken}`;
  await sendResetEmail(email, resetLink);

  return { message: "Comprueba tu bandeja de entrada. Se ha enviado un enlace para restablecer tu contraseña." };
}

async function resetPassword(token, newPassword) {
  if (typeof newPassword !== "string") {
    const error = new Error("La contraseña es necesaria");
    error.status = 400;
    throw error;
  }

  validatePasswordStrength(newPassword);

  const record = await resetTokenRepository.findValidToken(token);

  if (!record) {
    const error = new Error("El permiso está caducado o es inválido. Inténtalo de nuevo.");
    error.status = 400;
    throw error;
  }

  await resetTokenRepository.markAsUsed(record.id);

  const passwordHash = await bcrypt.hash(newPassword, config.auth.bcryptRounds);
  await userRepository.updateUser(record.user_id, record.name, passwordHash);
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
  deleteAccount,
  requestPasswordReset,
  resetPassword
};