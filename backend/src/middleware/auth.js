const jwt = require("jsonwebtoken");

const config = require("../config");

function getToken(req) {
  return req.cookies?.authToken || null;
}

function verifyToken(token) {
  return jwt.verify(token, config.auth.jwtSecret);
}

function optionalAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return next();
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = {
  optionalAuth,
  requireAuth
};
