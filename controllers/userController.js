const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");

exports.getAllUser = catchAsync(async (req, res, next) => {
  const allUser = await User.find({});
  res.status(200).json({
    status: "success",
    data: allUser,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate({
    path: 'reviews',
    select : "rating summary -user -_id"
  })
  if (!user) return next(new AppError("user is no longer available", 404));
  res.status(200).json({
    status: "success",
    data: user,
  });
});


