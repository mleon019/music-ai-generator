const express = require("express");

const config = require("./src/config");
const healthRoutes = require("./src/routes/health");
const scoresRoutes = require("./src/routes/scores");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", config.corsOrigin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use("/api/health", healthRoutes);
app.use("/api/scores", scoresRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

module.exports = app;
