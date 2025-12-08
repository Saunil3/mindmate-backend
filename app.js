const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/Database");
 
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route imports
const authRoutes = require("./routes/auth");
const moodRoutes = require("./routes/moods");
const journalRoutes = require("./routes/journals");
const quoteRoutes = require("./routes/quotes");
const breathingRoutes = require("./routes/breathing");
const insightRoutes = require("./routes/insights");
const adminRoutes = require("./routes/admin");
const userRoutes = require('./routes/users');
const friendRoutes = require("./routes/friends");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes); 
app.use("/api/journals", journalRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/breathing", breathingRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/users', userRoutes);
app.use("/api/friends", friendRoutes);

 
// Base route for quick info
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the MindMate API",
    about:
      "MindMate helps users track moods, write journals, manage breathing sessions, and view insights.",
    main_endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile",
      },
      moods: {
        getAll: "GET /api/moods",
        create: "POST /api/moods",
        delete: "DELETE /api/moods/:id",
      },
      journals: {
        getAll: "GET /api/journals",
        create: "POST /api/journals",
      },
    },
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// 404 Handler

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await db.promise().query("SELECT 1");
    console.log("✅ Connected to MySQL database");
    console.log(`🚀 MindMate API running on port ${PORT}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});

module.exports = app;

