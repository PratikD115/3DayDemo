const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default : true
    },
    title: {
      type: String,
      unique: true,
      require: [true, "Please! provide the title of the movie."],
    },
    genres: {
      type: String,
      require: [true, "Please! provide the genres of the movie."],
    },
    category: {
      type: String,
      require: [true, "Please! provide the category of the movie."],
    },
    director: {
      type: String,
      required: [true, "Please provide the directore name of the movie."],
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
    id : false
  }
);

movieSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "movie",
  localField: "_id",
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
