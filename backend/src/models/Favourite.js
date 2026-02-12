const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
  {
    // For now we use a fixed userId since you are not doing auth.
    userId: {
      type: String,
      required: true,
      default: 'demo-user'
    },
    movieId: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    overview: {
      type: String
    },
    posterPath: {
      type: String
    },
    rating: {
      type: Number
    },
    releaseDate: {
      type: String
    }
  },
  { timestamps: true }
);

const Favourite = mongoose.model('Favourite', favouriteSchema);

module.exports = Favourite;
