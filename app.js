const dotenv = require('dotenv').config({ path: './config.env', quiet: true });
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const userRouter = require('./routes/userRouter');
const problemRouter = require('./routes/problemRouter');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const app = express();

const limiter = rateLimit({
  limit: 100,
  windowMs: 15 * 60 * 1000,
  message:
    'Too many requests from the same IP, wait 15 minutes untill you can request again.'
});

// middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(mongoSanitize());
app.use('/api', limiter);
app.use(hpp());
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
