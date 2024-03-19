const catchAsync = require("./../utils/catchAsync");
const Movie = require("./../models/movieModel");
const {
  validTitle,
  validCategory,
  validDirector,
  validGenres,
} = require("./../utils/movieValidation");

exports.createMovie = async (req, res, next) => {
  try {
    const { title, genres, category, director } = req.body;

    validTitle(title);
    validGenres(genres);
    validCategory(category);
    validDirector(director);

    const movie = await Movie.findOne({ title });

    if (movie) {
       res.status(400).json({ message: "movie title already exist" });
    }

    const newMovie = await Movie.create({
      title,
      genres,
      category,
      director,
      user: req.user._id,
    });

    res.json({
      status: "done",
      movie: newMovie,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllMovie = async (req, res, next) => {
  try {
    const queryObj = { ...req.query };
    //additional funcationality of paggination and sorting
    // const excludedFields = ["page", "sort", "limit", "fields"];
    // excludedFields.forEach(el => delete queryObj[el]);

    // console.log(queryObj);
    const query = Movie.find(queryObj).where({ isActive: true });

    const allMovie = await query;
    res.status(200).json({
      status: "success",
      length: allMovie.length,
      movie: allMovie,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMovie = async (req, res, next) => {
  try {
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
       res
        .status(400)
        .json({ message: "There is no movie with that id" });
    }
    res.status(200).json({
      status: "success",
      movie: movie,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id).where({ isActive: true });

    if (!movie) {
       res
        .status(404)
        .json({ message: "There is no movie with this ID" });
    }

    movie.isActive = false;

    await movie.save();

    res.status(200).json({
      status: "Delete Successfully",
      movie,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, genres, category, director, releaseDate } = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
       res
        .status(404)
        .json({ message: "There is no movie belongs to that id" });
    }

    // Update the movie object with the new values
    if (title) {
      validTitle(title);
      movie.title = title;
      const exist = await Movie.findOne({ title });
      if (exist) {
        return res.status(400).json({ message: "title is already exist" });
      }
    }
    if (genres) {
      validGenres(genres);
      movie.genres = genres;
    }
    if (category) {
      validCategory(category);
      movie.category = category;
    }
    if (director) {
      validDirector(director);
      movie.director = director;
    }
    if (releaseDate) movie.releaseDate = releaseDate;
    const exist = await Movie.findOne({ title });
    if (exist) {
       res.status(400).json({ message: "movie title already exist" });
    }

    const updatedMovie = await movie.save();
    res.status(200).json({
      status: "complete",
      data: {
        updatedMovie,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllDeletedMovie = async (req, res, next) => {
  try {
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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.restoreMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log(id);
    const movie = await Movie.findById(id);

    if (!movie) {
       res.status(404).json({ message: "There is no movie with this id" });
    }

    movie.isActive = true;
    await movie.save();

    res.status(200).json({
      status: "restore success",
      movie,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
