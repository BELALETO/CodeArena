const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  updaeMe,
  deleteMe
} = require('../controllers/authController');
const express = require('express');
const userRouter = express.Router();

// Route for user register
userRouter.post('/register', register);
// Route for user login
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);
userRouter.patch('/updatePassword/', protect, updatePassword);
userRouter.patch('/updateMe/', protect, updaeMe);
userRouter.delete('/deleteMe/', protect, deleteMe);

// Export the user router
module.exports = userRouter;
