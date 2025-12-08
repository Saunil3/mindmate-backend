const axios = require("axios");

// Mood keyword mapping
const moodTags = {
  happy: ["happiness", "joy", "smile", "positive"],
  neutral: ["life", "balance", "calm"],
  sad: ["hope", "strength", "healing"],
  anxious: ["confidence", "peace", "calm"],
  stressed: ["relaxation", "resilience", "patience"],
};

const quoteController = {
  // Fetch quote from external API
  getQuoteByMood: async (req, res) => {
    try {
      const { mood } = req.query;
      if (!mood) {
        return res.status(400).json({ message: "Mood query required (e.g. ?mood=sad)" });
      }

      const tags = moodTags[mood.toLowerCase()] || ["life", "motivation"];
      const { data } = await axios.get("https://zenquotes.io/api/quotes");

      // Filter based on tags
      const filtered = data.filter((q) =>
        tags.some((tag) => q.q.toLowerCase().includes(tag))
      );

      // Pick random quote — fallback to random from all
      const pool = filtered.length > 0 ? filtered : data;
      const randomQuote = pool[Math.floor(Math.random() * pool.length)];

      return res.json({
        mood,
        quote: randomQuote.q,
        author: randomQuote.a || "Unknown",
      });
    } catch (err) {
      console.error("Quote fetch failed:", err.message);
      res.status(500).json({
        message: "Could not fetch quote at this time. Please try again later.",
      });
    }
  },
};

module.exports = quoteController;
