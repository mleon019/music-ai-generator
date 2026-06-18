const express = require("express");

const { login, register, logout, updateProfile, deleteAccount, requestPasswordReset, resetPassword } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.patch("/profile", requireAuth, updateProfile);
router.delete("/account", requireAuth, deleteAccount);

module.exports = router;
