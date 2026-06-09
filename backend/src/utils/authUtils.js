const jwt = require("jsonwebtoken");
const config = require("../config");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
}

function buildUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

module.exports = {
  signToken,
  buildUserResponse
};