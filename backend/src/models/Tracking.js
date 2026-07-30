const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

const Tracking = mongoose.model('Tracking', trackingSchema);
module.exports = Tracking;
