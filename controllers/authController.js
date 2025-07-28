const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const user = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const sendMail = require('../utils/sendMail');

const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);

const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm } = req.body;
  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !password || !passwordConfirm) {
    return next(new AppError(400, 'Please provide all required fields'));
  }
  // Create a new user
  const newUser = await user.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm
  });
  // Generate JWT token
  const token = await sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError(400, 'Please provide email and password'));
  }
  // Find user by email
  const userFound = await user.findOne({ email }).select('+password');
  // Check if user exists and password is correct
  if (
    !userFound ||
    !(await userFound.correctPassword(password, userFound.password))
  ) {
    return next(
      new AppError(401, 'Incorrect email or password. Please try again.')
    );
  }
  // Generate JWT token
  const token = await sign({ id: userFound._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: userFound
    }
  });
});

const protect = catchAsync(async (req, res, next) => {
  //* Check if the token is provided
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    return next(new AppError(401, 'Not authorized, no token provided'));
  }
  //* Extract the token from Authorization header:
  const token = req.headers.authorization.split(' ').at(1);
  if (!token) {
    return next(new AppError(401, 'Not authorized, no token'));
  }
  //* Verify the token
  const decoded = await verify(token, process.env.JWT_SECRET);

  //* Check if the user is existing or not
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError(401, 'Not authorized, user not found'));
  }
  //* Check if the user has changed his password recently
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(401, 'User recently changed password! Please log in again.')
    );
  }
  //* Grant access to protected route
  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const authorized = roles.includes(req.user.role);
    if (!authorized) {
      return next(
        new AppError(403, "You're forbidden from accessing this route.")
      );
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log('email :>> ', email);
  if (!email) {
    return next(new AppError(400, 'Please provide the email'));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(404, "Can't find a user with this email 😔"));
  }

  //TODO: generate a random token.
  const resetToken = await user.generateToken();
  await user.save({ validateBeforeSave: false });

  //TODO: send the token via email.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;
  try {
    await sendMail({
      recipient: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      text: message,
      html: `<p>${message}</p>`
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log('err :>> ', err);
    return next(new AppError(500, 'There was an error sending the email'));
  }
});

module.exports = {
  register,
  login,
  protect,
  restrictTo,
  forgotPassword
};
