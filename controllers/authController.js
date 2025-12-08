const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/Database");
const crypto = require("crypto");

const RESET_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
let resetTokens = {}; // store temporary reset tokens

const authController = {

  register: async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      // Check if user exists
      const [existingUser] = await db.query("SELECT * FROM Users WHERE email = ? LIMIT 1", [email]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert user
      const [result] = await db.query(
          "INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
          [username, email, password_hash, role || "user"]
        );

      const user_id = result.insertId;

      // Generate JWT
      const token = jwt.sign(
        { user_id, role: role || "user" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { user_id, username, email, role: role || "user" },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  },


  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const [rows] = await db.query("SELECT * FROM Users WHERE email = ? LIMIT 1", [email]);
      const user = rows[0];
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      // Update last login timestamp
      await db.query("UPDATE Users SET last_login = NOW() WHERE user_id = ?", [
          user.user_id,
        ]);

      // Generate JWT
      const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.json({
  message: "Login successful",
  token,
  user: {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    role: user.role,  
    gender: user.gender,
    dob: user.dob,
    about_me: user.about_me,
    theme: user.theme,
    created_at: user.created_at,
    last_login: user.last_login
  }
});

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  },


  // Get user profile
  getProfile: async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await db.query(
      `SELECT 
        user_id,
        username,
        email,
        gender,
        DATE_FORMAT(dob, "%Y-%m-%d") AS dob,
        about_me,
        theme,
        role,
        created_at,
        last_login
       FROM Users
       WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
},


  // Update user info
  updateUser: async (req, res) => {
  try {
    const { username, email, password, dob, gender, about_me, theme } = req.body;
    const userId = req.user.user_id;

    let query = "UPDATE Users SET ";
    const values = [];

    if (username) { query += "username = ?, "; values.push(username); }
    if (email) { query += "email = ?, "; values.push(email); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += "password_hash = ?, ";
      values.push(hashed);
    }
    if (dob) {
      const cleanDOB = dob.includes("T") ? dob.split("T")[0] : dob;
      query += "dob = ?, ";
      values.push(cleanDOB);
    }
    if (gender) { query += "gender = ?, "; values.push(gender); }
    if (about_me) { query += "about_me = ?, "; values.push(about_me); }
    if (theme) { query += "theme = ?, "; values.push(theme); }

    if (values.length === 0) return res.status(400).json({ message: "No fields to update" });

    query = query.slice(0, -2) + " WHERE user_id = ?";
    values.push(userId);

    await db.query(query, values);
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
},


  // Delete user
  deleteUser: async (req, res) => {
    try {
      const userId = req.user.user_id;

      const [result] = await db.query("DELETE FROM Users WHERE user_id = ?", [userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Server error while deleting user" });
    }
  },

  // Forgot Password (dev mode)
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        return res
          .status(404)
          .json({ message: "No account found with that email" });
      }

      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = Date.now() + RESET_TOKEN_EXPIRY;
      resetTokens[token] = { userId: user.user_id, expires };

      // Instead of sending email, log link in console
      console.log(
        `Password reset link: http://localhost:5173/reset-password/${token}`
      );

      return res.json({
        message:
          "Password reset link generated successfully (check your backend console)",
        resetLink: `http://localhost:5173/reset-password/${token}`,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Error generating reset link" });
    }
  },


resetPassword: async (req, res) => {
  try {
    const { token } = req.params;
    const { email, newPassword } = req.body;

    // TEMPORARY LOCAL DEV MODE
    if (token === "local") {
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const [rows] = await db.query("SELECT * FROM Users WHERE email = ? LIMIT 1", [email]);

      const user = rows[0];
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password_hash
      );
      if (isSamePassword) {
        return res.status(400).json({
          message: "New password cannot be the same as the old one",
        });
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE Users SET password_hash = ? WHERE user_id = ?", [
          newHashedPassword,
          user.user_id,
        ]);

      return res.json({
        message: `Password reset successful for ${email}`,
      });
    }

    // NORMAL TOKEN-BASED RESET (production)
    const tokenData = resetTokens[token];
    if (!tokenData || tokenData.expires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const [rows] = await db.query("SELECT * FROM Users WHERE user_id = ? LIMIT 1", [
        tokenData.userId,
      ]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash
    );
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "New password cannot be the same as the old one" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE Users SET password_hash = ? WHERE user_id = ?", [
        newHashedPassword,
        user.user_id,
      ]);

    delete resetTokens[token];
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
},
};

module.exports = authController;
