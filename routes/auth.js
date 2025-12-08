const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../Middleware/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/update", authenticateToken, authController.updateUser);
router.delete("/delete", authenticateToken, authController.deleteUser);

module.exports = router;
