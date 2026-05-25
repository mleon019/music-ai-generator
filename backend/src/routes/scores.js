const express = require("express");

const { generateScore } = require("../controllers/scoresController");

const router = express.Router();

router.post("/generate", generateScore);

module.exports = router;
