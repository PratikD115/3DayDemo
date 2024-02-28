const express = require("express");
const movieController = require("./../controllers/movieController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.get(
  "/deletedMovie",
  authController.protect,
  authController.restrictTo("admin"),
  movieController.getAllDeletedMovie
);

router
  .route("/restoreMovie/:id")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    movieController.restoreMovie
  );

router
  .route("/")
  .get(authController.protect, movieController.getAllMovie)
  .post(
    authController.protect,
    authController.restrictTo("editor", "admin"),
    movieController.createMovie
  );

router
  .route("/:id")
  .get(authController.protect, movieController.getMovie)
  .patch(
    authController.protect,
    authController.restrictTo("editor", "admin"),
    movieController.updateMovie
  )
  .delete(
    authController.protect,
    authController.restrictTo("editor", "admin"),
    movieController.deleteMovie
  );

module.exports = router;
