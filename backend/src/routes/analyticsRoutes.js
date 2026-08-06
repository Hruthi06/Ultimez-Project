const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');

/**
 * @openapi
 * /api/analytics/dashboard:
 *   get:
 *     summary: Retrieve real-time tracking analytics, stats, and bus performance metrics
 *     tags: [Analytics & Tracking Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard summary and bus performance metrics
 */
router.get('/dashboard', getDashboardAnalytics);

module.exports = router;
