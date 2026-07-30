const Stop = require('../models/Stop');

const createStop = async (req, res) => {
  try {
    const { name, latitude, longitude, route, stopOrder } = req.body;
    
    const stop = await Stop.create({ name, latitude, longitude, route, stopOrder });
    res.status(201).json(stop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStopsByRoute = async (req, res) => {
  try {
    const stops = await Stop.find({ route: req.params.routeId }).sort({ stopOrder: 1 });
    res.json(stops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createStop, getStopsByRoute };
