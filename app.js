require('dotenv').config();

const express = require('express');
const debug = require('debug')('wdb-faq:main');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const engine = require('ejs-mate');

const authRouter = require('./routes/user.js');
const indexRoutes = require('./routes/index');
const solutionRoutes = require('./routes/solutions');

const app = express();

// Connect to mongodb database
mongoose.connect('mongodb://localhost:27017/wdb-faq-app', { useNewUrlParser: true ,useCreateIndex:true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  debug('Database connected');
});

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Configure session
app.use(session({
  secret: 'this is a random string',
  resave: false,
  saveUninitialized: true
}));

// Configure passport
app.use(passport.initialize());
app.use(passport.session());
const User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Use flash messages
app.use(flash());

// Set flash messages
app.use((req, res, next) => {
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	res.locals.currentUser = req.user;

	next();
});

app.use('/', indexRoutes);
app.use('/auth', authRouter);
app.use('/solutions', solutionRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
