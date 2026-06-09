const pool = require("../db/pool");

async function createUser(email, name, passwordHash) {
  const result = await pool.query(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, name`,
    [email, name, passwordHash]
  );

  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, name, password_hash
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    `SELECT id, email, name, password_hash
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function updateUser(id, name, passwordHash) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1,
         password_hash = $2
     WHERE id = $3
     RETURNING id, email, name`,
    [name, passwordHash, id]
  );

  return result.rows[0] || null;
}

async function deleteUser(id) {
  const result = await pool.query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return result.rowCount > 0;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateUser,
  deleteUser
};