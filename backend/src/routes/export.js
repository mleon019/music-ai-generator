const express = require("express");

const { exportScore } = require("../controllers/exportController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", optionalAuth, exportScore);

module.exports = router;
