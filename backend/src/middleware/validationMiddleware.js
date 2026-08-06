// Simple, robust validation middleware for API endpoints

const validateCoordinates = (req, res, next) => {
  const { lat, lng, latitude, longitude } = { ...req.body, ...req.query };
  const checkLat = lat !== undefined ? Number(lat) : latitude !== undefined ? Number(latitude) : null;
  const checkLng = lng !== undefined ? Number(lng) : longitude !== undefined ? Number(longitude) : null;

  if (checkLat !== null && (isNaN(checkLat) || checkLat < -90 || checkLat > 90)) {
    return res.status(400).json({ message: 'Invalid latitude. Must be between -90 and 90.' });
  }

  if (checkLng !== null && (isNaN(checkLng) || checkLng < -180 || checkLng > 180)) {
    return res.status(400).json({ message: 'Invalid longitude. Must be between -180 and 180.' });
  }

  next();
};

const validateJourneyRequest = (req, res, next) => {
  const { origin, destination, originLat, originLng, destLat, destLng } = req.body;
  if (!origin && (originLat === undefined || originLng === undefined)) {
    return res.status(400).json({ message: 'Origin location (name or coordinates) is required.' });
  }
  if (!destination && (destLat === undefined || destLng === undefined)) {
    return res.status(400).json({ message: 'Destination location (name or coordinates) is required.' });
  }
  next();
};

const validateBusInput = (req, res, next) => {
  const { registrationNumber, driverName } = req.body;
  if (req.method === 'POST') {
    if (!registrationNumber || typeof registrationNumber !== 'string' || registrationNumber.trim().length === 0) {
      return res.status(400).json({ message: 'Registration number is required.' });
    }
    if (!driverName || typeof driverName !== 'string' || driverName.trim().length === 0) {
      return res.status(400).json({ message: 'Driver name is required.' });
    }
  }
  next();
};

module.exports = {
  validateCoordinates,
  validateJourneyRequest,
  validateBusInput,
};
