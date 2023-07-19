/* ==================== Node JS Express - Ecommerce - Webdev - Project ==================== */


const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const handlebarsHelpers = require('handlebars-helpers');
const db = require('./config/externalConnectionsConfig');
const session = require('express-session');
const nocache = require('nocache');

require('dotenv').config(); // Module to Load environment variables from .env file


// ====================Establishing connection with db using connect function defined in config/connection path====================
db.connect((err)=>{

  if(err){
    console.log("ERROR in establishing Database connection:" , err);
  }else{
    console.log("Database Connection Successfull: Database is LIVE");
  }

});


// ====================Express Instance Setup====================
const app = express();


// ====================View Engine Setup====================
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',layoutsDir: __dirname+'/app/views/layout/',partialsDir: __dirname+'/app/views/partials/', helpers: handlebarsHelpers()}));


// ====================Application-Level Middlewares====================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:process.env.SESSION_SECRET_KEY,cookie:{maxAge:6000000}}))
app.use(nocache());


// ====================Directory Path to Different Routes====================
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const vendorRouter = require('./routes/vendor');


// ====================ROUTES====================
app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/vendor', vendorRouter);


// ====================404 Not Found Middleware====================
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// ====================Error-handling Middleware====================
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

module.exports = app;
