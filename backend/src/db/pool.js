const { Pool } = require("pg");

const config = require("../config");

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined
});

module.exports = pool;
