const dotenv = require('dotenv').config({ path: './config.env', quiet: true });
const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRouter');
const problemRouter = require('./routes/problemRouter');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');
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
app.use('/api/v1/problems', problemRouter);
app.use((req, res, next) => {
  next(new AppError(404, 'Not Found'));
});

app.use(errorController);

module.exports = app;
