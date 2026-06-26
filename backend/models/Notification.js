const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM(
        'task_created',
        'task_updated',
        'task_deleted',
        'project_created',
        'project_updated',
        'project_deleted',
        'deadline_reminder',
        'completion_alert'
      ),
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    relatedType: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  return Notification;
};
