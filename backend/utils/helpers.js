const { isJsonFallback } = require('../config/database');
const { getModels } = require('../models/index');
const jsonStore = require('./jsonStore');

/**
 * Creates a notification logs entry for a user.
 * Supports both Sequelize and JSON store fallbacks.
 */
const createNotification = async ({ userId, title, message, type, relatedId, relatedType }) => {
  try {
    const data = {
      userId,
      title,
      message,
      type,
      isRead: false,
      relatedId,
      relatedType
    };

    if (isJsonFallback()) {
      const created = jsonStore.create('notifications', data);
      return created;
    } else {
      const { Notification } = getModels();
      if (!Notification) return null;
      const created = await Notification.create(data);
      return created.toJSON();
    }
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

module.exports = {
  createNotification
};
