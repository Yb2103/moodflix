const BASE_URL = 'https://moodflix-backend-0ys5.onrender.com'

export async function moodToGenres(mood) {
  const res = await fetch(`${BASE_URL}/mood-to-genres`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood }),
  })
  if (!res.ok) {
    throw new Error('Failed to convert mood to genres')
  }
  return res.json() // { genres: [...] }
}

export async function getMovies(genres) {
  const query = encodeURIComponent(genres.join(','))
  const res = await fetch(`${BASE_URL}/movies?genres=${query}`)
  if (!res.ok) {
    throw new Error('Failed to fetch movies')
  }
  return res.json() // { movies: [...] }
}

export async function saveFavourite(movie) {
  const res = await fetch(`${BASE_URL}/favourites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movie }),
  })
  if (!res.ok) {
    throw new Error('Failed to save favourite')
  }
  return res.json() // { favourite }
}

export async function getFavourites() {
  const res = await fetch(`${BASE_URL}/favourites`)
  if (!res.ok) {
    throw new Error('Failed to fetch favourites')
  }
  return res.json() // { favourites }
}

export async function saveSearch(mood, genres) {
  const res = await fetch(`${BASE_URL}/searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood, genres }),
  })
  if (!res.ok) {
    throw new Error('Failed to save search')
  }
  return res.json() // { search }
}

export async function getSearches() {
  const res = await fetch(`${BASE_URL}/searches`)
  if (!res.ok) {
    throw new Error('Failed to fetch searches')
  }
  return res.json() // { searches }
}
