const express = require("express");
const router = express.Router();
const insightController = require("../controllers/insightController");
const { authenticateToken } = require("../Middleware/auth");

router.get("/", authenticateToken, insightController.getAllInsights);

router.post("/", authenticateToken, insightController.createInsight);

router.delete("/:id", authenticateToken, insightController.deleteInsight);

module.exports = router;
