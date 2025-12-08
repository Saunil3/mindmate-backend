const express = require("express");
const router = express.Router();
const moodController = require("../controllers/moodController");
const { authenticateToken } = require("../Middleware/auth");

router.get("/", authenticateToken, moodController.getAllMoods);

router.get("/:id", authenticateToken, moodController.getMoodById);

router.post("/", authenticateToken, moodController.createMood);

router.put("/:id", authenticateToken, moodController.updateMood);

router.delete("/:id", authenticateToken, moodController.deleteMood);

module.exports = router;
