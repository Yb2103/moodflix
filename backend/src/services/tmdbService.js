const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Map TMDB genre names to IDs (from TMDB docs).[web:10]
const GENRE_MAP = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  Thriller: 53,
  War: 10752,
  Western: 37
};

function genreNamesToIds(genreNames) {
  if (!Array.isArray(genreNames)) return [];
  return genreNames
    .map((name) => GENRE_MAP[name])
    .filter((id) => !!id);
}

async function fetchMoviesByGenres(genreNames) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not set');
  }

  const genreIds = genreNamesToIds(genreNames);
  if (!genreIds.length) {
    return [];
  }

  const url = `${TMDB_BASE_URL}/discover/movie`;
  const params = {
    api_key: TMDB_API_KEY,
    with_genres: genreIds.join(','),
    sort_by: 'popularity.desc',
    include_adult: false,
    page: 1
  };

  const response = await axios.get(url, { params });

  const results = response.data.results || [];

  return results.map((movie) => ({
    movieId: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    rating: movie.vote_average,
    releaseDate: movie.release_date
  }));
}

module.exports = {
  GENRE_MAP,
  genreNamesToIds,
  fetchMoviesByGenres
};
