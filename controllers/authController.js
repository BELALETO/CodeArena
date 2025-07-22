const user = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm } = req.body;
  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !password || !passwordConfirm) {
    return next(new ApiError(400, 'Please provide all required fields'));
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
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
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
    return next(new ApiError(400, 'Please provide email and password'));
  }
  // Find user by email
  const userFound = await user.findOne({ email }).select('+password');
  // Check if user exists and password is correct
  if (
    !userFound ||
    !(await userFound.correctPassword(password, userFound.password))
  ) {
    return next(
      new ApiError(401, 'Incorrect email or password. Please try again.')
    );
  }
  // Generate JWT token
  const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET, {
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

module.exports = {
  register,
  login
};
