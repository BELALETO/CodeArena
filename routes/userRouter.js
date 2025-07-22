const {
  register,
  login,
  protect,
  restrictTo,
  forgotPassword
} = require('../controllers/authController');
const express = require('express');
const userRouter = express.Router();

// Route for user register
userRouter.post('/register', register);
// Route for user login
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);

// Export the user router
module.exports = userRouter;
