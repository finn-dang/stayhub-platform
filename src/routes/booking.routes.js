// src/routes/booking.routes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/public/room.controller');
const { isAuthenticated } = require('../middleware/auth');

// Room detail - PUBLIC (no authentication required)
router.get('/rooms/:id', roomController.detail);

// Booking routes - AUTHENTICATED (login required)
router.get('/rooms/:id/checkout', isAuthenticated, roomController.checkout);
router.post('/rooms/:id/book', isAuthenticated, roomController.createBooking);
router.get('/booking/confirmation/:id', isAuthenticated, roomController.confirmation);
router.get('/my-bookings', isAuthenticated, roomController.myBookings);
router.post('/booking/cancel/:id', isAuthenticated, roomController.cancelBooking);

module.exports = router;