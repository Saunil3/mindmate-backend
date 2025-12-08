const db = require("../config/Database");

const adminController = {
  getAllUsers: async (req, res) => {
    try {
      const [rows] = await db.query("SELECT user_id, username, email, role, created_at FROM Users");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: "Error fetching users" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await db.query("DELETE FROM Users WHERE user_id = ?", [req.params.id]);
      res.json({ message: "User deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete user" });
    }
  },

  getAllMoods: async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM moodentries");
      res.json(rows);
    } catch {
      console.error("Error fetching moods:", err);
      res.status(500).json({ message: "Error fetching moods" });
    }
  },

  deleteMood: async (req, res) => {
    try {
      await db.query("DELETE FROM MoodEntry WHERE mood_id = ?", [req.params.id]);
      res.json({ message: "Mood deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete mood" });
    }
  },

  getAllJournals: async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM journalentries");
      res.json(rows);
    } catch {
      res.status(500).json({ message: "Error fetching journals" });
    }
  },

  deleteJournal: async (req, res) => {
    try {
      await db.query("DELETE FROM JournalEntry WHERE journal_id = ?", [req.params.id]);
      res.json({ message: "Journal deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete journal" });
    }
  },

  getAnalytics: async (req, res) => {
  try {
    const [[userCount]] = await db.query("SELECT COUNT(*) AS totalUsers FROM Users");
    const [[journalCount]] = await db.query("SELECT COUNT(*) AS totalJournals FROM journalentries");
    const [[moodCount]] = await db.query("SELECT COUNT(*) AS totalMoods FROM moodentries");

    // Average score for all moods
    const [[avgMood]] = await db.query(`
      SELECT ROUND(AVG(
        CASE 
          WHEN mood_type='happy' THEN 5
          WHEN mood_type='neutral' THEN 3
          WHEN mood_type='sad' THEN 2
          WHEN mood_type='anxious' THEN 2
          WHEN mood_type='stressed' THEN 1
          ELSE 0
        END
      ),2) AS avgMoodScore
      FROM moodentries
    `);

    // Fetch trend data (average mood per day)
    const [trendData] = await db.query(`
      SELECT 
        DATE(mood_date) AS date,
        ROUND(AVG(
          CASE 
            WHEN mood_type='happy' THEN 5
            WHEN mood_type='neutral' THEN 3
            WHEN mood_type='sad' THEN 2
            WHEN mood_type='anxious' THEN 2
            WHEN mood_type='stressed' THEN 1
            ELSE 0
          END
        ),2) AS avg_score
      FROM moodentries
      GROUP BY DATE(mood_date)
      ORDER BY DATE(mood_date)
      LIMIT 10;
    `);

    const [inactiveUsers] = await db.query(`
      SELECT username, email, DATEDIFF(NOW(), last_login) AS days_inactive
      FROM Users
      WHERE last_login IS NOT NULL AND DATEDIFF(NOW(), last_login) > 7
    `);

    res.json({
      users: userCount.totalUsers,
      journals: journalCount.totalJournals,
      moods: moodCount.totalMoods,
      averageMood: avgMood.avgMoodScore || 0,
      trend: trendData,
      inactiveUsers,
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
},


};

module.exports = adminController;
