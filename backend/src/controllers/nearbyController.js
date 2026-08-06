const Stop = require('../models/Stop');
const Bus = require('../models/Bus');
const { calculateHaversineDistance } = require('./etaController');

// Find bus stops near user's location with upcoming bus ETAs
const getNearbyStops = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    const userLat = parseFloat(lat || 13.3409); // Default coordinate fallback
    const userLng = parseFloat(lng || 77.1005);
    const searchRadius = parseFloat(radius || 5.0); // Radius in kilometers

    const stops = await Stop.find().populate('route');
    const runningBuses = await Bus.find({ status: 'RUNNING' }).populate('route');

    const nearbyList = [];

    for (const stop of stops) {
      const distKm = calculateHaversineDistance(userLat, userLng, stop.latitude, stop.longitude);

      if (distKm <= searchRadius) {
        // Find buses running on this stop's route
        const busesOnRoute = runningBuses.filter((b) => b.route?._id.toString() === stop.route?._id.toString());

        const upcomingBuses = busesOnRoute.map((bus) => {
          const busLat = bus.currentLocation?.lat || stop.latitude;
          const busLng = bus.currentLocation?.lng || stop.longitude;
          const busDist = calculateHaversineDistance(busLat, busLng, stop.latitude, stop.longitude);
          const speed = bus.speed > 0 ? bus.speed : 30;
          const etaMins = Math.round((busDist / speed) * 60) + (bus.delayMinutes || 0);

          return {
            busId: bus._id,
            registrationNumber: bus.registrationNumber,
            driverName: bus.driverName,
            etaMinutes: etaMins,
            etaText: etaMins <= 1 ? '1 min' : `${etaMins} mins`,
          };
        }).sort((a, b) => a.etaMinutes - b.etaMinutes);

        const distMeters = Math.round(distKm * 1000);

        nearbyList.push({
          stopId: stop._id,
          stopName: stop.name,
          routeName: stop.route?.name || 'Local Route',
          startPoint: stop.route?.startPoint,
          destination: stop.route?.destination,
          latitude: stop.latitude,
          longitude: stop.longitude,
          distanceKm: parseFloat(distKm.toFixed(2)),
          distanceFormatted: distKm < 1 ? `${distMeters} m` : `${distKm.toFixed(1)} km`,
          upcomingBusesCount: upcomingBuses.length,
          upcomingBuses: upcomingBuses.slice(0, 3), // Top 3 next buses
        });
      }
    }

    // Sort by closest distance to user
    nearbyList.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      userLocation: { lat: userLat, lng: userLng },
      radiusKm: searchRadius,
      totalStopsFound: nearbyList.length,
      stops: nearbyList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNearbyStops };
