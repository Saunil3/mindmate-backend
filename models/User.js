const db = require('../config/Database');
const bcrypt = require('bcryptjs');

class User {
  // Find user by email (include role + password_hash for login)
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT user_id, username, email, password_hash, role, created_at, last_login FROM Users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0];
  }

  // Find user by ID (no password_hash in profile payload)
  static async findById(user_id) {
    const [rows] = await db.query(
      'SELECT user_id, username, email, role, created_at, last_login FROM Users WHERE user_id = ? LIMIT 1',
      [user_id]
    );
    return rows[0];
  }

  // Create user (defaults role to 'user')
  static async create({ username, email, password, role = 'user' }) {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, password_hash, role]
    );
    return { user_id: result.insertId, username, email, role };
  }

  // Compare plain vs hashed password
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
