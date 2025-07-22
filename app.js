const dotenv = require('dotenv').config({ path: './config.env', quiet: true });
const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRouter');
const errorController = require('./controllers/errorController');
const ApiError = require('./utils/ApiError');
const app = express();

// middlewares
app.use(morgan('dev'));
app.use(express.json());

// testing middleware
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello codeArena!'
  });
});

// routes
app.use('/api/v1/users', userRouter);

app.use((req, res, next) => {
  next(new ApiError(404, 'Not Found'));
});

app.use(errorController);

module.exports = app;
