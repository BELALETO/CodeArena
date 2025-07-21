const { register, login } = require('../controllers/authController');
const express = require('express');
const userRouter = express.Router();

// Route for user register
userRouter.post('/register', register);
// Route for user login
userRouter.post('/login', login);
// Export the user router
module.exports = userRouter;
