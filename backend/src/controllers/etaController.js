const Bus = require('../models/Bus');
const Stop = require('../models/Stop');
const Route = require('../models/Route');

// Haversine formula to compute distance between two GPS coordinates in kilometers
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Calculate ETA for all stops on a specific bus or route
const getBusETA = async (req, res) => {
  try {
    const { busId } = req.params;
    const bus = await Bus.findById(busId).populate('route');

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (!bus.route) {
      return res.status(400).json({ message: 'Bus is not assigned to any route' });
    }

    const stops = await Stop.find({ route: bus.route._id }).sort({ stopOrder: 1 });

    const currentLat = bus.currentLocation?.lat || (bus.route.path?.[0]?.lat ?? 13.3409);
    const currentLng = bus.currentLocation?.lng || (bus.route.path?.[0]?.lng ?? 77.1005);
    const busSpeed = bus.speed > 0 ? bus.speed : 30; // km/h
    const delay = bus.delayMinutes || 0;

    let cumulativeDistance = 0;
    let lastLat = currentLat;
    let lastLng = currentLng;

    const stopETAs = stops.map((stop) => {
      const segDistance = calculateHaversineDistance(lastLat, lastLng, stop.latitude, stop.longitude);
      cumulativeDistance += segDistance;
      lastLat = stop.latitude;
      lastLng = stop.longitude;

      const travelTimeMinutes = Math.round((cumulativeDistance / busSpeed) * 60) + delay;
      
      let etaText = 'Arriving now';
      if (travelTimeMinutes > 0 && travelTimeMinutes < 60) {
        etaText = `${travelTimeMinutes} min${travelTimeMinutes > 1 ? 's' : ''}`;
      } else if (travelTimeMinutes >= 60) {
        const hrs = Math.floor(travelTimeMinutes / 60);
        const mins = travelTimeMinutes % 60;
        etaText = `${hrs} hr ${mins} mins`;
      }

      const estimatedTime = new Date(Date.now() + travelTimeMinutes * 60000);

      return {
        stopId: stop._id,
        stopName: stop.name,
        stopOrder: stop.stopOrder,
        latitude: stop.latitude,
        longitude: stop.longitude,
        distanceKm: parseFloat(cumulativeDistance.toFixed(2)),
        etaMinutes: travelTimeMinutes,
        etaText,
        estimatedArrivalTime: estimatedTime.toISOString(),
      };
    });

    res.json({
      busId: bus._id,
      registrationNumber: bus.registrationNumber,
      driverName: bus.driverName,
      status: bus.status,
      routeName: bus.route.name,
      currentLocation: { lat: currentLat, lng: currentLng },
      speed: busSpeed,
      delayMinutes: delay,
      stops: stopETAs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ETA for a specific stop on a route
const getStopETA = async (req, res) => {
  try {
    const { stopId } = req.params;
    const stop = await Stop.findById(stopId).populate('route');

    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    // Find all active buses running on this route
    const buses = await Bus.find({ route: stop.route._id, status: 'RUNNING' });

    const upcomingBuses = buses.map((bus) => {
      const currentLat = bus.currentLocation?.lat || stop.latitude;
      const currentLng = bus.currentLocation?.lng || stop.longitude;
      const dist = calculateHaversineDistance(currentLat, currentLng, stop.latitude, stop.longitude);
      const busSpeed = bus.speed > 0 ? bus.speed : 30;
      const etaMinutes = Math.round((dist / busSpeed) * 60) + (bus.delayMinutes || 0);

      return {
        busId: bus._id,
        registrationNumber: bus.registrationNumber,
        driverName: bus.driverName,
        distanceKm: parseFloat(dist.toFixed(2)),
        etaMinutes,
        etaText: etaMinutes <= 1 ? '1 min' : `${etaMinutes} mins`,
        delayMinutes: bus.delayMinutes,
      };
    }).sort((a, b) => a.etaMinutes - b.etaMinutes);

    res.json({
      stopId: stop._id,
      stopName: stop.name,
      routeName: stop.route.name,
      upcomingBuses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBusETA,
  getStopETA,
  calculateHaversineDistance,
};
