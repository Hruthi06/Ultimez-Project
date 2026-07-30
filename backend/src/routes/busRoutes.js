const express = require('express');
const { createBus, getBuses, getBusesByRoute, updateBusStatus } = require('../controllers/busController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getBuses).post(protect, admin, createBus);
router.route('/route/:routeId').get(getBusesByRoute);
router.route('/:id/status').put(protect, admin, updateBusStatus);

module.exports = router;
