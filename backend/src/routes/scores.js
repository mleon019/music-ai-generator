const express = require("express");

const { generateScore } = require("../controllers/scoresController");
const validateScoreConfig = require("../middleware/validateScoreConfig");

const router = express.Router();

router.post("/generate", validateScoreConfig, generateScore);

module.exports = router;
