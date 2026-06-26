const { isJsonFallback } = require('../config/database');
const { getModels } = require('../models/index');
const jsonStore = require('../utils/jsonStore');
const { createNotification } = require('../utils/helpers');

// Create Task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority, status, deadline, estimatedHours } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    // Verify project exists
    if (projectId) {
      if (isJsonFallback()) {
        const proj = jsonStore.findById('projects', projectId);
        if (!proj) return res.status(404).json({ success: false, message: 'Project not found.' });
      } else {
        const { Project } = getModels();
        const proj = await Project.findByPk(projectId);
        if (!proj) return res.status(404).json({ success: false, message: 'Project not found.' });
      }
    }

    const taskData = {
      title,
      description: description || '',
      projectId: projectId || null,
      assignedTo: assignedTo || userId,
      priority: priority || 'Medium',
      status: status || 'Pending',
      deadline: deadline ? new Date(deadline).toISOString() : null,
      estimatedHours: estimatedHours ? parseInt(estimatedHours, 10) : 0,
      tags: [],
      notes: '',
      attachments: [],
      isArchived: false,
      createdBy: userId,
      completedAt: (status === 'Completed') ? new Date().toISOString() : null
    };

    let task = null;

    if (isJsonFallback()) {
      task = jsonStore.create('tasks', taskData);
    } else {
      const { Task } = getModels();
      const created = await Task.create(taskData);
      task = created.toJSON();
    }

    // Send notification to assignee
    if (assignedTo && assignedTo !== userId) {
      await createNotification({
        userId: assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned the task: "${title}".`,
        type: 'task_created',
        relatedId: task.id,
        relatedType: 'task'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// Get All Tasks (with search, filter, and sorting)
exports.getAllTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { projectId, assignedTo, status, priority, search, sortBy, order } = req.query;

    if (isJsonFallback()) {
      let tasks = jsonStore.findAll('tasks');

      // Filter by projects that user belongs to
      const projects = jsonStore.findAll('projects').filter(p => {
        const members = p.teamMembers || [];
        return p.createdBy === userId || members.includes(userId);
      });
      const userProjectIds = projects.map(p => p.id);

      // Only show tasks belonging to user's projects OR assigned to/created by user
      tasks = tasks.filter(t => {
        return (t.projectId && userProjectIds.includes(t.projectId)) ||
               t.assignedTo === userId ||
               t.createdBy === userId;
      });

      // Query Filters
      if (projectId) {
        tasks = tasks.filter(t => t.projectId === projectId);
      }
      if (assignedTo) {
        tasks = tasks.filter(t => t.assignedTo === assignedTo);
      }
      if (status) {
        tasks = tasks.filter(t => t.status.toLowerCase() === status.toLowerCase());
      }
      if (priority) {
        tasks = tasks.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
      }
      if (search) {
        const query = search.toLowerCase();
        tasks = tasks.filter(t =>
          (t.title && t.title.toLowerCase().includes(query)) ||
          (t.description && t.description.toLowerCase().includes(query))
        );
      }

      // Sorting
      const sortField = sortBy || 'createdAt';
      const isDesc = order === 'DESC';

      tasks.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle nulls
        if (valA === null || valA === undefined) return isDesc ? 1 : -1;
        if (valB === null || valB === undefined) return isDesc ? -1 : 1;

        if (typeof valA === 'string' && valA.includes('T') && !isNaN(Date.parse(valA))) {
          // Dates sorting
          return isDesc
            ? new Date(valB) - new Date(valA)
            : new Date(valA) - new Date(valB);
        }

        if (typeof valA === 'string') {
          return isDesc
            ? valB.localeCompare(valA)
            : valA.localeCompare(valB);
        }

        return isDesc ? valB - valA : valA - valB;
      });

      return res.status(200).json({ success: true, tasks });
    } else {
      const { Task, Project, User } = getModels();
      const { Op } = require('sequelize');

      // Fetch projects first to restrict tasks
      const allProjects = await Project.findAll({ attributes: ['id', 'teamMembers', 'createdBy'] });
      const userProjectIds = allProjects
        .filter(p => {
          const members = p.teamMembers || [];
          return p.createdBy === userId || members.includes(userId);
        })
        .map(p => p.id);

      const whereClause = {
        [Op.or]: [
          { projectId: { [Op.in]: userProjectIds } },
          { assignedTo: userId },
          { createdBy: userId }
        ]
      };

      if (projectId) {
        whereClause.projectId = projectId;
      }
      if (assignedTo) {
        whereClause.assignedTo = assignedTo;
      }
      if (status) {
        whereClause.status = status;
      }
      if (priority) {
        whereClause.priority = priority;
      }
      if (search) {
        whereClause[Op.and] = [
          {
            [Op.or]: [
              { title: { [Op.like]: `%${search}%` } },
              { description: { [Op.like]: `%${search}%` } }
            ]
          }
        ];
      }

      const sortField = sortBy || 'createdAt';
      const sortOrder = order || 'DESC';

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'profilePicture'] },
          { model: Project, as: 'project', attributes: ['id', 'name'] }
        ],
        order: [[sortField, sortOrder]]
      });

      return res.status(200).json({ success: true, tasks });
    }
  } catch (error) {
    next(error);
  }
};

// Get Single Task by ID
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isJsonFallback()) {
      const task = jsonStore.findById('tasks', id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
      return res.status(200).json({ success: true, task });
    } else {
      const { Task, User, Project } = getModels();
      const task = await Task.findByPk(id, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'profilePicture'] },
          { model: Project, as: 'project', attributes: ['id', 'name'] }
        ]
      });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
      return res.status(200).json({ success: true, task: task.toJSON() });
    }
  } catch (error) {
    next(error);
  }
};

// Update Task
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, priority, status, assignedTo, deadline, estimatedHours, notes } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'Completed') {
        updates.completedAt = new Date().toISOString();
      } else {
        updates.completedAt = null;
      }
    }
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (deadline !== undefined) updates.deadline = deadline ? new Date(deadline).toISOString() : null;
    if (estimatedHours !== undefined) updates.estimatedHours = parseInt(estimatedHours, 10);
    if (notes !== undefined) updates.notes = notes;

    if (isJsonFallback()) {
      const task = jsonStore.findById('tasks', id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

      const updated = jsonStore.update('tasks', id, updates);

      // Notify assignee if status changed or reassigned
      if (status && status !== task.status) {
        const recipients = [updated.assignedTo, updated.createdBy].filter((val, idx, self) => val && self.indexOf(val) === idx);
        for (const rId of recipients) {
          await createNotification({
            userId: rId,
            title: status === 'Completed' ? 'Task Completed' : 'Task Status Updated',
            message: `Task "${updated.title}" status changed to ${status}.`,
            type: status === 'Completed' ? 'completion_alert' : 'task_updated',
            relatedId: id,
            relatedType: 'task'
          });
        }
      }

      return res.status(200).json({ success: true, message: 'Task updated.', task: updated });
    } else {
      const { Task, User } = getModels();
      const task = await Task.findByPk(id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

      const oldStatus = task.status;
      await task.update(updates);

      // Notify
      if (status && status !== oldStatus) {
        const recipients = [task.assignedTo, task.createdBy].filter((val, idx, self) => val && self.indexOf(val) === idx);
        for (const rId of recipients) {
          await createNotification({
            userId: rId,
            title: status === 'Completed' ? 'Task Completed' : 'Task Status Updated',
            message: `Task "${task.title}" status changed to ${status}.`,
            type: status === 'Completed' ? 'completion_alert' : 'task_updated',
            relatedId: id,
            relatedType: 'task'
          });
        }
      }

      // Reload to get associations
      const reloaded = await Task.findByPk(id, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'profilePicture'] }
        ]
      });

      return res.status(200).json({ success: true, message: 'Task updated.', task: reloaded.toJSON() });
    }
  } catch (error) {
    next(error);
  }
};

// Delete Task
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isJsonFallback()) {
      const task = jsonStore.findById('tasks', id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

      jsonStore.remove('tasks', id);

      // Notify assignee if not the deleting user
      if (task.assignedTo && task.assignedTo !== userId) {
        await createNotification({
          userId: task.assignedTo,
          title: 'Task Deleted',
          message: `Task "${task.title}" has been deleted.`,
          type: 'task_deleted',
          relatedId: id,
          relatedType: 'task'
        });
      }

      return res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    } else {
      const { Task } = getModels();
      const task = await Task.findByPk(id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

      const taskTitle = task.title;
      const assignedUser = task.assignedTo;

      await task.destroy();

      if (assignedUser && assignedUser !== userId) {
        await createNotification({
          userId: assignedUser,
          title: 'Task Deleted',
          message: `Task "${taskTitle}" has been deleted.`,
          type: 'task_deleted',
          relatedId: id,
          relatedType: 'task'
        });
      }

      return res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    }
  } catch (error) {
    next(error);
  }
};
