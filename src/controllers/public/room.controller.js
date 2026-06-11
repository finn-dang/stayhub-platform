// src/controllers/public/room.controller.js
const Room = require('../../models/Room');
const Booking = require('../../models/Booking');

module.exports = {
  // Show room detail page
  detail: async (req, res) => {
    try {
      const room = await Room.findById(req.params.id)
        .populate('host', 'name email avatar phone')
        .populate('type', 'name')
        .lean();
      
      if (!room) {
        return res.status(404).render('pages/errors/404', { title: 'Room not found' });
      }
      
      // Increment view count
      await Room.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
      
      // Get similar rooms
      const similarRooms = await Room.find({
        _id: { $ne: room._id },
        city: room.city,
        status: 'active',
        validByAdmin: true
      })
      .limit(4)
      .lean();
      
      const today = new Date().toISOString().split('T')[0];
      
      res.render('pages/room-detail', {
        title: room.name,
        room,
        similarRooms,
        isLoggedIn: !!req.session.userId,
        user_id: req.session.userId,
        user_role: req.session.userRole,
        today
      });
    } catch (error) {
      console.error('Room detail error:', error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },
  
  // Show checkout page
  checkout: async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }
      
      const room = await Room.findById(req.params.id).lean();
      if (!room) {
        return res.status(404).render('pages/errors/404', { title: 'Room not found' });
      }
      
      const { checkIn, checkOut, guests } = req.query;
      
      // Validate required parameters
      if (!checkIn || !checkOut || !guests) {
        return res.redirect(`/rooms/${req.params.id}?error=Please select dates and number of guests`);
      }
      
      // Calculate nights and pricing
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      if (nights <= 0) {
        return res.redirect(`/rooms/${req.params.id}?error=Check-out date must be after check-in date`);
      }
      
      const subtotal = room.price * nights;
      const cleaningFee = 50000;
      const serviceFee = Math.round(subtotal * 0.1);
      const totalPrice = subtotal + cleaningFee + serviceFee;
      
      res.render('pages/booking/checkout', {
        title: 'Checkout',
        room,
        checkIn,
        checkOut,
        guests: parseInt(guests),
        nights,
        subtotal,
        cleaningFee,
        serviceFee,
        totalPrice,
        isLoggedIn: true,
        user_name: req.session.userName,
        user_email: req.session.userEmail
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },
  
  // Create booking
  createBooking: async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }
      
      const room = await Room.findById(req.params.id);
      if (!room) {
        return res.status(404).render('pages/errors/404', { title: 'Room not found' });
      }
      
      const { checkIn, checkOut, guests, phoneNumber, specialRequests } = req.body;
      
      // Check if dates are already booked
      const existingBooking = await Booking.findOne({
        room: room._id,
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
          { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } }
        ]
      });
      
      if (existingBooking) {
        return res.redirect(`/rooms/${room._id}?error=Selected dates are not available`);
      }
      
      // Calculate pricing
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const subtotal = room.price * nights;
      const cleaningFee = 50000;
      const serviceFee = Math.round(subtotal * 0.1);
      const totalPrice = subtotal + cleaningFee + serviceFee;
      
      const booking = new Booking({
        user: req.session.userId,
        room: room._id,
        host: room.host,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: parseInt(guests),
        subtotal,
        cleaningFee,
        serviceFee,
        totalPrice,
        phoneNumber,
        specialRequests,
        status: 'confirmed',
        paymentStatus: 'pending'
      });
      
      await booking.save();
      
      res.redirect(`/booking/confirmation/${booking._id}`);
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },
  
  // Show booking confirmation
  confirmation: async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('room', 'name address images price city district')
        .populate('user', 'name email')
        .lean();
      
      if (!booking) {
        return res.status(404).render('pages/errors/404', { title: 'Booking not found' });
      }
      
      // Security check - only the booking owner can view
      if (booking.user._id.toString() !== req.session.userId) {
        return res.status(403).render('pages/errors/403', { 
          title: 'Access Denied',
          user_role: req.session.userRole,
          required_role: 'booking owner'
        });
      }
      
      res.render('pages/booking/confirmation', {
        title: 'Booking Confirmed',
        booking,
        isLoggedIn: true
      });
    } catch (error) {
      console.error('Confirmation error:', error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },
  
  // My bookings
  myBookings: async (req, res) => {
    try {
      const bookings = await Booking.find({ user: req.session.userId })
        .populate('room', 'name address images price city district')
        .sort({ createdAt: -1 })
        .lean();
      
      res.render('pages/booking/my-bookings', {
        title: 'My Bookings',
        bookings,
        isLoggedIn: true,
        user_name: req.session.userName,
        user_role: req.session.userRole
      });
    } catch (error) {
      console.error('My bookings error:', error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },
  
  // Cancel booking
  cancelBooking: async (req, res) => {
    try {
      const booking = await Booking.findOne({ 
        _id: req.params.id, 
        user: req.session.userId 
      });
      
      if (!booking) {
        return res.status(404).send('Booking not found');
      }
      
      // Check if cancellation is allowed (more than 24 hours before check-in)
      const checkInDate = new Date(booking.checkIn);
      const now = new Date();
      const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
      
      if (hoursUntilCheckIn < 24) {
        return res.redirect('/my-bookings?error=Cannot cancel booking less than 24 hours before check-in');
      }
      
      await Booking.updateOne(
        { _id: req.params.id },
        { status: 'cancelled', cancelledAt: new Date() }
      );
      
      res.redirect('/my-bookings?success=Booking cancelled successfully');
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).send('Error cancelling booking');
    }
  }
};