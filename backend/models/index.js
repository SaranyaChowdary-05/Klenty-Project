const { getSequelize } = require('../config/database');

let User, Project, Task, Notification;

const initModels = () => {
  const sequelize = getSequelize();
  if (!sequelize) return {};

  User         = require('./User')(sequelize);
  Project      = require('./Project')(sequelize);
  Task         = require('./Task')(sequelize);
  Notification = require('./Notification')(sequelize);

  // ── Associations ──────────────────────────────────────────────────────────

  // User → Projects (creator)
  User.hasMany(Project, { foreignKey: 'createdBy', as: 'createdProjects' });
  Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

  // User → Tasks (assignee)
  User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
  Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

  // Project → Tasks
  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
  Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

  // User → Notifications
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  return { User, Project, Task, Notification, sequelize };
};

module.exports = { initModels, getModels: () => ({ User, Project, Task, Notification }) };
