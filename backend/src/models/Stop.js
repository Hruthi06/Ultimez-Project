const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  stopOrder: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

const Stop = mongoose.model('Stop', stopSchema);
module.exports = Stop;
