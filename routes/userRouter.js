const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  updaeMe
} = require('../controllers/authController');
const express = require('express');
const userRouter = express.Router();

// Route for user register
userRouter.post('/register', register);
// Route for user login
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);
userRouter.patch('/updatePassword/:id', protect, updatePassword);
userRouter.patch('/updateMe/:id', protect, updaeMe);
userRouter.delete('/deleteMe/:id', protect, updaeMe);

// Export the user router
module.exports = userRouter;
