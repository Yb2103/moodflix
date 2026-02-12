require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const moodRoutes = require('./routes/moodRoutes');
const movieRoutes = require('./routes/movieRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

// Middleware
app.use(cors()); // allow all origins for now; we can restrict later.[web:23][web:26]
app.use(express.json());

// Routes
app.use('/api', moodRoutes);
app.use('/api', movieRoutes);
app.use('/api', favouriteRoutes);
app.use('/api', historyRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'MoodFlix backend is running' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });
