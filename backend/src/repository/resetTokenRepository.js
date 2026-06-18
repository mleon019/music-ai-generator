const crypto = require("crypto");
const pool = require("../db/pool");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function createToken(userId, expiresAt) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return rawToken;
}

async function findValidToken(token) {
  const tokenHash = hashToken(token);

  const result = await pool.query(
    `SELECT t.id, t.user_id, u.email, u.name
     FROM password_reset_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = $1
       AND t.expires_at > now()
       AND t.used_at IS NULL`,
    [tokenHash]
  );

  return result.rows[0] || null;
}

async function markAsUsed(tokenId) {
  await pool.query(
    `UPDATE password_reset_tokens SET used_at = now() WHERE id = $1`,
    [tokenId]
  );
}

async function invalidateUserTokens(userId) {
  await pool.query(
    `UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  );
}

module.exports = {
  createToken,
  findValidToken,
  markAsUsed,
  invalidateUserTokens
};
