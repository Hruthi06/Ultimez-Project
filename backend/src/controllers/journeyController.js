const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Bus = require('../models/Bus');
const { calculateHaversineDistance } = require('./etaController');

// Search for journey options from origin to destination
const planJourney = async (req, res) => {
  try {
    const { origin, destination, originLat, originLng, destLat, destLng } = req.body;

    const allRoutes = await Route.find();
    const allStops = await Stop.find().populate('route');
    const activeBuses = await Bus.find({ status: 'RUNNING' }).populate('route');

    const searchOriginStr = (origin || '').toLowerCase().trim();
    const searchDestStr = (destination || '').toLowerCase().trim();

    // 1. Identify matching origin and destination stops/points
    let originStops = [];
    let destStops = [];

    if (originLat !== undefined && originLng !== undefined) {
      originStops = allStops.filter((stop) => {
        const d = calculateHaversineDistance(originLat, originLng, stop.latitude, stop.longitude);
        return d <= 3.0; // Within 3km of origin coordinate
      });
    } else if (searchOriginStr) {
      originStops = allStops.filter((stop) =>
        stop.name.toLowerCase().includes(searchOriginStr) ||
        stop.route.startPoint.toLowerCase().includes(searchOriginStr)
      );
    }

    if (destLat !== undefined && destLng !== undefined) {
      destStops = allStops.filter((stop) => {
        const d = calculateHaversineDistance(destLat, destLng, stop.latitude, stop.longitude);
        return d <= 3.0; // Within 3km of dest coordinate
      });
    } else if (searchDestStr) {
      destStops = allStops.filter((stop) =>
        stop.name.toLowerCase().includes(searchDestStr) ||
        stop.route.destination.toLowerCase().includes(searchDestStr)
      );
    }

    const suggestions = [];

    // Helper: Calculate distance & time for a route path
    const computeRouteStats = (routeObj, startOrder = 1, endOrder = 99) => {
      const routeStops = allStops
        .filter((s) => s.route?._id.toString() === routeObj._id.toString())
        .sort((a, b) => a.stopOrder - b.stopOrder);

      const relevantStops = routeStops.filter((s) => s.stopOrder >= startOrder && s.stopOrder <= endOrder);
      let totalDist = 0;

      for (let i = 0; i < relevantStops.length - 1; i++) {
        totalDist += calculateHaversineDistance(
          relevantStops[i].latitude,
          relevantStops[i].longitude,
          relevantStops[i + 1].latitude,
          relevantStops[i + 1].longitude
        );
      }

      if (totalDist === 0) totalDist = 8.5; // fallback estimate
      const avgSpeed = 28; // km/h
      const durationMins = Math.round((totalDist / avgSpeed) * 60);

      return { totalDist: parseFloat(totalDist.toFixed(1)), durationMins, relevantStops };
    };

    // 2. Direct Routes Search
    for (const route of allRoutes) {
      const routeStops = allStops
        .filter((s) => s.route?._id.toString() === route._id.toString())
        .sort((a, b) => a.stopOrder - b.stopOrder);

      let fromStop = routeStops.find((s) =>
        originStops.some((o) => o._id.toString() === s._id.toString()) ||
        (searchOriginStr && (s.name.toLowerCase().includes(searchOriginStr) || route.startPoint.toLowerCase().includes(searchOriginStr)))
      );

      let toStop = routeStops.find((s) =>
        destStops.some((d) => d._id.toString() === s._id.toString()) ||
        (searchDestStr && (s.name.toLowerCase().includes(searchDestStr) || route.destination.toLowerCase().includes(searchDestStr)))
      );

      // Fallback matching if exact text wasn't entered
      if (!fromStop && routeStops.length > 0) fromStop = routeStops[0];
      if (!toStop && routeStops.length > 0) toStop = routeStops[routeStops.length - 1];

      if (fromStop && toStop && fromStop.stopOrder <= toStop.stopOrder) {
        const stats = computeRouteStats(route, fromStop.stopOrder, toStop.stopOrder);
        const runningBusesOnRoute = activeBuses.filter((b) => b.route?._id.toString() === route._id.toString());
        const firstBusEta = runningBusesOnRoute.length > 0 ? (runningBusesOnRoute[0].delayMinutes || 0) + 5 : 8;

        suggestions.push({
          type: 'DIRECT',
          routeId: route._id,
          routeName: route.name,
          startPoint: fromStop.name || route.startPoint,
          destination: toStop.name || route.destination,
          estimatedDurationMinutes: stats.durationMins,
          totalDistanceKm: stats.totalDist,
          transfers: 0,
          nextBusETA: `${firstBusEta} mins`,
          availableBusesCount: runningBusesOnRoute.length,
          stopsCount: Math.max(1, toStop.stopOrder - fromStop.stopOrder + 1),
          recommendationBadge: suggestions.length === 0 ? 'Fastest & Direct' : 'Direct Route',
          steps: [
            {
              instruction: `Board bus on Route ${route.name} at ${fromStop.name}`,
              busName: runningBusesOnRoute[0]?.registrationNumber || 'Upcoming Bus',
              duration: `${stats.durationMins} mins`,
              distance: `${stats.totalDist} km`,
              type: 'BUS',
            },
            {
              instruction: `Alight at ${toStop.name}`,
              type: 'ARRIVAL',
            },
          ],
        });
      }
    }

    // Sort suggestions by duration & direct first
    suggestions.sort((a, b) => a.estimatedDurationMinutes - b.estimatedDurationMinutes);

    res.json({
      origin: origin || 'Current Location',
      destination: destination || 'Selected Destination',
      totalOptions: suggestions.length,
      suggestions: suggestions.slice(0, 5), // Top 5 best routes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { planJourney };
