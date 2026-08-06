const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, sendAlert } = require('../controllers/notificationController');

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: Fetch active notifications and alerts
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notification list and unread count
 */
router.get('/', getNotifications);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification updated
 */
router.put('/:id/read', markAsRead);

/**
 * @openapi
 * /api/notifications/alert:
 *   post:
 *     summary: Broadcast service alert or delay notification (Admin)
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [DELAY, APPROACHING, SERVICE_UPDATE, ALERT, GENERAL]
 *     responses:
 *       201:
 *         description: Notification created and broadcasted
 */
router.post('/alert', sendAlert);

module.exports = router;
