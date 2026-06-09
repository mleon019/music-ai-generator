const authService = require("../services/authService");

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
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

    const result = await authService.register({
      email,
      name,
      password
    });

    return res.status(201).json(result);
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

    const result = await authService.login(
      email,
      password
    );

    return res.status(200).json(result);
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

    const result = await authService.updateProfile({
      userId,
      name: normalizeName(req.body?.name),
      currentPassword: req.body?.currentPassword,
      newPassword: req.body?.newPassword
    });

    return res.status(200).json(result);
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

    await authService.deleteAccount(userId);

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  updateProfile,
  deleteAccount
};