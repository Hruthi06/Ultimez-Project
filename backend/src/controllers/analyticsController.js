const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Tracking = require('../models/Tracking');

// Get overall system analytics for tracking dashboard
const getDashboardAnalytics = async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: 'RUNNING' });
    const idleBuses = await Bus.countDocuments({ status: 'IDLE' });
    const maintenanceBuses = await Bus.countDocuments({ status: 'MAINTENANCE' });
    const totalRoutes = await Route.countDocuments();
    const totalStops = await Stop.countDocuments();
    const totalTrackingPoints = await Tracking.countDocuments();

    const buses = await Bus.find().populate('route');
    const delayedBuses = buses.filter((b) => b.delayMinutes > 5);
    const onTimePercentage = totalBuses > 0 ? Math.round(((totalBuses - delayedBuses.length) / totalBuses) * 100) : 100;

    // Bus performance metrics
    const busPerformance = buses.map((bus) => ({
      busId: bus._id,
      registrationNumber: bus.registrationNumber,
      driverName: bus.driverName,
      status: bus.status,
      routeName: bus.route?.name || 'Unassigned',
      speedKmH: bus.speed || 30,
      delayMinutes: bus.delayMinutes || 0,
      capacity: bus.capacity || 40,
      currentPassengers: bus.currentPassengers || 12,
      occupancyPercentage: Math.round(((bus.currentPassengers || 12) / (bus.capacity || 40)) * 100),
      lastUpdated: bus.lastUpdated || bus.updatedAt,
    }));

    res.json({
      summary: {
        totalBuses,
        activeBuses,
        idleBuses,
        maintenanceBuses,
        totalRoutes,
        totalStops,
        totalTrackingPoints,
        onTimePercentage,
        delayedBusesCount: delayedBuses.length,
      },
      busPerformance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardAnalytics };
