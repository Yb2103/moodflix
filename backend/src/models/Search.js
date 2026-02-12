const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: 'demo-user'
    },
    mood: {
      type: String,
      required: true
    },
    genres: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
);

const Search = mongoose.model('Search', searchSchema);

module.exports = Search;
