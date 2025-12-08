const db = require("../config/Database");

module.exports = {
  createSession: async (userId, duration, breaths) => {
    return db.query(
      "INSERT INTO BreathingSessions (user_id, duration, breaths, created_at) VALUES (?, ?, ?, NOW())",
      [userId, duration, breaths]
    );
  },

  getSessionsByUser: async (userId) => {
    return db.query(
      "SELECT * FROM BreathingSessions WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
  },

  deleteSession: async (id) => {
    return db.query("DELETE FROM BreathingSessions WHERE id = ?", [id]);
  },
};
