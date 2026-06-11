// src/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  
  subtotal: { type: Number, required: true },
  cleaningFee: { type: Number, default: 0 },
  serviceFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['bank_transfer', 'stripe', 'paypal'] },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  transactionId: { type: String },
  
  specialRequests: { type: String, maxlength: 500 },
  phoneNumber: { type: String, required: true },
  
  cancelledAt: Date,
  cancellationReason: String,
  
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);