const { isJsonFallback } = require('../config/database');
const { getModels } = require('../models/index');
const jsonStore = require('../utils/jsonStore');
const { createNotification } = require('../utils/helpers');

// Create Project
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, category, priority, status, startDate, deadline, teamMembers, estimatedHours } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    }

    let parsedMembers = [];
    if (teamMembers) {
      parsedMembers = typeof teamMembers === 'string' ? JSON.parse(teamMembers) : teamMembers;
    }
    // Always include creator in team members
    if (!parsedMembers.includes(userId)) {
      parsedMembers.push(userId);
    }

    const projectData = {
      name,
      description: description || '',
      category: category || 'General',
      priority: priority || 'Medium',
      status: status || 'Planning',
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: deadline ? new Date(deadline).toISOString() : null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      teamMembers: parsedMembers,
      estimatedHours: estimatedHours ? parseInt(estimatedHours, 10) : 0,
      progress: 0,
      notes: '',
      attachments: [],
      isArchived: false,
      createdBy: userId
    };

    let project = null;

    if (isJsonFallback()) {
      project = jsonStore.create('projects', projectData);
    } else {
      const { Project } = getModels();
      const created = await Project.create(projectData);
      project = created.toJSON();
    }

    // Create notifications for team members
    for (const memberId of parsedMembers) {
      await createNotification({
        userId: memberId,
        title: 'Project Assigned/Created',
        message: `You have been added to project "${name}".`,
        type: 'project_created',
        relatedId: project.id,
        relatedType: 'project'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Get All Projects (for logged-in user)
exports.getAllProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isJsonFallback()) {
      const projects = jsonStore.findAll('projects').filter(p => {
        // Created by user or member of team
        const members = p.teamMembers || [];
        return p.createdBy === userId || members.includes(userId);
      });
      return res.status(200).json({ success: true, projects });
    } else {
      const { Project, User } = getModels();
      const allProjects = await Project.findAll({
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'profilePicture'] }
        ]
      });

      // Filter projects where user is creator or in team members
      const filtered = allProjects.filter(p => {
        const members = p.teamMembers || [];
        return p.createdBy === userId || members.includes(userId);
      });

      return res.status(200).json({ success: true, projects: filtered });
    }
  } catch (error) {
    next(error);
  }
};

// Get Single Project by ID
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isJsonFallback()) {
      const project = jsonStore.findById('projects', id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      // Check access
      const members = project.teamMembers || [];
      if (project.createdBy !== userId && !members.includes(userId)) {
        return res.status(403).json({ success: false, message: 'Access denied to this project.' });
      }

      // Fetch related tasks
      const tasks = jsonStore.findByField('tasks', 'projectId', id);

      return res.status(200).json({
        success: true,
        project,
        tasks
      });
    } else {
      const { Project, Task, User } = getModels();
      const project = await Project.findByPk(id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'profilePicture'] }
        ]
      });

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      // Check access
      const members = project.teamMembers || [];
      if (project.createdBy !== userId && !members.includes(userId)) {
        return res.status(403).json({ success: false, message: 'Access denied to this project.' });
      }

      const tasks = await Task.findAll({
        where: { projectId: id },
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'profilePicture'] }
        ]
      });

      return res.status(200).json({
        success: true,
        project: project.toJSON(),
        tasks
      });
    }
  } catch (error) {
    next(error);
  }
};

// Update Project
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, category, priority, status, startDate, deadline, teamMembers, estimatedHours, progress, notes } = req.body;

    let parsedMembers = undefined;
    if (teamMembers) {
      parsedMembers = typeof teamMembers === 'string' ? JSON.parse(teamMembers) : teamMembers;
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate).toISOString() : null;
    if (deadline !== undefined) {
      updates.deadline = deadline ? new Date(deadline).toISOString() : null;
      updates.endDate = deadline ? new Date(deadline).toISOString() : null;
    }
    if (parsedMembers !== undefined) updates.teamMembers = parsedMembers;
    if (estimatedHours !== undefined) updates.estimatedHours = parseInt(estimatedHours, 10);
    if (progress !== undefined) updates.progress = parseInt(progress, 10);
    if (notes !== undefined) updates.notes = notes;

    if (isJsonFallback()) {
      const project = jsonStore.findById('projects', id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      // Check access (only creator or team members can edit)
      const members = project.teamMembers || [];
      if (project.createdBy !== userId && !members.includes(userId)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const updated = jsonStore.update('projects', id, updates);

      // Trigger status notifications
      if (status && status !== project.status) {
        const notifyList = updated.teamMembers || [];
        for (const memberId of notifyList) {
          await createNotification({
            userId: memberId,
            title: 'Project Status Updated',
            message: `Project "${updated.name}" status changed to ${status}.`,
            type: 'project_updated',
            relatedId: id,
            relatedType: 'project'
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        project: updated
      });
    } else {
      const { Project } = getModels();
      const project = await Project.findByPk(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      const members = project.teamMembers || [];
      if (project.createdBy !== userId && !members.includes(userId)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const oldStatus = project.status;
      await project.update(updates);

      // Notify status update
      if (status && status !== oldStatus) {
        const notifyList = project.teamMembers || [];
        for (const memberId of notifyList) {
          await createNotification({
            userId: memberId,
            title: 'Project Status Updated',
            message: `Project "${project.name}" status changed to ${status}.`,
            type: 'project_updated',
            relatedId: id,
            relatedType: 'project'
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        project: project.toJSON()
      });
    }
  } catch (error) {
    next(error);
  }
};

// Delete Project
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isJsonFallback()) {
      const project = jsonStore.findById('projects', id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      if (project.createdBy !== userId) {
        return res.status(403).json({ success: false, message: 'Only the project creator can delete it.' });
      }

      // Delete the project
      jsonStore.remove('projects', id);

      // Cascading delete: delete all tasks belonging to this project
      const tasks = jsonStore.findByField('tasks', 'projectId', id);
      for (const t of tasks) {
        jsonStore.remove('tasks', t.id);
      }

      // Notify other members
      const members = project.teamMembers || [];
      for (const mId of members) {
        if (mId !== userId) {
          await createNotification({
            userId: mId,
            title: 'Project Deleted',
            message: `Project "${project.name}" has been deleted.`,
            type: 'project_deleted',
            relatedId: id,
            relatedType: 'project'
          });
        }
      }

      return res.status(200).json({ success: true, message: 'Project and associated tasks deleted.' });
    } else {
      const { Project, Task } = getModels();
      const project = await Project.findByPk(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      if (project.createdBy !== userId) {
        return res.status(403).json({ success: false, message: 'Only the project creator can delete it.' });
      }

      const projectName = project.name;
      const members = project.teamMembers || [];

      // Associated tasks will be deleted by CASCADE on DB level, but let's double check or allow it
      await project.destroy();

      for (const mId of members) {
        if (mId !== userId) {
          await createNotification({
            userId: mId,
            title: 'Project Deleted',
            message: `Project "${projectName}" has been deleted.`,
            type: 'project_deleted',
            relatedId: id,
            relatedType: 'project'
          });
        }
      }

      return res.status(200).json({ success: true, message: 'Project and associated tasks deleted.' });
    }
  } catch (error) {
    next(error);
  }
};
