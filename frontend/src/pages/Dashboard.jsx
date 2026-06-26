import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, projectAPI, taskAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FolderKanban, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  Plus, 
  Trello, 
  Calendar, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        dashboardAPI.getStats(),
        projectAPI.getAll()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Compile chart data (project name and its progress)
      if (projectsRes.data.success) {
        const data = projectsRes.data.projects.map(p => ({
          name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
          progress: p.progress || 0
        }));
        setChartData(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
      toast.error('Could not refresh dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'Critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium':
        return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Compiling statistics...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'from-blue-600 to-cyan-500', shadow: 'shadow-blue-500/10' },
    { title: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckSquare, color: 'from-purple-600 to-indigo-500', shadow: 'shadow-purple-500/10' },
    { title: 'Completed Tasks', value: stats?.completedTasks || 0, icon: Sparkles, color: 'from-emerald-600 to-teal-500', shadow: 'shadow-emerald-500/10' },
    { title: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: Clock, color: 'from-orange-600 to-amber-500', shadow: 'shadow-orange-500/10' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden relative border-l-8 border-primary-500">
        <div className="space-y-2 z-10">
          <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            Welcome back, {user?.name}! <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">
            You have <span className="font-semibold text-primary-500">{stats?.pendingTasks || 0} tasks</span> pending completion. Keep going and stay focused!
          </p>
        </div>
        
        {/* Quick action shortcuts */}
        <div className="flex flex-wrap gap-3 z-10 w-full md:w-auto">
          <button
            onClick={() => navigate('/projects')}
            className="flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-xl text-xs font-bold btn-gradient flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Project
          </button>
          
          <button
            onClick={() => navigate('/kanban')}
            className="flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-xl text-xs font-bold btn-gradient-secondary flex items-center justify-center gap-2"
          >
            <Trello className="w-4 h-4 text-purple-500" /> Kanban Board
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="glass-card p-6 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 group"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                  {card.value}
                </span>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-lg ${card.shadow} group-hover:rotate-6 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Project Completion progress bar chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-primary-500" /> Project Completion Progress
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Overall task completions mapped per active project board</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-[280px] w-full text-xs">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No project metrics available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#8b5cf630" tick={{ fill: '#888888', fontSize: 10 }} />
                  <YAxis unit="%" stroke="#8b5cf630" tick={{ fill: '#888888', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 30, 46, 0.9)', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="progress" fill="url(#colorProgress)" radius={[8, 8, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-primary-500" /> Upcoming Deadlines
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Tasks & projects with due dates in the next 7 days</p>
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className="p-1 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
            >
              <Calendar className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="space-y-3.5 overflow-y-auto flex-1 max-h-[300px] pr-1">
            {(!stats?.upcomingDeadlines || stats.upcomingDeadlines.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 gap-2">
                <AlertCircle className="w-8 h-8 text-gray-500" />
                <span className="text-xs">No urgent deadlines approaching!</span>
              </div>
            ) : (
              stats.upcomingDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 p-3 rounded-xl border border-gray-100/50 dark:border-gray-800/40 bg-gray-50/20 dark:bg-dark-300/10 hover:border-primary-500/40 dark:hover:border-primary-500/30 transition-all cursor-pointer"
                  onClick={() => navigate(item.type === 'project' ? '/projects' : '/tasks')}
                >
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${
                      item.type === 'project' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                    }`}>
                      {item.type}
                    </span>
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded-lg border uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate mt-1">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Due: {new Date(item.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities timeline */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-primary-500" /> Recent Activities
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Track modifications, status checks, and additions</p>
          </div>
        </div>

        {/* Timeline body */}
        <div className="space-y-5 relative pl-4 border-l-2 border-gray-200/50 dark:border-gray-800/40 ml-2.5">
          {(!stats?.recentActivities || stats.recentActivities.length === 0) ? (
            <div className="py-8 text-center text-xs text-gray-400 pl-0 border-l-0">
              No recent activity logged.
            </div>
          ) : (
            stats.recentActivities.map((act) => (
              <div key={act.id} className="relative space-y-1">
                {/* Bullet */}
                <div className="absolute -left-6.5 top-1.5 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-white dark:ring-dark-50" />
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {act.title}
                  </h4>
                  <span className="text-[9px] text-gray-400">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {act.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
