const handleDuplicateFieldError = (err, res) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  res.status(400).json({
    status: 'fail',
    message: `Duplicate field value: ${field} with value ${value}. Please use another value!`
  });
};

const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  res.status(400).json({
    status: 'fail',
    message: `Validation Error: ${errors.join(', ')}`
  });
};

const handleCastError = (err, res) => {
  res.status(400).json({
    status: 'fail',
    message: `Invalid ${err.path}: ${err.value}`
  });
};

const devError = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
    stack: err.stack,
    error: err
  });
};

const prodError = (err, res) => {
  // Duplicate field error (MongoDB)
  if (err.code === 11000) {
    return handleDuplicateFieldError(err, res);
  }

  if (err.isValidationError) {
    return handleValidationError(err, res);
  }

  if (err.name === 'CastError') {
    return handleCastError(err, res);
  }

  // Operational error
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      status: err.status || 'fail',
      message: err.message
    });
  }

  // Programming or unknown error
  console.error('ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    devError(err, res);
  } else {
    prodError(err, res);
  }
};
