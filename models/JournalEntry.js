const db = require("../config/Database");

module.exports = {
  createJournal: async (userId, title, content) => {
    return db.query(
      "INSERT INTO JournalEntries (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())",
      [userId, title, content]
    );
  },

  getJournalsByUser: async (userId) => {
    return db.query(
      "SELECT * FROM JournalEntries WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
  },

  deleteJournal: async (id) => {
    return db.query("DELETE FROM JournalEntries WHERE id = ?", [id]);
  },

  updateJournal: async (id, title, content) => {
    return db.query(
      "UPDATE JournalEntries SET title = ?, content = ? WHERE id = ?",
      [title, content, id]
    );
  },
};
