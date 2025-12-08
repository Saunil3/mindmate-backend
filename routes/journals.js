const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const { authenticateToken } = require("../Middleware/auth");

router.get("/", authenticateToken, journalController.getAllJournals);

router.post("/", authenticateToken, journalController.createJournal);

router.put("/:id", authenticateToken, journalController.updateJournal);

router.delete("/:id", authenticateToken, journalController.deleteJournal);

module.exports = router;
