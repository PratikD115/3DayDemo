class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    console.log(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
