const catchAsync = require("./../utils/catchAsync");
const Review = require("./../models/reviewModel");
const Movie = require("../models/movieModel");
const AppError = require('./../utils/appError')

exports.getAllReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: "success",
    data: reviews,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const movieId = req.body.movie;
  //first check that the movieId is valid or not or it's active or not
  const movie = await Movie.findById(movieId).where({isActive : true})
  if (!movie) {
    return next(new AppError('Invalid movie Id.'), 404)
  }
  const newReview = new Review({
    rating: req.body.rating,
    summary: req.body.summary,  
    user: req.user._id,
    movie: movieId,
  });
  const review = await newReview.save();
  res.status(200).json({
    status: "success",
    data: review,
  });

  // const newReview = await Review.create(req.body);
  // console.log(newReview);
  // res.status(200).json({
  //   status: "success",
  //   data: newReview,
  // });
});
