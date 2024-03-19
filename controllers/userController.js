const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");

exports.getAllUser = async (req, res, next) => {
  try {
    const allUser = await User.find({});

    res.status(200).json({
      status: "success",
      data: allUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "reviews",
      select: "rating summary -user -_id",
    });
    if (!user)
       res.status(404).json({ message: "user is no longer available" });
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
