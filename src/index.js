// src/index.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const exphbs = require('express-handlebars');

// Load env
dotenv.config();

// Database
const db = require('./config/database');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
db.connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Make session data available to views
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.user_name = req.session.userName;
  res.locals.user_email = req.session.userEmail;
  res.locals.user_avatar = req.session.userAvatar;
  res.locals.user_role = req.session.userRole;
  res.locals.user_id = req.session.userId;
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
const helpers = require('./utils/helpers');
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: helpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/index'));

// 404 handler
// app.use((req, res) => {
//   res.status(404).render('pages/errors/404', { 
//     title: 'Page Not Found',
//     layout: 'main'
//   });
// });

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('pages/errors/500', { 
    title: 'Server Error',
    layout: 'main',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;