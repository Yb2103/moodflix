const express = require('express');
const { fetchMoviesByGenres } = require('../services/tmdbService');

const router = express.Router();

// GET /api/movies?genres=Drama,Romance
router.get('/movies', async (req, res) => {
  try {
    const genresParam = req.query.genres || '';
    const genreNames = genresParam
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    if (!genreNames.length) {
      return res.status(400).json({ error: 'At least one genre is required' });
    }

    const movies = await fetchMoviesByGenres(genreNames);
    return res.json({ movies });
  } catch (err) {
    console.error('Error in /movies:', err.message);
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

module.exports = router;
