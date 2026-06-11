// src/routes/index.js (UPDATED with booking routes)
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/public/home.controller');
const hostRoutes = require('./host.routes');
const bookingRoutes = require('./booking.routes'); // ADD THIS LINE
const User = require('../models/User');

// ==================== PUBLIC ROUTES ====================
router.get('/', homeController.index);
router.get('/login', homeController.loginForm);
router.get('/register', homeController.registerForm);

// ==================== BOOKING ROUTES ====================
// Add this BEFORE other routes to ensure proper matching
router.use('/', bookingRoutes);

// ==================== LOGIN POST HANDLER ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password, redirect } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.redirect('/login?error=Email and password are required');
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.redirect('/login?error=Invalid email or password');
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.redirect('/login?error=Invalid email or password');
    }
    
    // Set session
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.userAvatar = user.avatar;
    
    // Set session max age if remember me is checked
    if (req.body.remember === 'true') {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    }
    
    // Redirect based on role or custom redirect
    const redirectUrl = redirect || '/';
    if (redirectUrl !== '/') {
      return res.redirect(redirectUrl);
    }
    
    if (user.role === 'admin') {
      return res.redirect('/admin');
    } else if (user.role === 'host') {
      return res.redirect('/host/dashboard');
    } else {
      return res.redirect('/');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login?error=Server error. Please try again.');
  }
});

// ==================== REGISTER POST HANDLER ====================
router.post('/register', async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword, phone, role, terms } = req.body;
    
    // Validation
    const errors = [];
    
    if (!fullname || fullname.length < 2) {
      errors.push('Full name must be at least 2 characters');
    }
    
    if (!email) {
      errors.push('Email is required');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    } else if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (!terms) {
      errors.push('You must agree to the Terms of Service');
    }
    
    if (errors.length > 0) {
      const errorMsg = errors.join(', ');
      return res.redirect(`/register?error=${encodeURIComponent(errorMsg)}`);
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.redirect('/register?error=Email already registered');
    }
    
    // Create new user
    const user = new User({ 
      name: fullname,
      email: email.toLowerCase(),
      password: password,
      phone: phone || '',
      role: role || 'user',
      avatar: '/images/default-avatar.png'
    });
    await user.save();
    
    // Set session (auto-login after registration)
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.userAvatar = user.avatar;
    
    // Redirect based on role
    if (user.role === 'host') {
      return res.redirect('/host/dashboard');
    } else {
      return res.redirect('/');
    }
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.code === 11000) {
      return res.redirect('/register?error=Email already registered');
    }
    
    res.redirect('/register?error=Registration failed. Please try again.');
  }
});

// ==================== LOGOUT ====================
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

// ==================== HOST ROUTES ====================
router.use('/host', hostRoutes);

module.exports = router;