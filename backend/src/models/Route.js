const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startPoint: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  path: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }]
}, { timestamps: true });

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
