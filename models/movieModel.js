const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
    },
    genres: {
      type: String,
     
    },
    category: {
      type: String,
    
    },
    director: {
      type: String,
    
    },
    releaseDate: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Movie must belongs to the user('aditor')"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

movieSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "movie",
  localField: "_id",
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
