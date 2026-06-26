const { isJsonFallback } = require('../config/database');
const { getModels } = require('../models/index');
const jsonStore = require('../utils/jsonStore');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isJsonFallback()) {
      // ── PROJECTS STATS ─────────────────────────────────────────────────────
      const allProjects = jsonStore.findAll('projects');
      const userProjects = allProjects.filter(p => {
        const members = p.teamMembers || [];
        return p.createdBy === userId || members.includes(userId);
      });
      const totalProjects = userProjects.length;

      // ── TASKS STATS ────────────────────────────────────────────────────────
      const allTasks = jsonStore.findAll('tasks');
      const userProjectIds = userProjects.map(p => p.id);

      const userTasks = allTasks.filter(t => {
        return (t.projectId && userProjectIds.includes(t.projectId)) ||
               t.assignedTo === userId ||
               t.createdBy === userId;
      });

      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
      const pendingTasks = totalTasks - completedTasks;

      // ── UPCOMING DEADLINES ─────────────────────────────────────────────────
      // Combine tasks and projects that have deadlines in the future (or today)
      const now = new Date();
      const deadlines = [];

      userProjects.forEach(p => {
        if (p.deadline) {
          const deadlineDate = new Date(p.deadline);
          if (deadlineDate >= now && p.status !== 'Completed') {
            deadlines.push({
              id: p.id,
              type: 'project',
              name: p.name,
              deadline: p.deadline,
              priority: p.priority,
              status: p.status
            });
          }
        }
      });

      userTasks.forEach(t => {
        if (t.deadline) {
          const deadlineDate = new Date(t.deadline);
          if (deadlineDate >= now && t.status !== 'Completed') {
            deadlines.push({
              id: t.id,
              type: 'task',
              name: t.title,
              deadline: t.deadline,
              priority: t.priority,
              status: t.status
            });
          }
        }
      });

      // Sort by closest deadline first
      deadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      const upcomingDeadlines = deadlines.slice(0, 5); // top 5

      // ── RECENT ACTIVITIES ──────────────────────────────────────────────────
      // Pull recent notifications for this user as activity logs
      const notifications = jsonStore.findAll('notifications')
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      const recentActivities = notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt
      }));

      return res.status(200).json({
        success: true,
        stats: {
          totalProjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          upcomingDeadlines,
          recentActivities
        }
      });
    } else {
      const { Project, Task, Notification } = getModels();
      const { Op } = require('sequelize');

      // Find projects user belongs to
      const allProjects = await Project.findAll();
      const userProjects = allProjects.filter(p => {
        const members = p.teamMembers || [];
        return p.createdBy === userId || members.includes(userId);
      });
      const userProjectIds = userProjects.map(p => p.id);
      const totalProjects = userProjects.length;

      // Find tasks
      const allTasks = await Task.findAll({
        where: {
          [Op.or]: [
            { projectId: { [Op.in]: userProjectIds } },
            { assignedTo: userId },
            { createdBy: userId }
          ]
        }
      });
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
      const pendingTasks = totalTasks - completedTasks;

      // Upcoming deadlines
      const now = new Date();
      const deadlines = [];

      userProjects.forEach(p => {
        if (p.deadline) {
          const deadlineDate = new Date(p.deadline);
          if (deadlineDate >= now && p.status !== 'Completed') {
            deadlines.push({
              id: p.id,
              type: 'project',
              name: p.name,
              deadline: p.deadline,
              priority: p.priority,
              status: p.status
            });
          }
        }
      });

      allTasks.forEach(t => {
        if (t.deadline) {
          const deadlineDate = new Date(t.deadline);
          if (deadlineDate >= now && t.status !== 'Completed') {
            deadlines.push({
              id: t.id,
              type: 'task',
              name: t.title,
              deadline: t.deadline,
              priority: t.priority,
              status: t.status
            });
          }
        }
      });

      deadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      const upcomingDeadlines = deadlines.slice(0, 5);

      // Recent notifications
      const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      const recentActivities = notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt
      }));

      return res.status(200).json({
        success: true,
        stats: {
          totalProjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          upcomingDeadlines,
          recentActivities
        }
      });
    }
  } catch (error) {
    next(error);
  }
};
