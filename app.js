const createError = require('http-errors');
const express = require('express');
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
dotenv.config();
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
// const authorRouter = require('./routes/authorRoute');
const catalogRouter = require("./routes/catalog")

const app = express();

// Connect to Database
mongoose.connect(process.env.DB_CONNECTION)
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error(err));

// view engine setup

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});
// Apply rate limiter to all requests
app.use(limiter);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use("/api", authorRouter);
app.use("/catalog", catalogRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {err: "Testing"});
});

module.exports = app;
