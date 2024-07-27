var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, //1min
  max: 20,
});

var indexRouter = require('./routes/index');
var inventoryRouter = require('./routes/inventory');
const compression = require('compression');
const helmet = require('helmet');

var app = express();
app.use(compression());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  })
);
app.use(limiter);

// Set up mongoose connection
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const mongoDB =
  'mongodb+srv://myAtlasDBUser:wxd30293cblj@cluster0.5h4fiba.mongodb.net/inventory_app?retryWrites=true&w=majority';
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/inventory', inventoryRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
