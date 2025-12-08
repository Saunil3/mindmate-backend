const db = require("../config/Database");

module.exports = {
  createQuote: async (text, author) => {
    return db.query(
      "INSERT INTO Quotes (text, author, created_at) VALUES (?, ?, NOW())",
      [text, author]
    );
  },

  getRandomQuote: async () => {
    return db.query(
      "SELECT * FROM Quotes ORDER BY RAND() LIMIT 1"
    );
  },

  getAllQuotes: async () => {
    return db.query("SELECT * FROM Quotes ORDER BY created_at DESC");
  },

  deleteQuote: async (id) => {
    return db.query("DELETE FROM Quotes WHERE id = ?", [id]);
  },
};
