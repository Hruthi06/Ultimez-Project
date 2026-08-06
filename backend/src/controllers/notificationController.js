const Notification = require('../models/Notification');

// Get all relevant notifications for a user or system broadcasts
const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id || null;

    const notifications = await Notification.find({
      $or: [{ user: userId }, { user: null }],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Broadcast or send alert notification (Admin tool)
const sendAlert = async (req, res) => {
  try {
    const { title, message, type, route, bus } = req.body;

    const notification = await Notification.create({
      title: title || 'Service Update',
      message,
      type: type || 'SERVICE_UPDATE',
      route: route || null,
      bus: bus || null,
    });

    // If socket.io instance attached to req.app
    const io = req.app.get('socketio');
    if (io) {
      io.emit('newNotification', notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  sendAlert,
};
