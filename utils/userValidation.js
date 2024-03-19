const validator = require("email-validator");

exports.userValidation = (values) => {
  const { firstName, age, email, phoneNumber, password, passwordConfirm } =
    values;

  this.validFirstName(firstName);
  this.validEmail(email);
  this.validAge(age);
  this.validPhoneNumber(phoneNumber);
  this.validPassword(password);
  this.validPasswordConfirm(password, passwordConfirm);
};
exports.validFirstName = (value) => {
  if (value.trim() === "") {
    throw new Error("Username is required");
  }
  return true;
};
exports.validEmail = (value) => {
  if (!value) {
    throw new Error("please enter the email");
  }
  if (validator.validate(value)) {
    return true;
  } else {
    throw new Error("please enter the valid email");
  }
};

exports.validAge = (age) => {
  if (!age) {
    throw new Error("");
  }
  if (age < 0 || 100 < age) {
    throw new Error("age must be between 0 to 100");
  }
};

exports.validPhoneNumber = (number) => {
  if (!number) {
    throw new Error("Please enter the phone number");
  }
  if (number.toString().length < 10 || number.toString().length > 10) {
    throw new Error("Invalid phone number");
  }
};

exports.validPassword = (password) => {
  if (password.length < 8) {
    throw new Error("Password should be 8 character long.");
  }
};

exports.validPasswordConfirm = (p, pconfirm) => {
  if (!pconfirm) {
    throw new Error("please enter the confirm password");
  }
  if (p !== pconfirm) {
    throw new Error("Password confirm should match with password");
  }
};
