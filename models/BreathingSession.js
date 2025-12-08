const db = require('../config/Database');

class BreathingSession {
  static async findAllByUser(user_id) {
    const [rows] = await db.query(
      'SELECT * FROM BreathingSessions WHERE user_id = ? ORDER BY session_date DESC, session_id DESC',
      [user_id]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM BreathingSessions WHERE session_id = ? LIMIT 1',
      [id]
    );
    return rows[0];
  }

  static async create({ user_id, duration}) {
  const sessionDate = new Date(); 
  const [result] = await db.query(
    'INSERT INTO BreathingSessions (user_id, duration,  session_date) VALUES (?, ?, ?)',
    [user_id, duration|| "guided", sessionDate]
  );
  return this.findById(result.insertId);
}


  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM BreathingSessions WHERE session_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = BreathingSession;
