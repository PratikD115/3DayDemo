const catchAsync = require("./../utils/catchAsync");
const Review = require("./../models/reviewModel");
const Movie = require("../models/movieModel");
const {
  validRating,
  validSummary,
} = require("./../utils/reviewValidation");

exports.getAllReview = async (req, res, next) => {
  try {
    const reviews = await Review.find();
    res.status(200).json({
      status: "success",
      length: reviews.length,
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { rating, summary } = req.body;
    const movieId = req.params.id;
    
    //first check that the movieId is valid or not or it's active or not
    const movie = await Movie.findById(movieId).where({ isActive: true });
    if (!movie) {
       res.status(404).json({ message: "Invalid movie Id." });
    }

    validRating(rating);
    validSummary(summary);

    const newReview = new Review({
      rating,
      summary,
      user: req.user._id,
      movie: movieId,
    });
    const review = await newReview.save();
    res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
