const express = require("express");

const { login, register } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { updateProfile, deleteAccount } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/profile", requireAuth, updateProfile);
router.delete("/account", requireAuth, deleteAccount);

module.exports = router;
