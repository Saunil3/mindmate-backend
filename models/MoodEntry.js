 const db = require('../config/Database');

class MoodEntry {
  static async findAllByUser(user_id) {
    const [rows] = await db.query(
      'SELECT * FROM MoodEntries WHERE user_id = ? ORDER BY mood_date DESC',
      [user_id]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM MoodEntries WHERE mood_id = ? LIMIT 1',
      [id]
    );
    return rows[0];
  }

  static async create({ user_id, mood_type, emoji, note }) {
    const [result] = await db.query(
      'INSERT INTO MoodEntries (user_id, mood_type, emoji, note) VALUES (?, ?, ?, ?)',
      [user_id, mood_type, emoji, note]
    );
    return { mood_id: result.insertId, user_id, mood_type, emoji, note, mood_date: new Date() };
  }

  static async update(id, { mood_type, emoji, note }) {
    await db.query(
      'UPDATE MoodEntries SET mood_type = ?, emoji = ?, note = ? WHERE mood_id = ?',
      [mood_type, emoji, note, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM MoodEntries WHERE mood_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = MoodEntry;
