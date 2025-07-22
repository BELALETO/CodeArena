class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true; // Indicates that the error is operational
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
