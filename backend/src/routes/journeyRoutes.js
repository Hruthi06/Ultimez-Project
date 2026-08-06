const express = require('express');
const router = express.Router();
const { planJourney } = require('../controllers/journeyController');
const { validateJourneyRequest } = require('../middleware/validationMiddleware');

/**
 * @openapi
 * /api/journey/plan:
 *   post:
 *     summary: Plan journey between origin and destination with route recommendations
 *     tags: [Journey Planner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               originLat:
 *                 type: number
 *               originLng:
 *                 type: number
 *               destLat:
 *                 type: number
 *               destLng:
 *                 type: number
 *     responses:
 *       200:
 *         description: List of suggested routes and travel itinerary
 */
router.post('/plan', validateJourneyRequest, planJourney);

module.exports = router;
