const express = require('express');
const Favourite = require('../models/Favourite');

const router = express.Router();

// POST /api/favourites
router.post('/favourites', async (req, res) => {
  try {
    const { movie } = req.body;
    if (!movie || !movie.movieId || !movie.title) {
      return res.status(400).json({ error: 'movieId and title are required' });
    }

    const favourite = await Favourite.create({
      userId: 'demo-user',
      movieId: movie.movieId,
      title: movie.title,
      overview: movie.overview || '',
      posterPath: movie.posterPath || '',
      rating: movie.rating || 0,
      releaseDate: movie.releaseDate || ''
    });

    return res.status(201).json({ favourite });
  } catch (err) {
    console.error('Error in POST /favourites:', err.message);
    return res.status(500).json({ error: 'Failed to save favourite' });
  }
});

// GET /api/favourites
router.get('/favourites', async (req, res) => {
  try {
    const favourites = await Favourite.find({ userId: 'demo-user' }).sort({
      createdAt: -1
    });
    return res.json({ favourites });
  } catch (err) {
    console.error('Error in GET /favourites:', err.message);
    return res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

module.exports = router;
