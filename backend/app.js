const express = require("express");

const healthRoutes = require("./src/routes/health");
const scoresRoutes = require("./src/routes/scores");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/scores", scoresRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

module.exports = app;
