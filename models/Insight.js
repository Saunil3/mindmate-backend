const db = require("../config/Database");

module.exports = {
  createInsight: async (userId, type, value) => {
    return db.query(
      "INSERT INTO Insights (user_id, insight_type, insight_value, created_at) VALUES (?, ?, ?, NOW())",
      [userId, type, value]
    );
  },

  getInsightsByUser: async (userId) => {
    return db.query(
      "SELECT * FROM Insights WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
  },

  deleteInsight: async (id) => {
    return db.query("DELETE FROM Insights WHERE id = ?", [id]);
  },
};
