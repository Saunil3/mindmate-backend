const db = require('../config/Database');

class JournalEntry {
  static async findAllByUser(user_id) {
    const [rows] = await db.query(
      'SELECT * FROM JournalEntries WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM JournalEntries WHERE journal_id = ? LIMIT 1',
      [id]
    );
    return rows[0];
  }

  static async create({ user_id, mood_id = null, title, content }) {
    const [result] = await db.query(
      'INSERT INTO JournalEntries (user_id, mood_id, title, content) VALUES (?, ?, ?, ?)',
      [user_id, mood_id, title, content]
    );
    return this.findById(result.insertId);
  }

  static async update(id, { title, content, mood_id = null }) {
    await db.query(
      'UPDATE JournalEntries SET title = ?, content = ?, mood_id = ? WHERE journal_id = ?',
      [title, content, mood_id, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM JournalEntries WHERE journal_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = JournalEntry;
