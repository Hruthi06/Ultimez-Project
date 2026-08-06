const express = require('express');
const router = express.Router();
const { getNearbyStops } = require('../controllers/nearbyController');
const { validateCoordinates } = require('../middleware/validationMiddleware');

/**
 * @openapi
 * /api/nearby/stops:
 *   get:
 *     summary: Discover nearby bus stops based on user GPS coordinates
 *     tags: [Nearby Stop Finder]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of nearby stops sorted by distance with upcoming bus ETAs
 */
router.get('/stops', validateCoordinates, getNearbyStops);

module.exports = router;
