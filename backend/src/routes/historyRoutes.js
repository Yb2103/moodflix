const express = require('express');
const Search = require('../models/Search');

const router = express.Router();

// POST /api/searches
router.post('/searches', async (req, res) => {
  try {
    const { mood, genres } = req.body;
    if (!mood || !mood.trim()) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const search = await Search.create({
      userId: 'demo-user',
      mood,
      genres: Array.isArray(genres) ? genres : []
    });

    return res.status(201).json({ search });
  } catch (err) {
    console.error('Error in POST /searches:', err.message);
    return res.status(500).json({ error: 'Failed to save search' });
  }
});

// GET /api/searches
router.get('/searches', async (req, res) => {
  try {
    const searches = await Search.find({ userId: 'demo-user' })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ searches });
  } catch (err) {
    console.error('Error in GET /searches:', err.message);
    return res.status(500).json({ error: 'Failed to fetch searches' });
  }
});

module.exports = router;
