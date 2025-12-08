const express = require("express");
const router = express.Router();
const db = require("../config/Database");
const { authenticateToken } = require("../Middleware/auth");

// GET PUBLIC USERS (exclude admin)
router.get("/public", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.gender,
        DATE_FORMAT(u.dob, '%Y-%m-%d') AS dob,
        u.about_me,
        u.theme,

        SUM(CASE WHEN m.mood_type = 'happy' THEN 1 ELSE 0 END) AS happy_count,
        SUM(CASE WHEN m.mood_type = 'neutral' THEN 1 ELSE 0 END) AS neutral_count,
        SUM(CASE WHEN m.mood_type = 'sad' THEN 1 ELSE 0 END) AS sad_count

      FROM Users u
      LEFT JOIN moodentries m ON m.user_id = u.user_id

      WHERE u.role = 'user'

      GROUP BY u.user_id
      ORDER BY u.username ASC
      `
    );

    res.json(rows);

  } catch (error) {
    console.error("Public users fetch error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});


// GET SELF PROFILE
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await db.query(
        `
        SELECT 
          user_id,
          username,
          email,
          role,
          gender,
          dob,
          about_me,
          theme,
          created_at,
          last_login
        FROM Users
        WHERE user_id = ?
      `,
        [userId]
      );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});


// UPDATE USER
router.put("/update", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { username, email, gender, dob, about_me, theme } = req.body;

    await db.query(
        `
        UPDATE Users SET
          username = ?,
          email = ?,
          gender = ?,
          dob = ?,
          about_me = ?,
          theme = ?
        WHERE user_id = ?
      `,
        [username, email, gender, dob, about_me, theme, userId]
      );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});


// DELETE MY ACCOUNT
router.delete("/delete", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [result] = await db.query("DELETE FROM Users WHERE user_id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
