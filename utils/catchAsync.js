const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      // Handle the error by passing it to the next middleware
      next(err);
    });
  };
};

module.exports = catchAsync;
