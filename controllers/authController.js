const User = require("../models/userModel");
const jwt = require("jsonwebtoken"); //generate the token validation
const multer = require("multer"); // for uploading the photos to the file system
const { promisify } = require("util");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");
const userValidator = require("./../utils/userValidation");
const {
  validFirstName,
  validPassword,
  validPasswordConfirm,
} = require("./../utils/userValidation");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image/users");
  },
  filename: (req, file, cb) => {
    //user-userID-timestamp.extention
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.body.firstName}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      res
        .status(400)
        .json({ message: "not an image! Please upload only images" }),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("profile");

const asignToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = asignToken(user._id);
  //send that token to the user with the response
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, age, phoneNumber } = req.body;
    validFirstName(firstName);
    const Email = await User.findOne({ email });
    if (!Email) {
      // const {
      //   firstName,
      //   lastName,
      //   age,
      //   email,
      //   phoneNumber,
      //   password,
      //   passwordConfirm,
      // } = req.body;
      // try {
      //   userValidator.userValidation(req.body);

      //   const Email = await User.findOne({ email });
      //   // console.log(Email);
      //   if (Email) {
      //     throw new Error("Duplicate email please enter the another email");
      //   }

      //   const newUser = new User({
      //     firstName,
      //     lastName,
      //     age,
      //     email,
      //     phoneNumber,
      //     password,
      //     passwordConfirm,
      //   });
      //   const user = await newUser.save();
      //   return res.status(200).json({
      //     status: "success",
      //     data: user,
      //   });
      // } catch (err) {
      //   return res.status(400).json({ message: err.message });
      // }
      console.log(res);
      this.createUser(req);
    } else {
      const { firstName, lastName, age, phoneNumber } = req.body;
      Email.firstName = firstName;
      Email.lastName = lastName;
      Email.age = age;
      Email.phoneNumber = phoneNumber;
      const changeduser = await Email.save();
      res.json({ data: changeduser });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res, next) => {
  const {
    firstName,
    lastName,
    age,
    email,
    phoneNumber,
    password,
    passwordConfirm,
  } = req.body;
  try {
    userValidator.userValidation(req.body);

    const Email = await User.findOne({ email });
    // console.log(Email);
    if (Email) {
      throw new Error("Duplicate email please enter the another email");
    }

    const newUser = new User({
      firstName,
      lastName,
      age,
      email,
      phoneNumber,
      password,
      passwordConfirm,
    });
    const user = await newUser.save();
    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    // Destructure the email and password from the req.body
    const { email, password } = req.body;
    // Check if the email and password are provided
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }
    // Find the user by email
    const user = await User.findOne({ email }).select("+password");

    // If user not found or password is incorrect
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error("Incorrect email or password");
    }
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    //1.getting the token and check is it there or not
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(403).json({
        message: "You are not logged in Please logged in to get access",
      });
    }
    //2.verification of the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3.check if the user still exist or not
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      throw new Error("User is now no longer exist");
    }
    //4.check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        message: "User recently changed password! Please log in again",
      });
    }
    req.user = freshUser;
    next();
  } catch (err) {
    res.status(400).json({ message: "You are not loged in" });
  }
};

//it restrict the roles to perform the operation
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //if the client role match the roles array then client has permisssion to perform that action.
    try {
      if (!roles.includes(req.user.role)) {
        throw new Error("You do not have permission to perform this Action.");
      }
    } catch (err) {
      res.status(403).json({
        message: err.message,
      });
    }
    next();
  };
};

//user forgot the password but know the email address
exports.forgotPassword = async (req, res, next) => {
  try {
    //1. get the user from POSTed email
    const user = await User.findOne({ email: req.body.email });
    // console.log(user);
    if (!user) {
      return res
        .status(400)
        .json({ message: "There is no user with this email Address" });
    }
    //2. generate the resetpassword token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3.send that token to the userMail
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/user/resetPassword/${resetToken}`;

    const message = `Forgot your password? \nSubmit a PATCH request with your new password and passwordConfirm to : ${resetURL}\n If you didn't forgot your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
      });

      return res.status(200).json({
        status: "success",
        message: "Token send to the mail",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        message: "There was an error sending the email, Try again later!",
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//it reset the password with token,
exports.resetPassword = async (req, res, next) => {
  try {
    const { password, passwordConfirm } = req.body;
    // console.log(password, passwordConfirm);
    //validate the password and confirm password
    validPassword(password);
    validPasswordConfirm(password, passwordConfirm);

    //1.Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    //2. If token has not expired and there is user, set the new password
    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3. Update changedPasswordAt property for the user
    //4. Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update the logedin user
exports.updatePassword = async (req, res, next) => {
  try {
    const { passwordCurrent, password, passwordConfirm } = req.body;
    console.log(passwordCurrent, password, passwordConfirm);
    validPassword(password);
    validPasswordConfirm(password, passwordConfirm);

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Ther is no user" });
    }
    // console.log(user);
    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      return res
        .status(401)
        .json({ message: "your Current password is wrong!" });
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // createSendToken(user, 200, res);
    return res.status(200).json({
      message: "password changed Please log in again!",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
