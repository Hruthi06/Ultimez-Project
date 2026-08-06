const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null,
  },
  status: {
    type: String,
    enum: ['IDLE', 'RUNNING', 'MAINTENANCE'],
    default: 'IDLE',
  },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  speed: {
    type: Number,
    default: 30 // km/h
  },
  delayMinutes: {
    type: Number,
    default: 0
  },
  capacity: {
    type: Number,
    default: 40
  },
  currentPassengers: {
    type: Number,
    default: 12
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;

