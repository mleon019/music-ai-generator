const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const health = {
    status: "ok",
    uptime: Math.round(process.uptime()) + "s",
    timestamp: new Date().toISOString()
    };

    res.status(200).json(health);
});

module.exports = router;
