const express = require('express');
const { createStop, getStopsByRoute } = require('../controllers/stopController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, admin, createStop);
router.route('/route/:routeId').get(getStopsByRoute);

module.exports = router;
