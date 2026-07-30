const Tracking = require('../models/Tracking');

const addTrackingPoint = async (req, res) => {
  try {
    const { bus, latitude, longitude } = req.body;
    
    const tracking = await Tracking.create({ bus, latitude, longitude });
    res.status(201).json(tracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrackingHistory = async (req, res) => {
  try {
    const history = await Tracking.find({ bus: req.params.busId }).sort({ createdAt: -1 }).limit(100);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addTrackingPoint, getTrackingHistory };
