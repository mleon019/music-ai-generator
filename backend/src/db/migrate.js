const fs = require("fs");
const path = require("path");

const pool = require("./pool");

const migrationsDir = path.resolve(__dirname, "migrations");

const retryDelayMs = Number.parseInt(process.env.DB_RETRY_DELAY_MS || "1000", 10);
const maxAttempts = Number.parseInt(process.env.DB_RETRY_ATTEMPTS || "10", 10);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await pool.connect();
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts) {
        throw error;
      }
      await wait(retryDelayMs);
    }
  }

  throw new Error("Failed to connect to database");
}

async function runMigrations() {
  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const retryAttempts = 5;

  for (let attempt = 0; attempt < retryAttempts; attempt++) {
    const client = await connectWithRetry();

    try {
      await client.query("BEGIN");
      await client.query(
        "CREATE TABLE IF NOT EXISTS migrations (id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, executed_at TIMESTAMPTZ DEFAULT now())"
      );

      const { rows } = await client.query("SELECT name FROM migrations");
      const applied = new Set(rows.map((row) => row.name));

      const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".sql"))
        .sort();

      for (const file of files) {
        if (applied.has(file)) {
          continue;
        }

        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        await client.query(sql);
        await client.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
      }

      await client.query("COMMIT");
      client.release();

      return;
    } catch (error) {
      await client.query("ROLLBACK");
      client.release();

      if (
        attempt < retryAttempts - 1 &&
        error.message &&
        error.message.includes("pg_type_typname_nsp_index")
      ) {
        await wait(retryDelayMs);
        continue;
      }

      throw error;
    }
  }
}

module.exports = {
  runMigrations
};
