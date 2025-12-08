const db = require('../config/Database');

class Insight {
  static async findAllByUser(user_id) {
    const [rows] = await db.query(
      'SELECT * FROM Insights WHERE user_id = ? ORDER BY week_start DESC',
      [user_id]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM Insights WHERE insight_id = ? LIMIT 1',
      [id]
    );
    return rows[0];
  }

  static async create({ user_id, week_start, summary }) {
    const [result] = await db.query(
      'INSERT INTO Insights (user_id, week_start, summary) VALUES (?, ?, ?)',
      [user_id, week_start, summary]
    );
    return this.findById(result.insertId);
  }

  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM Insights WHERE insight_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Insight;
