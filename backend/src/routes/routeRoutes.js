const express = require('express');
const { createRoute, getRoutes, getRouteById } = require('../controllers/routeController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getRoutes).post(protect, admin, createRoute);
router.route('/:id').get(getRouteById);

module.exports = router;
