var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var fileUpload = require('express-fileupload');
var db = require('./config/connection');
var session = require('express-session');
var nocache = require('nocache');

require('dotenv').config(); // Module to Load environment variables from .env file


// ====================Directory Path to Different Routes====================
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir: __dirname+'/views/layout/',partialsDir: __dirname+'/views/partials/'}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({secret:process.env.SESSION_SECRET_KEY,cookie:{maxAge:6000000}}))
app.use(nocache());

//Establishing connection with db using connect function defined in config/connection path
db.connect((err)=>{

  if(err)
  console.log("ERROR in establishing Database connection:" + err);
  else
  console.log("Database Connection Successfull: Database is LIVE");

});

// ====================ROUTES====================
app.use('/', userRouter);
app.use('/admin', adminRouter);

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
  res.render('error');
});

module.exports = app;
