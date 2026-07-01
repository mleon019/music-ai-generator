const authService = require("../services/authService");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/"
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) return null;
  return EMAIL_REGEX.test(trimmed) ? trimmed : null;
}

function normalizeName(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function register(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const name = normalizeName(req.body?.name);
    const password = req.body?.password;

    if (!email || !name || typeof password !== "string") {
      return res.status(400).json({
        error: "name, email, and password are required"
      });
    }

    const { token, user } = await authService.register({
      email,
      name,
      password
    });

    res.cookie("authToken", token, COOKIE_OPTIONS);

    return res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || typeof password !== "string") {
      return res.status(400).json({
        error: "email and password are required"
      });
    }

    const { token, user } = await authService.login(
      email,
      password
    );

    res.cookie("authToken", token, COOKIE_OPTIONS);

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Missing authorization token"
      });
    }

    const { token, user } = await authService.updateProfile({
      userId,
      name: normalizeName(req.body?.name),
      currentPassword: req.body?.currentPassword,
      newPassword: req.body?.newPassword
    });

    res.cookie("authToken", token, COOKIE_OPTIONS);

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Missing authorization token"
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "La contraseña es necesaria"
      });
    }

    await authService.deleteAccount(userId, password);

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.cookie("authToken", "", {
    ...COOKIE_OPTIONS,
    maxAge: 0
  });

  return res.sendStatus(204);
}

async function requestPasswordReset(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({ error: "Es necesario un email para continuar" });
    }

    const result = await authService.requestPasswordReset(email);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const token = req.body?.token;
    const newPassword = req.body?.newPassword;

    if (typeof token !== "string" || !token) {
      return res.status(400).json({ error: "El permiso está caducado. Inténtalo de nuevo." });
    }

    await authService.resetPassword(token, newPassword);

    return res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  updateProfile,
  deleteAccount,
  logout,
  requestPasswordReset,
  resetPassword
};