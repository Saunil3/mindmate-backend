const db = require("../config/Database");

module.exports = {
  createMood: async (userId, mood, note) => {
    return db.query(
      "INSERT INTO MoodEntries (user_id, mood, note, created_at) VALUES (?, ?, ?, NOW())",
      [userId, mood, note]
    );
  },

  getMoodsByUser: async (userId) => {
    return db.query(
      "SELECT * FROM MoodEntries WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
  },

  deleteMood: async (id) => {
    return db.query("DELETE FROM MoodEntries WHERE id = ?", [id]);
  },
};
