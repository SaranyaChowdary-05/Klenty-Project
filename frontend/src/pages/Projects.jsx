import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI, authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  Calendar, 
  Users, 
  Layers, 
  AlertCircle,
  Briefcase,
  X,
  Target
} from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Planning');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [progress, setProgress] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]); // Array of user IDs

  // Fetch projects and workspace users list
  const loadData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        projectAPI.getAll(),
        authAPI.getUsersList()
      ]);
      
      if (projRes.data.success) {
        setProjects(projRes.data.projects);
      }
      if (usersRes.data.success) {
        // filter out current user so they don't add themselves again redundantly
        setUsersList(usersRes.data.users.filter(u => u.id !== user.id));
      }
    } catch (error) {
      console.error('Failed to load project records:', error);
      toast.error('Failed to sync projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setName('');
    setDescription('');
    setCategory('Development');
    setPriority('Medium');
    setStatus('Planning');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDeadline(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setEstimatedHours('');
    setProgress(0);
    setTeamMembers([user.id]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setSelectedProject(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setCategory(proj.category || 'Development');
    setPriority(proj.priority || 'Medium');
    setStatus(proj.status || 'Planning');
    setStartDate(proj.startDate ? proj.startDate.split('T')[0] : '');
    setDeadline(proj.deadline ? proj.deadline.split('T')[0] : '');
    setEstimatedHours(proj.estimatedHours || '');
    setProgress(proj.progress || 0);
    setTeamMembers(proj.teamMembers || [user.id]);
    setIsEditModalOpen(true);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Project Name is required.');
      return;
    }

    try {
      const payload = {
        name,
        description,
        category,
        priority,
        status,
        startDate,
        deadline,
        teamMembers,
        estimatedHours
      };
      
      const res = await projectAPI.create(payload);
      if (res.data.success) {
        toast.success(`Project "${name}" created!`);
        setIsCreateModalOpen(false);
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project.');
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Project Name is required.');
      return;
    }

    try {
      const payload = {
        name,
        description,
        category,
        priority,
        status,
        startDate,
        deadline,
        teamMembers,
        estimatedHours,
        progress
      };

      const res = await projectAPI.update(selectedProject.id, payload);
      if (res.data.success) {
        toast.success(`Project "${name}" updated!`);
        setIsEditModalOpen(false);
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project.');
    }
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"? This deletes all associated tasks!`)) {
      return;
    }

    try {
      const res = await projectAPI.delete(id);
      if (res.data.success) {
        toast.success('Project deleted successfully.');
        loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project.');
    }
  };

  // Team members mapping
  const toggleTeamMember = (memberId) => {
    if (teamMembers.includes(memberId)) {
      // Don't let owner remove themselves
      if (memberId === user.id) return;
      setTeamMembers(teamMembers.filter(id => id !== memberId));
    } else {
      setTeamMembers([...teamMembers, memberId]);
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Critical': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'Medium': return 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  const getStatusBadge = (stat) => {
    switch (stat) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Active': return 'bg-primary-500/10 text-primary-500 border border-primary-500/20';
      case 'Planning': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  // Search & Filtering mapping
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    const matchesPriority = priorityFilter ? p.priority === priorityFilter : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
          <span className="text-xs font-semibold text-gray-500">Syncing projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-primary-500" /> Projects Directory
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage details, collaborate with teammates, and track milestones</p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl text-xs font-bold btn-gradient flex items-center justify-center gap-2 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Searching & Filter utilities */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white/40 dark:bg-dark-300/40 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 shadow-sm backdrop-blur-sm">
        
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full glass-input pl-9"
            placeholder="Search projects by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            className="w-full glass-input appearance-none bg-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
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

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3 animate-pulse" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Projects Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Try resetting your search query or create a new project to start tracking your work milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="glass-card flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative border-t-4 border-primary-500"
            >
              <div className="p-6 space-y-4.5">
                {/* Meta details */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block truncate">
                    {proj.category || 'General'}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg ${getPriorityBadge(proj.priority)}`}>
                      {proj.priority}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg ${getStatusBadge(proj.status)}`}>
                      {proj.status}
                    </span>
                  </div>
                </div>

                {/* Title & Desc */}
                <div className="space-y-1">
                  <h3
                    onClick={() => navigate(`/tasks?projectId=${proj.id}`)}
                    className="text-base font-extrabold text-gray-950 dark:text-white truncate cursor-pointer hover:text-primary-500 transition-colors"
                  >
                    {proj.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-500">Milestone Progress</span>
                    <span className="text-primary-500">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                {proj.deadline && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Due: {new Date(proj.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Area: Team Members & Controls */}
              <div className="px-6 py-4 bg-gray-50/50 dark:bg-dark-300/10 border-t border-gray-100 dark:border-gray-800/40 flex justify-between items-center">
                {/* Team member avatars */}
                <div className="flex -space-x-1.5 overflow-hidden">
                  {/* Visual limit of 4 avatars */}
                  {(proj.teamMembers || []).slice(0, 4).map((memberId, idx) => {
                    const matchedUser = usersList.find(u => u.id === memberId) || (memberId === user.id ? user : null);
                    if (!matchedUser) return null;
                    return (
                      <img
                        key={memberId}
                        className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white dark:ring-dark-50 object-cover"
                        src={getAvatarUrl(matchedUser.profilePicture, matchedUser.name)}
                        alt={matchedUser.name}
                        title={matchedUser.name}
                      />
                    );
                  })}
                  {(proj.teamMembers || []).length > 4 && (
                    <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-gray-200 dark:bg-dark-100 text-[9px] font-bold text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-dark-50">
                      +{(proj.teamMembers || []).length - 4}
                    </div>
                  )}
                </div>

                {/* CRUD icons (edit/delete) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(proj)}
                    className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                    title="Edit project board"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {proj.createdBy === user.id && (
                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.name)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete project board"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE PROJECT MODAL ── */}
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
              <Briefcase className="w-5 h-5 text-primary-500" /> Set Up New Project Board
            </h3>
            <p className="text-[11px] text-gray-400 mb-6">Create a shared milestone board for tracking deadlines</p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Project Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full glass-input"
                  placeholder="e.g. Website Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Description
                </label>
                <textarea
                  className="w-full glass-input h-20 resize-none py-2"
                  placeholder="Explain goals, key milestones and guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Category
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Testing">Testing</option>
                    <option value="Research">Research</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>

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
              </div>

              {/* Start Date & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full glass-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Deadline
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
                    placeholder="e.g. 150"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                  />
                </div>
              </div>

              {/* Team Members List */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Add Team Collaborators
                </label>
                <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-gray-100/40 dark:bg-dark-300/40 border border-gray-200/40 dark:border-gray-800/40">
                  {usersList.length === 0 ? (
                    <div className="text-[10px] text-gray-400 p-2 text-center">No other members registered in workspace.</div>
                  ) : (
                    usersList.map((member) => {
                      const isSelected = teamMembers.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => toggleTeamMember(member.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20' : 'hover:bg-gray-100 dark:hover:bg-dark-200 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={getAvatarUrl(member.profilePicture, member.name)}
                              alt={member.name}
                              className="w-6.5 h-6.5 rounded-full object-cover"
                            />
                            <div className="text-[11px]">
                              <p className="font-bold">{member.name}</p>
                              <p className="text-[9px] text-gray-400">{member.email}</p>
                            </div>
                          </div>
                          <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-primary-500' : 'bg-transparent'}`} />
                        </div>
                      );
                    })
                  )}
                </div>
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
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PROJECT MODAL ── */}
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
              <Edit3 className="w-5 h-5 text-primary-500" /> Modify Project Details
            </h3>
            <p className="text-[11px] text-gray-400 mb-6">Edit information, status, and milestone completion</p>

            <form onSubmit={handleEditProject} className="space-y-4">
              {/* Project Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full glass-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              {/* Status, Category & Priority */}
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
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Category
                  </label>
                  <select
                    className="w-full glass-input bg-transparent"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Testing">Testing</option>
                    <option value="Research">Research</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>

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
              </div>

              {/* Start Date & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full glass-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                    Deadline
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

              {/* Progress Level slider */}
              <div className="flex flex-col bg-gray-50/40 dark:bg-dark-300/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5"><Target className="w-4.5 h-4.5 text-primary-500" /> Milestone Completion Progress</span>
                  <span className="text-primary-500 font-bold">{progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-primary-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value, 10))}
                />
              </div>

              {/* Team Members List */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Manage Collaborators
                </label>
                <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-gray-100/40 dark:bg-dark-300/40 border border-gray-200/40 dark:border-gray-800/40">
                  {usersList.length === 0 ? (
                    <div className="text-[10px] text-gray-400 p-2 text-center">No other members registered in workspace.</div>
                  ) : (
                    usersList.map((member) => {
                      const isSelected = teamMembers.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => toggleTeamMember(member.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20' : 'hover:bg-gray-100 dark:hover:bg-dark-200 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={getAvatarUrl(member.profilePicture, member.name)}
                              alt={member.name}
                              className="w-6.5 h-6.5 rounded-full object-cover"
                            />
                            <div className="text-[11px]">
                              <p className="font-bold">{member.name}</p>
                              <p className="text-[9px] text-gray-400">{member.email}</p>
                            </div>
                          </div>
                          <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-primary-500' : 'bg-transparent'}`} />
                        </div>
                      );
                    })
                  )}
                </div>
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

export default Projects;
