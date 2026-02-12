import React, { useState, useEffect } from 'react'
import {
  moodToGenres,
  getMovies,
  saveFavourite,
  getFavourites,
  saveSearch,
  getSearches,
} from './api'

function App() {
  const [activeTab, setActiveTab] = useState('discover')
  const [mood, setMood] = useState('')
  const [genres, setGenres] = useState([])
  const [movies, setMovies] = useState([])
  const [favourites, setFavourites] = useState([])
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load favourites & history on first render
  useEffect(() => {
    fetchInitialData()
  }, [])

  async function fetchInitialData() {
    try {
      const [favRes, searchRes] = await Promise.all([
        getFavourites(),
        getSearches(),
      ])
      setFavourites(favRes.favourites || [])
      setSearches(searchRes.searches || [])
    } catch (e) {
      console.error(e)
    }
  }

  async function handleGetRecommendations(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setMovies([])
    setGenres([])

    try {
      if (!mood.trim()) {
        setError('Please describe your mood or situation.')
        setLoading(false)
        return
      }

      // 1) mood -> genres via backend (Gemini)
      const { genres: g } = await moodToGenres(mood)
      if (!g || g.length === 0) {
        setError('Could not find suitable genres. Try a different mood.')
        setLoading(false)
        return
      }
      setGenres(g)

      // 2) save search
      try {
        const res = await saveSearch(mood, g)
        setSearches((prev) => [res.search, ...prev])
      } catch (e) {
        console.error('Failed to save search, continuing...', e)
      }

      // 3) genres -> movies via backend (TMDB)
      const { movies: m } = await getMovies(g)
      setMovies(m || [])
    } catch (e) {
      console.error(e)
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddFavourite(movie) {
    try {
      const res = await saveFavourite(movie)
      setFavourites((prev) => [res.favourite, ...prev])
    } catch (e) {
      console.error(e)
      setError('Failed to add favourite.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
              MF
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">MoodFlix</h1>
              <p className="text-xs text-slate-400">
                AI-powered mood based movie recommendations
              </p>
            </div>
          </div>

          <nav className="flex gap-2 text-sm">
            <TabButton
              label="Discover"
              active={activeTab === 'discover'}
              onClick={() => setActiveTab('discover')}
            />
            <TabButton
              label="Favourites"
              active={activeTab === 'favourites'}
              onClick={() => setActiveTab('favourites')}
            />
            <TabButton
              label="History"
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
            />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'discover' && (
          <DiscoverView
            mood={mood}
            setMood={setMood}
            genres={genres}
            movies={movies}
            loading={loading}
            error={error}
            onSubmit={handleGetRecommendations}
            onAddFavourite={handleAddFavourite}
          />
        )}

        {activeTab === 'favourites' && (
          <FavouritesView favourites={favourites} />
        )}

        {activeTab === 'history' && <HistoryView searches={searches} />}
      </main>

      <footer className="border-t border-slate-800 mt-6">
        <div className="max-w-5xl mx-auto px-4 py-4 text-xs text-slate-500 flex items-center justify-between">
          <span>MoodFlix · Personal project</span>
          <span>Backend: Node + Express · Frontend: React + Vite</span>
        </div>
      </footer>
    </div>
  )
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-indigo-500 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  )
}

function DiscoverView({
  mood,
  setMood,
  genres,
  movies,
  loading,
  error,
  onSubmit,
  onAddFavourite,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
      {/* Left: mood form */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-950/40">
        <h2 className="text-lg font-semibold mb-1">Describe your mood</h2>
        <p className="text-xs text-slate-400 mb-4">
          Type how you&apos;re feeling or what kind of movie vibe you want.
          Example: &quot;Chill, light-hearted after exams&quot;.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            className="w-full h-28 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="I am feeling..."
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-sm font-medium transition-colors"
          >
            {loading ? 'Finding movies...' : 'Get recommendations'}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {genres && genres.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-1">Detected genres:</p>
            <div className="flex flex-wrap gap-1">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-1 rounded-full bg-slate-800 text-[11px] text-slate-200 border border-slate-700"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Right: movie results */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recommended movies</h2>
          <p className="text-xs text-slate-400">
            {movies.length > 0
              ? `${movies.length} results`
              : loading
              ? 'Searching...'
              : 'No results yet'}
          </p>
        </div>

        {movies.length === 0 && !loading && (
          <p className="text-xs text-slate-400">
            Enter a mood and click &quot;Get recommendations&quot; to see movies.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {movies.map((movie) => (
            <MovieCard
              key={movie.movieId}
              movie={movie}
              onAddFavourite={() => onAddFavourite(movie)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function MovieCard({ movie, onAddFavourite }) {
  const imageUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null

  return (
    <article className="flex gap-3 bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
      {imageUrl && (
        <div className="w-20 sm:w-24 bg-slate-900 overflow-hidden">
          <img
            src={imageUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 p-3 flex flex-col">
        <h3 className="text-sm font-semibold mb-1 line-clamp-2">
          {movie.title}
        </h3>
        <p className="text-[11px] text-slate-400 line-clamp-3 mb-2">
          {movie.overview || 'No overview available.'}
        </p>
        <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400">
          <span>{movie.releaseDate || 'Unknown year'}</span>
          <span>⭐ {movie.rating?.toFixed ? movie.rating.toFixed(1) : movie.rating}</span>
        </div>
        <button
          onClick={onAddFavourite}
          className="mt-2 w-full text-[11px] px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
        >
          Add to favourites
        </button>
      </div>
    </article>
  )
}

function FavouritesView({ favourites }) {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-950/40">
      <h2 className="text-lg font-semibold mb-2">Your favourites</h2>
      <p className="text-xs text-slate-400 mb-4">
        Movies you&apos;ve marked as favourites are stored in MongoDB.
      </p>

      {favourites.length === 0 ? (
        <p className="text-xs text-slate-400">
          No favourites yet. Go to Discover and add some.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favourites.map((fav) => (
            <article
              key={fav._id}
              className="flex gap-3 bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden"
            >
              {fav.posterPath && (
                <div className="w-20 sm:w-24 bg-slate-900 overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${fav.posterPath}`}
                    alt={fav.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-3 flex flex-col">
                <h3 className="text-sm font-semibold mb-1 line-clamp-2">
                  {fav.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-3 mb-2">
                  {fav.overview || 'No overview available.'}
                </p>
                <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400">
                  <span>{fav.releaseDate || 'Unknown year'}</span>
                  <span>⭐ {fav.rating?.toFixed ? fav.rating.toFixed(1) : fav.rating}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function HistoryView({ searches }) {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-950/40">
      <h2 className="text-lg font-semibold mb-2">Search history</h2>
      <p className="text-xs text-slate-400 mb-4">
        Recent moods and the genres that were detected for them.
      </p>

      {searches.length === 0 ? (
        <p className="text-xs text-slate-400">No searches yet.</p>
      ) : (
        <ul className="space-y-3 text-xs">
          {searches.map((s) => (
            <li
              key={s._id}
              className="border border-slate-800 rounded-xl px-3 py-2 bg-slate-950/60"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium text-slate-100 line-clamp-1">
                  {s.mood}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(s.genres || []).map((g) => (
                  <span
                    key={g}
                    className="px-2 py-1 rounded-full bg-slate-800 text-[10px] text-slate-200 border border-slate-700"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default App
