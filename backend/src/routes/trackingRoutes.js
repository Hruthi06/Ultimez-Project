const express = require('express');
const { addTrackingPoint, getTrackingHistory } = require('../controllers/trackingController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, addTrackingPoint);
router.route('/bus/:busId').get(getTrackingHistory);

module.exports = router;
