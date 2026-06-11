// src/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true, min: 0 },
  maximuncus: { type: Number, required: true, default: 2, min: 1 },
  bed: { type: Number, default: 1, min: 0 },
  bedroom: { type: Number, default: 1, min: 0 },
  shower: { type: Number, default: 1, min: 0 },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String },
  map: { lat: Number, lng: Number },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  amenities: {
    wifi: { type: Boolean, default: false },
    air_conditioner: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    tv: { type: Boolean, default: false }
  },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'inactive', 'rejected'], 
    default: 'pending' 
  },
  validByAdmin: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  review_count: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Room', roomSchema);