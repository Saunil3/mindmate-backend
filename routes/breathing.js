const express = require("express");
const router = express.Router();
const breathingController = require("../controllers/breathingController");
const { authenticateToken } = require("../Middleware/auth"); 


router.get("/", authenticateToken, breathingController.getAllSessions);

router.post("/", authenticateToken, breathingController.createSession);

router.delete("/:id", authenticateToken, breathingController.deleteSession);

module.exports = router;
