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
  }
}, { timestamps: true });

const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;
