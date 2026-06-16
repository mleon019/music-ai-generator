const express = require("express");

const { login, register, logout, updateProfile, deleteAccount } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.patch("/profile", requireAuth, updateProfile);
router.delete("/account", requireAuth, deleteAccount);

module.exports = router;
