const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
    },
    summary: {
      type: String,
      required: [true, "Please Enter the comment"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must have userId"],
    },
    movie: {
      type: mongoose.Schema.ObjectId,
      ref: "Movie",
      required: [true, "reivew must have movieId"],
    },
  },
  {
    id: false
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
