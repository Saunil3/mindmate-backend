const express = require("express");
const router = express.Router();
const db = require("../config/Database");
const { authenticateToken } = require("../Middleware/auth"); 

// SEND FRIEND REQUEST
router.post("/request/:id", authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.user_id;
    const receiverId = parseInt(req.params.id);

    // Cannot request yourself
    if (senderId === receiverId) {
      return res.status(400).json({ message: "You cannot send a request to yourself." });
    }

    // Check if target user is admin
    const [roleCheck] = await db.query(
      "SELECT role FROM Users WHERE user_id = ?",
      [receiverId]
    );

    if (roleCheck.length && roleCheck[0].role === "admin") {
      return res.status(403).json({ message: "You cannot send request to admin." });
    }

    // Prevent duplicate request
    const [existing] = await db.query(
      `SELECT * FROM FriendRequests
      WHERE 
        (sender_id=? AND receiver_id=?)
        OR
        (sender_id=? AND receiver_id=?)`,
      [senderId, receiverId, receiverId, senderId]
    );

    if (existing.length > 0) {
      if (existing[0].status === "accepted") {
        return res.status(400).json({ message: "You are already friends." });
      } else {
        return res.status(400).json({ message: "A friend request already exists." });
      }
    }


    // Insert request
    await db.query(
      "INSERT INTO FriendRequests (sender_id, receiver_id, status) VALUES (?, ?, 'pending')",
      [senderId, receiverId]
    );

    res.json({ message: "Friend request sent successfully." });

  } catch (err) {
    console.error("Send friend request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET RECEIVED FRIEND REQUESTS
router.get("/received", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await db.query(
      `
      SELECT 
        fr.request_id,
        u.user_id,
        u.username,
        u.email
      FROM FriendRequests fr
      JOIN Users u ON u.user_id = fr.sender_id
      WHERE fr.receiver_id=? AND fr.status='pending'
      `,
      [userId]
    );

    res.json(rows);

  } catch (err) {
    console.error("Fetch received requests error:", err);
    res.status(500).json({ message: "Failed to load friend requests" });
  }
});


// ACCEPT FRIEND REQUEST
router.post("/accept/:requestId", authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.requestId;

    // Mark request as accepted
    await db.query(
      "UPDATE FriendRequests SET status='accepted' WHERE request_id=?",
      [requestId]
    );

    res.json({ message: "Friend request accepted" });

  } catch (err) {
    console.error("Accept request error:", err);
    res.status(500).json({ message: "Failed to accept request" });
  }
});


// REJECT FRIEND REQUEST
router.post("/reject/:requestId", authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.requestId;

    await db.query(
      "DELETE FROM FriendRequests WHERE request_id=?",
      [requestId]
    );

    res.json({ message: "Friend request rejected" });

  } catch (err) {
    console.error("Reject request error:", err);
    res.status(500).json({ message: "Failed to reject request" });
  }
});


// FRIEND LIST (Distinct, Clean)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [friends] = await db.query(
      `
      SELECT DISTINCT
        u.user_id,
        u.username,
        u.email,
        u.about_me
      FROM FriendRequests fr
      JOIN Users u
        ON (u.user_id = fr.sender_id AND fr.receiver_id = ?)
        OR (u.user_id = fr.receiver_id AND fr.sender_id = ?)
      WHERE fr.status='accepted'
      `,
      [userId, userId]
    );

    res.json(friends);

  } catch (err) {
    console.error("Friends list error:", err);
    res.status(500).json({ message: "Failed to load friends" });
  }
});


// GET FRIEND STATUS
router.get("/status/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const otherId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT status FROM FriendRequests
      WHERE (sender_id=? AND receiver_id=?)
         OR (sender_id=? AND receiver_id=?)
      `,
      [userId, otherId, otherId, userId]
    );

    if (rows.length === 0) return res.json({ status: "none" });

    res.json({ status: rows[0].status });

  } catch (err) {
    console.error("Friend status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET PENDING REQUEST COUNT
router.get("/requests/pending", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await db.query(
      `
      SELECT request_id 
      FROM FriendRequests
      WHERE receiver_id=? AND status='pending'
      `,
      [userId]
    );

    res.json({ count: rows.length });

  } catch (err) {
    console.error("Pending count error:", err);
    res.status(500).json({ message: "Failed to load pending count" });
  }
});

// REMOVE A FRIEND
router.delete("/remove/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const friendId = req.params.id;

    // Delete accepted friendships in either direction
    await db.query(
      `DELETE FROM FriendRequests 
       WHERE 
         (sender_id=? AND receiver_id=?)
         OR 
         (sender_id=? AND receiver_id=?)`,
      [userId, friendId, friendId, userId]
    );

    res.json({ message: "Friend removed successfully" });

  } catch (err) {
    console.error("Remove friend error:", err);
    res.status(500).json({ message: "Failed to remove friend" });
  }
});

module.exports = router;
