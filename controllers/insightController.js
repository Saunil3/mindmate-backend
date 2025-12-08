const Insight = require("../models/Insight");

const insightController = {
  // Fetch all insights for the logged-in user
  getAllInsights: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const insights = await Insight.findAllByUser(userId);

      if (!insights || insights.length === 0) {
        return res.status(200).json([]);
      }

      res.json(insights);
    } catch (err) {
      console.error("Error fetching insights:", err);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  },

  // Create a new insight
  createInsight: async (req, res) => {
    try {
      const { week_start, summary } = req.body;
      const userId = req.user.user_id;

      if (!week_start || !summary) {
        return res
          .status(400)
          .json({ message: "Week start date and summary are required" });
      }

      const newInsight = await Insight.create({
        user_id: userId,
        week_start,
        summary,
      });

      res.status(201).json({
        message: "Insight created successfully",
        insight: newInsight,
      });
    } catch (err) {
      console.error("Error creating insight:", err);
      res.status(500).json({ message: "Failed to create insight" });
    }
  },

  // Delete an existing insight
  deleteInsight: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Insight.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Insight not found" });
      }

      res.json({ message: "Insight deleted successfully" });
    } catch (err) {
      console.error("Error deleting insight:", err);
      res.status(500).json({ message: "Failed to delete insight" });
    }
  },
};

module.exports = insightController;
