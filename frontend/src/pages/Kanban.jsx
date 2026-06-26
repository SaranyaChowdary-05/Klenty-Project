import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { taskAPI, projectAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Trello, 
  Plus, 
  Calendar, 
  User, 
  AlertCircle,
  Briefcase,
  Layers,
  ChevronRight,
  Clock
} from 'lucide-react';

const Kanban = () => {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch tasks and projects
  const loadData = async () => {
    try {
      const projectsRes = await projectAPI.getAll();
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.projects);
      }
      
      await loadTasks();
    } catch (error) {
      console.error('Failed to load Kanban board elements:', error);
      toast.error('Could not sync Kanban boards.');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const params = {
        projectId: selectedProjectId || undefined
      };
      const res = await taskAPI.getAll(params);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to sync tasks:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload tasks whenever selected project changes
  useEffect(() => {
    if (!loading) {
      loadTasks();
    }
  }, [selectedProjectId]);

  // Handle Drag & Drop completions
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a column or in the same place
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId; // 'Pending', 'In Progress', or 'Completed'

    // Optimistically update status in local state
    const originalTasks = [...tasks];
    setTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );

    try {
      const res = await taskAPI.update(taskId, { status: newStatus });
      if (res.data.success) {
        toast.success(`Task status updated to: ${newStatus}`);
      } else {
        // revert
        setTasks(originalTasks);
        toast.error('Failed to update status.');
      }
    } catch (error) {
      setTasks(originalTasks);
      toast.error('Network error updating task.');
    }
  };

  // Group columns
  const getTasksByStatus = (statusName) => {
    return tasks.filter(t => t.status === statusName);
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
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
          <span className="text-xs font-semibold text-gray-500">Syncing Kanban metrics...</span>
        </div>
      </div>
    );
  }

  const columns = [
    { id: 'Pending', name: 'Backlog / Pending', color: 'border-yellow-500 bg-yellow-500/5' },
    { id: 'In Progress', name: 'In Progress', color: 'border-primary-500 bg-primary-500/5' },
    { id: 'Completed', name: 'Completed ✓', color: 'border-emerald-500 bg-emerald-500/5' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center gap-2.5">
            <Trello className="w-6 h-6 text-primary-500" /> Kanban Workspace
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Drag-and-drop tasks between lists to update project statuses</p>
        </div>

        {/* Project filtering selector */}
        <div className="relative w-full sm:w-64">
          <select
            className="w-full glass-input bg-transparent appearance-none"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">All Project Boards</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drag and Drop Workspace */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start overflow-x-auto kanban-scroll pb-4 min-w-[700px] lg:min-w-0">
          
          {columns.map((col) => {
            const columnTasks = getTasksByStatus(col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl glass-card border border-gray-200/50 dark:border-gray-800/40 p-4 max-h-[70vh] overflow-hidden"
              >
                {/* Column Title */}
                <div className={`flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800/60 mb-4`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-tr ${
                      col.id === 'Pending' ? 'from-yellow-400 to-amber-500' : col.id === 'In Progress' ? 'from-primary-600 to-accent-500' : 'from-emerald-400 to-teal-500'
                    }`} />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                      {col.name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-dark-100 text-gray-500 dark:text-gray-400 rounded-lg">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Droppable Card Column */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto space-y-4 pr-1 min-h-[250px] transition-colors rounded-xl p-1.5 ${
                        snapshot.isDraggingOver ? 'bg-primary-500/5' : ''
                      }`}
                    >
                      {columnTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400/80 gap-1.5">
                          <AlertCircle className="w-7 h-7 text-gray-500" />
                          <span className="text-[10px]">No tasks in this list</span>
                        </div>
                      ) : (
                        columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-white dark:bg-[#1a1a2e]/60 border rounded-xl hover:border-primary-500/40 dark:hover:border-primary-500/30 transition-all duration-150 flex flex-col gap-3 shadow-sm ${
                                  snapshot.isDragging 
                                    ? 'shadow-2xl border-primary-500 ring-2 ring-primary-500/10 rotate-[1.5deg] scale-[1.01] bg-white dark:bg-[#222238]/80' 
                                    : 'border-gray-200/60 dark:border-gray-800/40'
                                }`}
                              >
                                {/* Header: priority */}
                                <div className="flex justify-between items-center">
                                  <span className={`px-2 py-0.5 text-[8px] font-bold rounded-lg border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  <span className="text-[9px] text-gray-400 flex items-center gap-1 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    {task.deadline ? new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No due'}
                                  </span>
                                </div>

                                {/* Title & details */}
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-relaxed line-clamp-2">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                      {task.description}
                                    </p>
                                  )}
                                </div>

                                {/* Card Footer: Project Name & Assignee */}
                                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/40 pt-2.5 mt-1">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide truncate max-w-[80px]">
                                    {task.project?.name || projects.find(p => p.id === task.projectId)?.name || 'General'}
                                  </span>
                                  
                                  {task.assignee ? (
                                    <div className="flex items-center gap-1.5">
                                      <img
                                        src={getAvatarUrl(task.assignee.profilePicture, task.assignee.name)}
                                        alt={task.assignee.name}
                                        className="w-5.5 h-5.5 rounded-full object-cover"
                                        title={task.assignee.name}
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-gray-400 italic">Unassigned</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Kanban;
