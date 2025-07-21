const dotenv = require('dotenv').config({ path: './config.env', quiet: true });
const express = require('express');
const morgan = require('morgan');

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

module.exports = app;
