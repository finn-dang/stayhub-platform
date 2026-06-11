const mongoose = require("mongoose");
const moment = require("moment");

const roomSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, "Tên chỗ ở là bắt buộc"],
    trim: true,
    maxlength: [100, "Tên không được vượt quá 100 ký tự"]
  },
  host: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users",
    required: true
  },
  
  // Pricing & Financial
  price: {
    type: Number,
    required: [true, "Giá thuê là bắt buộc"],
    min: [0, "Giá không thể âm"]
  },
  price_weekend: {
    type: Number,
    default: 0
  },
  price_month: {
    type: Number,
    default: 0
  },
  cleaning_fee: {
    type: Number,
    default: 0
  },
  security_deposit: {
    type: Number,
    default: 0
  },
  
  // Capacity & Rooms
  maximuncus: {
    type: Number,
    required: true,
    min: 1,
    default: 2
  },
  bed: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  bedroom: {
    type: Number,
    default: 1
  },
  shower: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  bathroom: {
    type: Number,
    default: 1
  },
  
  // Location
  address: {
    type: String,
    required: [true, "Địa chỉ là bắt buộc"],
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String
  },
  ward: {
    type: String
  },
  map: {
    lat: { type: Number },
    lng: { type: Number }
  },
  
  // Images & Media
  img: [{
    type: String,
    url: String,
    caption: String,
    is_primary: { type: Boolean, default: false }
  }],
  video_url: {
    type: String
  },
  virtual_tour: {
    type: String
  },
  
  // Amenities (Boolean flags)
  amenities: {
    wifi: { type: Boolean, default: false },
    air_conditioner: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    washer: { type: Boolean, default: false },
    dryer: { type: Boolean, default: false },
    iron: { type: Boolean, default: false },
    hair_dryer: { type: Boolean, default: false },
    shampoo: { type: Boolean, default: false },
    desk: { type: Boolean, default: false },
    fireplace: { type: Boolean, default: false },
    bbq_grill: { type: Boolean, default: false },
    hot_tub: { type: Boolean, default: false },
    beach_access: { type: Boolean, default: false },
    pet_allowed: { type: Boolean, default: false },
    smoking_allowed: { type: Boolean, default: false },
    events_allowed: { type: Boolean, default: false },
    suitable_for_children: { type: Boolean, default: true },
    suitable_for_infants: { type: Boolean, default: true }
  },
  
  // Safety features
  safety: {
    smoke_detector: { type: Boolean, default: false },
    carbon_monoxide_detector: { type: Boolean, default: false },
    first_aid_kit: { type: Boolean, default: false },
    fire_extinguisher: { type: Boolean, default: false },
    security_camera: { type: Boolean, default: false },
    lock_on_bedroom: { type: Boolean, default: false }
  },
  
  // House Rules
  rules: {
    check_in_time: { type: String, default: "14:00" },
    check_out_time: { type: String, default: "11:00" },
    quiet_hours_start: { type: String, default: "22:00" },
    quiet_hours_end: { type: String, default: "07:00" },
    max_nights: { type: Number, default: 30 },
    min_nights: { type: Number, default: 1 },
    cancellation_policy: {
      type: String,
      enum: ["flexible", "moderate", "strict", "super_strict"],
      default: "moderate"
    }
  },
  
  // Type & Category
  type: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Type"
  },
  property_type: {
    type: String,
    enum: ["apartment", "house", "villa", "cabin", "guesthouse", "hotel", "unique_space"],
    default: "apartment"
  },
  room_type: {
    type: String,
    enum: ["entire_home", "private_room", "shared_room"],
    default: "entire_home"
  },
  
  // Host information
  hosthome: {
    type: Boolean,
    default: false
  },
  host_language: [{
    type: String
  }],
  host_response_time: {
    type: String,
    enum: ["within_an_hour", "within_few_hours", "within_a_day", "within_few_days"],
    default: "within_few_hours"
  },
  
  // Status & Availability
  isRented: {
    type: Boolean,
    default: false
  },
  validByAdmin: {
    type: Boolean,
    default: false
  },
  is_available: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ["pending", "active", "inactive", "rejected"],
    default: "pending"
  },
  
  // Dates
  startday: {
    type: Date,
    get: (date) => date ? moment(date).format("YYYY-MM-DD") : null
  },
  endday: {
    type: Date,
    get: (date) => date ? moment(date).format("YYYY-MM-DD") : null
  },
  unavailable_dates: [{
    type: Date
  }],
  booked_dates: [{
    start: Date,
    end: Date
  }],
  
  // Statistics
  Visittime: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  review_count: {
    type: Number,
    default: 0
  },
  
  // Description
  display: {
    type: String,
    maxlength: 5000
  },
  description: {
    summary: { type: String, maxlength: 500 },
    space: { type: String, maxlength: 2000 },
    neighborhood: { type: String, maxlength: 1000 },
    transit: { type: String, maxlength: 1000 },
    notes: { type: String, maxlength: 1000 }
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
roomSchema.index({ location: "2dsphere" });
roomSchema.index({ price: 1, rating: -1 });
roomSchema.index({ "amenities.wifi": 1, "amenities.parking": 1 });

module.exports = mongoose.model("Room", roomSchema);