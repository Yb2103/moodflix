const express = require('express');
const { moodToGenres } = require('../services/geminiService');

const router = express.Router();

// POST /api/mood-to-genres
router.post('/mood-to-genres', async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood || !mood.trim()) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const genres = await moodToGenres(mood);
    return res.json({ genres });
  } catch (err) {
    console.error('Error in /mood-to-genres:', err.message);
    return res.status(500).json({ error: 'Failed to convert mood to genres' });
  }
});

module.exports = router;
