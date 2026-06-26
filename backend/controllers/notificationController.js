const { isJsonFallback } = require('../config/database');
const { getModels } = require('../models/index');
const jsonStore = require('../utils/jsonStore');

// Get Notifications for User
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isJsonFallback()) {
      const list = jsonStore.findByField('notifications', 'userId', userId);
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json({ success: true, notifications: list });
    } else {
      const { Notification } = getModels();
      const list = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json({ success: true, notifications: list });
    }
  } catch (error) {
    next(error);
  }
};

// Mark Single Notification as Read
exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isJsonFallback()) {
      const notification = jsonStore.findById('notifications', id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }
      if (notification.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      const updated = jsonStore.update('notifications', id, { isRead: true });
      return res.status(200).json({ success: true, notification: updated });
    } else {
      const { Notification } = getModels();
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }
      if (notification.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      notification.isRead = true;
      await notification.save();

      return res.status(200).json({ success: true, notification: notification.toJSON() });
    }
  } catch (error) {
    next(error);
  }
};

// Mark All Notifications as Read
exports.markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isJsonFallback()) {
      const notifications = jsonStore.findByField('notifications', 'userId', userId);
      for (const n of notifications) {
        if (!n.isRead) {
          jsonStore.update('notifications', n.id, { isRead: true });
        }
      }
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } else {
      const { Notification } = getModels();
      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }
  } catch (error) {
    next(error);
  }
};

// Delete Notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isJsonFallback()) {
      const notification = jsonStore.findById('notifications', id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }
      if (notification.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      jsonStore.remove('notifications', id);
      return res.status(200).json({ success: true, message: 'Notification deleted.' });
    } else {
      const { Notification } = getModels();
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }
      if (notification.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      await notification.destroy();
      return res.status(200).json({ success: true, message: 'Notification deleted.' });
    }
  } catch (error) {
    next(error);
  }
};
