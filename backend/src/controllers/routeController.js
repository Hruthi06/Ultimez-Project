const Route = require('../models/Route');

const createRoute = async (req, res) => {
  try {
    const { name, startPoint, destination, path } = req.body;
    
    const routeExists = await Route.findOne({ name });
    if (routeExists) {
      return res.status(400).json({ message: 'Route already exists' });
    }

    const route = await Route.create({ name, startPoint, destination, path: path || [] });
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({});
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (route) {
      res.json(route);
    } else {
      res.status(404).json({ message: 'Route not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoute, getRoutes, getRouteById };
