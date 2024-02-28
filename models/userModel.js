const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "please enter the firstName"],
    },
    lastName: {
      type: String,
    },
    
    age: {
      type: Number,
      min: 0,
      max: 100,
      required: [true, "Please Enter the age of the person"],
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please enter the valid email adress"],
      required: [true, "provide the email address of the user"],
      unique: [true, "email should be unique"],
    },
    phoneNumber: {
      maxLength: [10, "please enter the valid Phone number."],
      minLength: [10, "please enter the valid Phone number."],
      type: String,
      required: [true, "Please enter the phone number"],
    },
    password: {
      type: String,
      minLength : 8,
      required: [true, "Please enter the password"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please enter the passwordConfirm"],
      validate: {
        validator: function (cp) {
          return cp === this.password;
        },
        message: "Password should be match with confirm password",
      },
    },
    role: {
      type: String,
      enum: ["user", "editor", "admin"],
      default: "user",
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);
userSchema.virtual("movies", {
  ref: "Movie",
  foreignField: "user",
  localField: "_id",
});

userSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "user",
  localField: "_id",
});

userSchema.pre("save", async function (next) {
  //if the password is not modify then simply send to the next middleware
  if (!this.isModified("password")) return next();
  //if password is changed then encrypt it using the bcrypt package using the hash function
  //of the cost 12
  console.log("user password : " + this.password);
  this.password = await bcrypt.hash(this.password, 12);
  //before this function work it already check that the password and confirmpassword is same
  //and for that now we no longer use the confirmpassword for any reason
  //so we just remvoe it
  this.passwordConfirm = undefined;
  //now switch to the next middleware
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePasssword,
  userPassword
) {
  return await bcrypt.compare(candidatePasssword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log("resetToken : " + resetToken);
  console.log("EncryptedToken : " + this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
