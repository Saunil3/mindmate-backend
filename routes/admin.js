const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../Middleware/auth");
const role = require("../Middleware/role");
const adminController = require("../controllers/adminController");

// Only admins can access these
router.get("/users", authenticateToken, role("admin"), adminController.getAllUsers);
router.delete("/user/:id", authenticateToken, role("admin"), adminController.deleteUser);

router.get("/moods", authenticateToken, role("admin"), adminController.getAllMoods);
router.delete("/mood/:id", authenticateToken, role("admin"), adminController.deleteMood);

router.get("/journals", authenticateToken, role("admin"), adminController.getAllJournals);
router.delete("/journal/:id", authenticateToken, role("admin"), adminController.deleteJournal);

router.get("/analytics", authenticateToken, role("admin"), adminController.getAnalytics);

module.exports = router;
