const express = require("express");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRoutes = require("./routes/userRoute");
const movieRoutes = require("./routes/movieRoute");
const reviewRoutes = require("./routes/reviewRoute");

const app = express();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/movie", movieRoutes);
app.use("/review", reviewRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
