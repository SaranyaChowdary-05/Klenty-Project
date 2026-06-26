const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ─── Pre-seeded IDs ──────────────────────────────────────────────────────────
const ADMIN_ID     = 'a1b2c3d4-0001-0001-0001-000000000001';
const PROJECT_1_ID = 'p1000000-0001-0001-0001-000000000001';
const PROJECT_2_ID = 'p2000000-0002-0002-0002-000000000002';
const TASK_1_ID    = 't1000000-0001-0001-0001-000000000001';
const TASK_2_ID    = 't2000000-0002-0002-0002-000000000002';
const TASK_3_ID    = 't3000000-0003-0003-0003-000000000003';
const TASK_4_ID    = 't4000000-0004-0004-0004-000000000004';
const TASK_5_ID    = 't5000000-0005-0005-0005-000000000005';
const NOTIF_1_ID   = 'n1000000-0001-0001-0001-000000000001';
const NOTIF_2_ID   = 'n2000000-0002-0002-0002-000000000002';
const NOTIF_3_ID   = 'n3000000-0003-0003-0003-000000000003';

// Hash synchronously so the store is ready before any request
const adminPasswordHash = bcrypt.hashSync('Admin@123', 12);

// ─── In-memory store ─────────────────────────────────────────────────────────
const jsonStore = {
  users: [
    {
      id: ADMIN_ID,
      name: 'Admin User',
      email: 'admin@sprinthub.com',
      password: adminPasswordHash,
      phone: '+1-555-000-0000',
      profession: 'Admin',
      organization: 'SprintHub Inc.',
      skills: ['Project Management', 'Agile', 'Scrum'],
      experience: '10+ years',
      profilePicture: null,
      bio: 'Default administrator account for SprintHub.',
      role: 'admin',
      isActive: true,
      lastLogin: null,
      createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
      updatedAt: new Date('2024-01-01T00:00:00Z').toISOString()
    }
  ],

  projects: [
    {
      id: PROJECT_1_ID,
      name: 'Website Redesign',
      description: 'Complete overhaul of the company marketing website to improve UX and conversion rates.',
      category: 'Design',
      status: 'Active',
      priority: 'High',
      startDate: new Date('2024-02-01').toISOString(),
      endDate: new Date('2024-06-30').toISOString(),
      deadline: new Date('2024-06-30').toISOString(),
      tags: ['design', 'frontend', 'ux'],
      teamMembers: [ADMIN_ID],
      estimatedHours: 320,
      progress: 45,
      notes: 'Focus on mobile-first approach.',
      attachments: [],
      isArchived: false,
      createdBy: ADMIN_ID,
      createdAt: new Date('2024-02-01T09:00:00Z').toISOString(),
      updatedAt: new Date('2024-03-15T11:00:00Z').toISOString()
    },
    {
      id: PROJECT_2_ID,
      name: 'Mobile App MVP',
      description: 'Build the minimum viable product of the SprintHub mobile application for iOS and Android.',
      category: 'Development',
      status: 'Planning',
      priority: 'Critical',
      startDate: new Date('2024-04-01').toISOString(),
      endDate: new Date('2024-09-30').toISOString(),
      deadline: new Date('2024-09-30').toISOString(),
      tags: ['mobile', 'react-native', 'mvp'],
      teamMembers: [ADMIN_ID],
      estimatedHours: 600,
      progress: 10,
      notes: 'Use React Native for cross-platform support.',
      attachments: [],
      isArchived: false,
      createdBy: ADMIN_ID,
      createdAt: new Date('2024-03-25T08:00:00Z').toISOString(),
      updatedAt: new Date('2024-03-25T08:00:00Z').toISOString()
    }
  ],

  tasks: [
    {
      id: TASK_1_ID,
      title: 'Design wireframes for homepage',
      description: 'Create low and high fidelity wireframes for the new homepage layout.',
      projectId: PROJECT_1_ID,
      category: 'Design',
      status: 'Completed',
      priority: 'High',
      deadline: new Date('2024-03-10').toISOString(),
      assignedTo: ADMIN_ID,
      estimatedHours: 16,
      tags: ['wireframe', 'homepage'],
      notes: 'Use Figma. Follow brand guidelines.',
      attachments: [],
      isArchived: false,
      createdBy: ADMIN_ID,
      completedAt: new Date('2024-03-09T17:00:00Z').toISOString(),
      createdAt: new Date('2024-02-05T10:00:00Z').toISOString(),
      updatedAt: new Date('2024-03-09T17:00:00Z').toISOString()
    },
    {
      id: TASK_2_ID,
      title: 'Implement responsive navigation',
      description: 'Build the responsive top navigation bar with dropdown menus for all breakpoints.',
      projectId: PROJECT_1_ID,
      category: 'Development',
      status: 'In Progress',
      priority: 'Medium',
      deadline: new Date('2024-04-20').toISOString(),
      assignedTo: ADMIN_ID,
      estimatedHours: 12,
      tags: ['html', 'css', 'javascript'],
      notes: null,
      attachments: [],
      isArchived: false,
      createdBy: ADMIN_ID,
      completedAt: null,
      createdAt: new Date('2024-03-12T09:00:00Z').toISOString(),
      updatedAt: new Date('2024-03-20T14:00:00Z').toISOString()
    },
    {
      id: TASK_3_ID,
      title: 'Set up React Native project',
      description: 'Initialize the React Native project with navigation, state management and folder structure.',
      projectId: PROJECT_2_ID,
      category: 'Development',
      status: 'In Progress',
      priority: 'Critical',
      deadline: new Date('2024-04-15').toISOString(),
      assignedTo: ADMIN_ID,
      estimatedHours: 8,
      tags: ['react-native', 'setup'],
      notes: 'Use Expo managed workflow.',
      attachments: [],
      isArchived: false,
      createdBy: ADMIN_ID,
      completedAt: null,
      createdAt: new Date('2024-03-26T10:00:00Z').toISOString(),
      updatedAt: new Date('2024-03-28T11:30:00Z').toISOString()
    },
    {
      id: TASK_4_ID,
      title: 'Design app icon and splash screen',
      description: 'Create branded app icon in all required sizes and splash screen for iOS and Android.',
      projectId: PROJECT_2_ID,
      category: 'Design',
      status: 'Pending',
      priority: 'Medium',
      deadline: new Date('2024-05-01').toISOString(),
      assignedTo: ADMIN_ID,
      estimatedHours: 6,
      tags: ['design', 'branding'],
      notes: null,
      attachments: [],
      isArchived: false,
      createdBy: ADMIN_ID,
      completedAt: null,
      createdAt: new Date('2024-03-26T10:30:00Z').toISOString(),
      updatedAt: new Date('2024-03-26T10:30:00Z').toISOString()
    },
    {
      id: TASK_5_ID,
      title: 'Write unit tests for auth module',
      description: 'Write comprehensive unit tests for the authentication module covering register, login and JWT flows.',
      projectId: PROJECT_1_ID,
      category: 'Testing',
      status: 'Pending',
      priority: 'Low',
      deadline: new Date('2024-05-30').toISOString(),
      assignedTo: ADMIN_ID,
      estimatedHours: 10,
      tags: ['testing', 'jest'],
      notes: 'Use Jest and Supertest.',
      attachments: [],
      isArchived: false,
      createdBy: ADMIN_ID,
      completedAt: null,
      createdAt: new Date('2024-03-28T08:00:00Z').toISOString(),
      updatedAt: new Date('2024-03-28T08:00:00Z').toISOString()
    }
  ],

  notifications: [
    {
      id: NOTIF_1_ID,
      userId: ADMIN_ID,
      title: 'Project Created',
      message: 'Project "Website Redesign" has been created successfully.',
      type: 'project_created',
      isRead: false,
      relatedId: PROJECT_1_ID,
      relatedType: 'project',
      createdAt: new Date('2024-02-01T09:05:00Z').toISOString(),
      updatedAt: new Date('2024-02-01T09:05:00Z').toISOString()
    },
    {
      id: NOTIF_2_ID,
      userId: ADMIN_ID,
      title: 'Task Completed',
      message: 'Task "Design wireframes for homepage" has been marked as completed.',
      type: 'completion_alert',
      isRead: true,
      relatedId: TASK_1_ID,
      relatedType: 'task',
      createdAt: new Date('2024-03-09T17:05:00Z').toISOString(),
      updatedAt: new Date('2024-03-10T08:00:00Z').toISOString()
    },
    {
      id: NOTIF_3_ID,
      userId: ADMIN_ID,
      title: 'Deadline Reminder',
      message: 'Task "Implement responsive navigation" is due in 3 days.',
      type: 'deadline_reminder',
      isRead: false,
      relatedId: TASK_2_ID,
      relatedType: 'task',
      createdAt: new Date('2024-04-17T08:00:00Z').toISOString(),
      updatedAt: new Date('2024-04-17T08:00:00Z').toISOString()
    }
  ]
};

// ─── Generic helpers ──────────────────────────────────────────────────────────

/**
 * Find a record by its id in a collection.
 * @param {string} collection - key in jsonStore
 * @param {string} id
 */
const findById = (collection, id) =>
  jsonStore[collection].find(item => item.id === id) || null;

/**
 * Find all records whose field matches value.
 */
const findByField = (collection, field, value) =>
  jsonStore[collection].filter(item => item[field] === value);

/**
 * Find first record whose field matches value.
 */
const findOneByField = (collection, field, value) =>
  jsonStore[collection].find(item => item[field] === value) || null;

/**
 * Create a new record in the collection.
 * Automatically assigns id, createdAt, updatedAt if not provided.
 */
const create = (collection, data) => {
  const now = new Date().toISOString();
  const record = {
    id: data.id || uuidv4(),
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };
  jsonStore[collection].push(record);
  return record;
};

/**
 * Update a record by id. Returns updated record or null.
 */
const update = (collection, id, data) => {
  const idx = jsonStore[collection].findIndex(item => item.id === id);
  if (idx === -1) return null;
  jsonStore[collection][idx] = {
    ...jsonStore[collection][idx],
    ...data,
    id, // prevent id override
    updatedAt: new Date().toISOString()
  };
  return jsonStore[collection][idx];
};

/**
 * Delete a record by id. Returns true if deleted.
 */
const remove = (collection, id) => {
  const idx = jsonStore[collection].findIndex(item => item.id === id);
  if (idx === -1) return false;
  jsonStore[collection].splice(idx, 1);
  return true;
};

/**
 * Return all records in a collection.
 */
const findAll = (collection) => [...jsonStore[collection]];

module.exports = {
  jsonStore,
  findById,
  findByField,
  findOneByField,
  create,
  update,
  remove,
  findAll
};
