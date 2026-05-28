const express = require("express");

const { generateScore, regenerateScore, listScores } = require("../controllers/scoresController");
const { optionalAuth, requireAuth } = require("../middleware/auth");
const validateScoreConfig = require("../middleware/validateScoreConfig");

const router = express.Router();

router.post("/generate", optionalAuth, validateScoreConfig, generateScore);
router.post("/regenerate", optionalAuth, validateScoreConfig, regenerateScore);
router.get("/", requireAuth, listScores);

module.exports = router;
