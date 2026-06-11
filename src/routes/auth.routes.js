// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.redirect('/login?error=Email and password are required');
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.redirect('/login?error=Invalid email or password');
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.redirect('/login?error=Invalid email or password');
    }
    
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.userAvatar = user.avatar;
    
    const redirectUrl = req.body.redirect || '/';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login?error=Server error. Please try again.');
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword, phone, role } = req.body;
    
    // Validation
    if (!fullname || fullname.length < 2) {
      return res.redirect('/register?error=Full name must be at least 2 characters');
    }
    
    if (!email) {
      return res.redirect('/register?error=Email is required');
    }
    
    if (!password) {
      return res.redirect('/register?error=Password is required');
    }
    
    if (password.length < 6) {
      return res.redirect('/register?error=Password must be at least 6 characters');
    }
    
    if (!/\d/.test(password)) {
      return res.redirect('/register?error=Password must contain at least one number');
    }
    
    if (password !== confirmPassword) {
      return res.redirect('/register?error=Passwords do not match');
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.redirect('/register?error=Email already registered');
    }
    
    // Create user
    const user = new User({
      name: fullname,
      email: email.toLowerCase(),
      password: password,
      phone: phone || '',
      role: role || 'user'
    });
    
    await user.save();
    
    // Auto-login after registration
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.userAvatar = user.avatar;
    
    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.redirect('/register?error=Email already registered');
    }
    
    res.redirect('/register?error=Registration failed. Please try again.');
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;