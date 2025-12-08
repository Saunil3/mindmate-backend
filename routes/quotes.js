const express = require("express");
const router = express.Router();
const quoteController = require("../controllers/quoteController");
const { authenticateToken } = require("../Middleware/auth");
const role = require("../Middleware/role");

// main mood endpoint (live quotes)
router.get("/mood", authenticateToken, quoteController.getQuoteByMood);

// keep legacy admin routes if you still want them
router.get("/random", (req, res) => res.json({ message: "Legacy route placeholder" }));
router.post("/", authenticateToken, role("admin"), (req, res) =>
  res.json({ message: "Create quote disabled (using external API)" })
);
router.delete("/:id", authenticateToken, role("admin"), (req, res) =>
  res.json({ message: "Delete quote disabled (using external API)" })
);

module.exports = router;
