const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Safe helper: always return at least some genres.
async function moodToGenres(moodText) {
  try {
    // If no key, just fallback without calling API
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set, returning default genres');
      return ['Drama', 'Comedy'];
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const prompt = `
You are an assistant that maps user moods to movie genres from TMDB.

User mood: "${moodText}"

Respond ONLY with a JSON object of this exact shape:

{
  "genres": ["Genre1", "Genre2", "Genre3"]
}

Use only valid TMDB genre names, max 3, choose the most relevant.
`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    const response = await axios.post(url, body, {
      params: {
        key: GEMINI_API_KEY
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const candidates = response.data.candidates || [];
    if (!candidates.length) {
      console.warn('No candidates from Gemini, using fallback genres');
      return ['Drama', 'Comedy'];
    }

    const text = candidates[0].content.parts[0].text || '';

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.warn('Could not parse Gemini JSON, text was:', text);
      return ['Drama', 'Comedy'];
    }

    if (!json.genres || !Array.isArray(json.genres) || json.genres.length === 0) {
      console.warn('Gemini JSON had no genres, using fallback');
      return ['Drama', 'Comedy'];
    }

    return json.genres.map((g) => String(g).trim());
  } catch (err) {
    console.error('Error calling Gemini:', err.message);
    // Final fallback so frontend never breaks
    return ['Drama', 'Comedy'];
  }
}

module.exports = {
  moodToGenres
};
