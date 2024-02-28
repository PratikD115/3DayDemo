const catchAsync = require("./../utils/catchAsync");
const Movie = require("./../models/movieModel");
const AppError = require("./../utils/appError");
// exports.getAllMovie = catchAsync(async (req, res, next) => {
//   res.json({ status: "done" });
// });

exports.createMovie = catchAsync(async (req, res, next) => {
  const newMovie = await Movie.create({
    title: req.body.title,
    genres: req.body.genres,
    category: req.body.category,
    director: req.body.director,
    user: req.user._id,
  });
  res.json({
    status: "done",
    movie: newMovie,
  });
});

exports.getAllMovie = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  //additional funcationality of paggination and sorting
  // const excludedFields = ["page", "sort", "limit", "fields"];
  // excludedFields.forEach(el => delete queryObj[el]);

  // console.log(queryObj);
  const query = Movie.find(queryObj).where({ isActive: true });

  const allMovie = await query;
  res.status(200).json({
    status: "success",
    movie: allMovie,
  });
});

exports.getMovie = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const movie = await Movie.findById(id)
    .where({ isActive: true })
    .populate({
      path: "reviews",
      select: "rating summary -movie -_id",
    })
    .populate({
      path: "user",
      select: "firstName role -_id",
    });
  if (!movie) {
    return next(new AppError('there is no movie with that id'), 400)
  }
  res.status(200).json({
    status: "success",
    movie: movie,
  });
});

exports.deleteMovie = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const movie = await Movie.findById(id).where({isActive : true})
  if (!movie) {
    return next(new AppError("There is no movie with this ID", 404));
  }

  movie.isActive = false;
  await movie.save();
  res.status(200).json({
    status: "Delete Successfully",
    movie,
  });
});

exports.updateMovie = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const movie = await Movie.findById(id);
  if (!movie) {
    return next(new AppError("There is no movie belongs to that id", 404));
  }
  const { title, genres, category, director, releaseDate } = req.body;
  // Update the movie object with the new values
  if (title) movie.title = title;
  if (genres) movie.genres = genres;
  if (category) movie.category = category;
  if (director) movie.director = director;
  if (releaseDate) movie.releaseDate = releaseDate;

  const updatedMovie = await movie.save();
  res.json({
    status: "complete",
    data: {
      updatedMovie,
    },
  });
});

exports.getAllDeletedMovie = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  //additional funcationality of paggination and sorting
  // const excludedFields = ["page", "sort", "limit", "fields"];
  // excludedFields.forEach(el => delete queryObj[el]);

  // console.log(queryObj);
  const query = Movie.find(queryObj).where({ isActive: false });

  const allDelMovie = await query;
  res.status(200).json({
    status: "success",
    movie: allDelMovie,
  });
});

exports.restoreMovie = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // console.log(id);
  const movie = await Movie.findById(id);
  if (!movie) {
    return next(new AppError("There is no movie with this id", 404));
  }
  movie.isActive = true;
  await movie.save();

  res.status(200).json({
    status: "restore success",
    movie,
  });
});
