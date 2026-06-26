import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { projectAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Calendar as CalendarIcon, 
  X, 
  Briefcase, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  Tag
} from 'lucide-react';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal details state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadCalendarEvents = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        projectAPI.getAll(),
        taskAPI.getAll()
      ]);

      const formattedEvents = [];

      if (projectsRes.data.success) {
        projectsRes.data.projects.forEach(p => {
          if (p.deadline) {
            formattedEvents.push({
              id: `project-${p.id}`,
              title: `📅 Project: ${p.name}`,
              start: p.startDate ? new Date(p.startDate) : new Date(p.createdAt),
              end: new Date(p.deadline),
              allDay: true,
              resource: {
                type: 'project',
                name: p.name,
                description: p.description,
                status: p.status,
                priority: p.priority,
                deadline: p.deadline
              }
            });
          }
        });
      }

      if (tasksRes.data.success) {
        tasksRes.data.tasks.forEach(t => {
          if (t.deadline) {
            formattedEvents.push({
              id: `task-${t.id}`,
              title: `✓ Task: ${t.title}`,
              start: new Date(t.deadline),
              end: new Date(t.deadline),
              allDay: true,
              resource: {
                type: 'task',
                name: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                deadline: t.deadline,
                assignee: t.assignee
              }
            });
          }
        });
      }

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to format calendar event records:', error);
      toast.error('Failed to sync calendar deadlines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setShowDetailsModal(true);
  };

  // Custom event styles
  const eventStyleGetter = (event) => {
    const isProject = event.resource.type === 'project';
    const priority = event.resource.priority;

    let backgroundColor = '#8b5cf6'; // default purple
    
    if (isProject) {
      backgroundColor = '#06b6d4'; // Cyan for projects
    } else {
      if (priority === 'Critical') backgroundColor = '#ef4444'; // Red
      else if (priority === 'High') backgroundColor = '#f97316'; // Orange
      else if (priority === 'Low') backgroundColor = '#6b7280'; // Gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Plotting deadlines...</span>
        </div>
      </div>
    );
  }

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center gap-2.5">
          <CalendarIcon className="w-6 h-6 text-primary-500" /> Deadline Calendar
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Inspect milestones and task due dates mapped inside a monthly view</p>
      </div>

      {/* Calendar widget */}
      <div className="h-[620px] bg-white/40 dark:bg-dark-300/40 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 shadow-xl backdrop-blur-sm relative z-10 text-gray-700 dark:text-gray-200">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
        />
      </div>

      {/* ── EVENT DETAILS MODAL ── */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card p-6 md:p-8 relative animate-scale-in">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Type Header */}
            <div className="flex items-center gap-2 mb-4">
              {selectedEvent.type === 'project' ? (
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Briefcase className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <CheckSquare className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Milestone Details
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                  {selectedEvent.type} Record
                </h3>
              </div>
            </div>

            {/* Title & Desc */}
            <div className="space-y-3">
              <h4 className="text-base font-extrabold text-gray-950 dark:text-white leading-tight">
                {selectedEvent.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-100/30 dark:bg-dark-300/20 p-3 rounded-xl border border-gray-200/20 dark:border-gray-800/20">
                {selectedEvent.description || 'No description logged.'}
              </p>
            </div>

            {/* Attributes List */}
            <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/40 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 block font-medium">Status</span>
                <span className="font-bold text-primary-500 uppercase tracking-wide">
                  {selectedEvent.status}
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-gray-400 block font-medium">Priority</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityColor(selectedEvent.priority)}`}>
                  {selectedEvent.priority}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 block font-medium">Due Date</span>
                <span className="font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {new Date(selectedEvent.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {selectedEvent.type === 'task' && (
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Assignee</span>
                  <span className="font-semibold">
                    {selectedEvent.assignee ? selectedEvent.assignee.name.split(' ')[0] : 'Unassigned'}
                  </span>
                </div>
              )}
            </div>

            {/* Action */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-2.5 rounded-xl btn-gradient-secondary font-bold text-xs mt-6"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
