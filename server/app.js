var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()

// router imports
const apiRouter = require("./routes/api")

// express app setup
var app = express();

// express middleware setup
app.use(express.static(path.join(__dirname, 'build')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// custom middleware
app.use((req, res, next) => {
  // put middleware code here

  // pass on request to next appropriate handler
  next()
})

// routes setup
app.use('/api', apiRouter)

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

module.exports = app;
