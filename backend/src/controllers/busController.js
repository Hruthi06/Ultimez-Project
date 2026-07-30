const Bus = require('../models/Bus');

const createBus = async (req, res) => {
  try {
    const { registrationNumber, driverName, route, status } = req.body;
    
    const busExists = await Bus.findOne({ registrationNumber });
    if (busExists) {
      return res.status(400).json({ message: 'Bus already exists' });
    }

    const bus = await Bus.create({ registrationNumber, driverName, route, status });
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find({}).populate('route', 'name startPoint destination');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBusesByRoute = async (req, res) => {
  try {
    const buses = await Bus.find({ route: req.params.routeId }).populate('route', 'name');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBusStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bus = await Bus.findById(req.params.id);

    if (bus) {
      bus.status = status || bus.status;
      const updatedBus = await bus.save();
      res.json(updatedBus);
    } else {
      res.status(404).json({ message: 'Bus not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBus, getBuses, getBusesByRoute, updateBusStatus };
