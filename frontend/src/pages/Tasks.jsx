import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI, projectAPI, authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  User, 
  AlertCircle,
  Briefcase,
  X,
  CheckCircle2,
  FileText
} from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState(initialProjectId);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Sort State
  const [sortBy, setSortBy] = useState('deadline'); // deadline, priority, createdAt
  const [sortOrder, setSortOrder] = useState('ASC');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch all tasks, projects, and users
  const loadData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        projectAPI.getAll(),
        authAPI.getUsersList()
      ]);

      if (projectsRes.data.success) {
        setProjects(projectsRes.data.projects);
      }
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }

      // Fetch tasks based on filters and sorting
      await refreshTasksList();
    } catch (error) {
      console.error('Failed to load tasks elements:', error);
      toast.error('Failed to load tasks data.');
    } finally {
      setLoading(false);
    }
  };

  const refreshTasksList = async () => {
    try {
      const params = {
        projectId: projectFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: searchQuery || undefined,
        sortBy: sortBy,
        order: sortOrder
      };
      const res = await taskAPI.getAll(params);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh tasks whenever local filters or sort configuration changes
  useEffect(() => {
    if (!loading) {
      refreshTasksList();
    }
  }, [projectFilter, statusFilter, priorityFilter, searchQuery, sortBy, sortOrder]);

  const handleOpenCreateModal = () => {
    setTitle('');
    setDescription('');
    // Use currently filtered project as default
    setProjectId(projectFilter || (projects[0]?.id || ''));
    setAssignedTo(user.id);
    setPriority('Medium');
    setStatus('Pending');
    setDeadline(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setEstimatedHours('');
    setNotes('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setProjectId(task.projectId || '');
    setAssignedTo(task.assignedTo || '');
    setPriority(task.priority || 'Medium');
    setStatus(task.status || 'Pending');
    setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
    setEstimatedHours(task.estimatedHours || '');
    setNotes(task.notes || '');
    setIsEditModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title) {
      toast.error('Task title is required.');
      return;
    }

    try {
      const payload = {
        title,
        description,
        projectId: projectId || null,
        assignedTo: assignedTo || null,
        priority,
        status,
        deadline,
        estimatedHours,
        notes
      };

      const res = await taskAPI.create(payload);
      if (res.data.success) {
        toast.success(`Task "${title}" created successfully!`);
        setIsCreateModalOpen(false);
        refreshTasksList();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!title) {
      toast.error('Task title is required.');
      return;
    }

    try {
      const payload = {
        title,
        description,
        projectId: projectId || null,
        assignedTo: assignedTo || null,
        priority,
        status,
        deadline,
        estimatedHours,
        notes
      };

      const res = await taskAPI.update(selectedTask.id, payload);
      if (res.data.success) {
        toast.success(`Task "${title}" updated successfully!`);
        setIsEditModalOpen(false);
        refreshTasksList();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to edit task.');
    }
  };

  const handleToggleComplete = async (task) => {
    const isCompleted = task.status === 'Completed';
    const newStatus = isCompleted ? 'Pending' : 'Completed';
    
    try {
      const res = await taskAPI.update(task.id, { status: newStatus });
      if (res.data.success) {
        toast.success(newStatus === 'Completed' ? 'Task marked as completed! 🎉' : 'Task reopened.');
        setTasks(prev => 
          prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
        );
      }
    } catch (err) {
      toast.error('Failed to change status.');
    }
  };

  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) {
      return;
    }

    try {
      const res = await taskAPI.delete(id);
      if (res.data.success) {
        toast.success('Task deleted.');
        refreshTasksList();
      }
    } catch (error) {
      toast.error('Failed to delete task.');
    }
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusColor = (stat) => {
    switch (stat) {
      case 'Completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress': return 'text-primary-500 bg-primary-500/10 border-primary-500/20';
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getAvatarUrl = (profilePicture, name) => {
    if (profilePicture) {
      return profilePicture;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&bold=true`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Syncing task logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-primary-500" /> Tasks Database
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Filter project items, assign users, and toggle completed statuses</p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl text-xs font-bold btn-gradient flex items-center justify-center gap-2 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Searching & Filter utilities */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-white/40 dark:bg-dark-300/40 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 shadow-sm backdrop-blur-sm">
        
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full glass-input pl-9"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Project Filter */}
        <div className="relative">
          <select
            className="w-full glass-input appearance-none bg-transparent"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="relative">
          <select
            className="w-full glass-input appearance-none bg-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority */}
        <div className="relative">
          <select
            className="w-full glass-input appearance-none bg-transparent"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Sorting panel */}
      <div className="flex justify-end gap-3 text-xs text-gray-500 font-semibold items-center">
        <span>Sort By:</span>
        <button
          onClick={() => {
            setSortBy('deadline');
            setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
          }}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${sortBy === 'deadline' ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' : 'border-gray-200/50 dark:border-gray-800/40 hover:bg-gray-100 dark:hover:bg-dark-100'}`}
        >
          Deadline {sortBy === 'deadline' && (sortOrder === 'ASC' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => {
            setSortBy('createdAt');
            setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
          }}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${sortBy === 'createdAt' ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' : 'border-gray-200/50 dark:border-gray-800/40 hover:bg-gray-100 dark:hover:bg-dark-100'}`}
        >
          Created Time {sortBy === 'createdAt' && (sortOrder === 'ASC' ? '↑' : '↓')}
        </button>
      </div>

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3 animate-pulse" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Tasks Logged</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Configure filters differently or create a task milestone.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden shadow-xl border border-gray-200/40 dark:border-gray-800/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100/50 dark:bg-dark-200/30 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200/50 dark:border-gray-800/40">
                  <th className="py-4.5 px-6 w-10">Done</th>
                  <th className="py-4.5 px-6">Task Title & Project</th>
                  <th className="py-4.5 px-6 w-28">Assigned To</th>
                  <th className="py-4.5 px-6 w-24">Priority</th>
                  <th className="py-4.5 px-6 w-24">Status</th>
                  <th className="py-4.5 px-6 w-28">Deadline</th>
                  <th className="py-4.5 px-6 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40 font-medium">
                {tasks.map((task) => {
                  const isDone = task.status === 'Completed';
                  const taskAssignee = task.assignee || usersList.find(u => u.id === task.assignedTo);
                  
                  return (
                    <tr 
                      key={task.id} 
                      className={`hover:bg-gray-100/30 dark:hover:bg-dark-100/10 transition-colors ${
                        isDone ? 'bg-emerald-500/5 dark:bg-emerald-500/5 opacity-75' : ''
                      }`}
                    >
                      {/* Checkbox toggler */}
                      <td className="py-4.5 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(task)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isDone 
                              ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' 
                              : 'text-gray-400 border-gray-300 dark:border-gray-700 hover:border-primary-500'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </td>

                      {/* Title & Project Name */}
                      <td className="py-4.5 px-6">
                        <div className="space-y-1">
                          <p 
                            onClick={() => handleOpenEditModal(task)}
                            className={`text-sm font-bold text-gray-900 dark:text-white cursor-pointer hover:underline ${
                              isDone ? 'line-through text-gray-500' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {task.project?.name || projects.find(p => p.id === task.projectId)?.name || 'General Board'}
                          </p>
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="py-4.5 px-6">
                        {taskAssignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={getAvatarUrl(taskAssignee.profilePicture, taskAssignee.name)}
                              alt={taskAssignee.name}
                              className="w-6.5 h-6.5 rounded-full object-cover"
                            />
                            <span className="truncate max-w-[80px]" title={taskAssignee.name}>
                              {taskAssignee.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-4.5 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="py-4.5 px-6 text-gray-500">
                        {task.deadline ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        ) : (
                          <span>--</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Edit task details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATE TASK MODAL ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl glass-card p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto relative animate-scale-in">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-primary-500" /> Create Task Record
            </h3>
            <p className="text-[11px] text-gray-400 mb-6">Create a task milestone, specify priority and assign user</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Title */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full glass-input"
                  placeholder="e.g. Write registration unit tests"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Description
                </label>
                <textarea
                  className="w-full glass-input h-20 resize-none py-2"
                  placeholder="Add detailed task instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Project & Assignee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Link Project Board
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  >
                    <option value="">No Project (General Board)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Assign Member
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    <option value={user.id}>{user.name} (Me)</option>
                    {usersList.filter(u => u.id !== user.id).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Priority
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    className="w-full glass-input"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    className="w-full glass-input"
                    placeholder="e.g. 8"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Additional Notes
                </label>
                <textarea
                  className="w-full glass-input h-14 resize-none py-1.5"
                  placeholder="Any extra comments or check links..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl btn-gradient-secondary font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-gradient font-bold text-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT TASK MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl glass-card p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto relative animate-scale-in">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-1">
              <Edit3 className="w-5 h-5 text-primary-500" /> Edit Task Details
            </h3>
            <p className="text-[11px] text-gray-400 mb-6">Modify instructions, update status and logs</p>

            <form onSubmit={handleEditTask} className="space-y-4">
              {/* Title */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full glass-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Description
                </label>
                <textarea
                  className="w-full glass-input h-20 resize-none py-2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Status, Project & Assignee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Status
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Link Project
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  >
                    <option value="">No Project (General)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Assignee
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    <option value={user.id}>{user.name} (Me)</option>
                    {usersList.filter(u => u.id !== user.id).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Priority
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    className="w-full glass-input"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    className="w-full glass-input"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Additional Notes
                </label>
                <textarea
                  className="w-full glass-input h-14 resize-none py-1.5"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl btn-gradient-secondary font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-gradient font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
