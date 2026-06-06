const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const pool = require("../db/pool");

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

function buildUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
}

async function register(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const name = normalizeName(req.body?.name);
    const password = req.body?.password;

    if (!email || !name || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    const passwordHash = await bcrypt.hash(password, config.auth.bcryptRounds);

    const result = await pool.query(
      "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, name, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || typeof password !== "string") {
      return res.status(400).json({ error: "email and password are required" });
    }

    const result = await pool.query(
      "SELECT id, email, name, password_hash FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    const name = normalizeName(req.body?.name);
    const currentPassword = req.body?.currentPassword;
    const newPassword = req.body?.newPassword;

    if (!userId) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    if (!name && !newPassword) {
      return res.status(400).json({ error: "name or newPassword is required" });
    }

    const existingResult = await pool.query(
      "SELECT id, email, name, password_hash FROM users WHERE id = $1",
      [userId]
    );
    const user = existingResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let nextName = user.name;
    let nextPasswordHash = user.password_hash;

    if (name) {
      nextName = name;
    }

    if (newPassword !== undefined) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ error: "newPassword must be at least 6 characters" });
      }

      if (typeof currentPassword !== "string" || currentPassword.length === 0) {
        return res.status(400).json({ error: "currentPassword is required to change password" });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid current password" });
      }

      nextPasswordHash = await bcrypt.hash(newPassword, config.auth.bcryptRounds);
    }

    const updatedResult = await pool.query(
      `UPDATE users
       SET name = $1,
           password_hash = $2
       WHERE id = $3
       RETURNING id, email, name`,
      [nextName, nextPasswordHash, userId]
    );

    const updatedUser = updatedResult.rows[0];
    const token = signToken(updatedUser);

    return res.status(200).json({ token, user: buildUserResponse(updatedUser) });
  } catch (error) {
    return next(error);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  updateProfile,
  deleteAccount
};
