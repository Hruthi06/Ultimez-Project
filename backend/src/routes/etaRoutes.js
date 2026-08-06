const express = require('express');
const router = express.Router();
const { getBusETA, getStopETA } = require('../controllers/etaController');

/**
 * @openapi
 * /api/eta/bus/{busId}:
 *   get:
 *     summary: Get stop-wise arrival time predictions for a specific bus
 *     tags: [ETA System]
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stop-wise ETA list
 */
router.get('/bus/:busId', getBusETA);

/**
 * @openapi
 * /api/eta/stop/{stopId}:
 *   get:
 *     summary: Get upcoming buses and ETAs for a specific stop
 *     tags: [ETA System]
 *     parameters:
 *       - in: path
 *         name: stopId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upcoming buses at stop
 */
router.get('/stop/:stopId', getStopETA);

module.exports = router;
