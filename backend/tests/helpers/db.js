const pool = require("../../src/db/pool");
const { runMigrations } = require("../../src/db/migrate");

async function resetDatabase() {
  await pool.query("TRUNCATE scores, users RESTART IDENTITY CASCADE");
}

module.exports = {
  pool,
  runMigrations,
  resetDatabase
};
