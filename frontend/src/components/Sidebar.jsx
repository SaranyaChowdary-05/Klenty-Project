import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Trello,
  Calendar,
  BarChart3,
  User,
  LogOut,
  Layers,
  ChevronLeft,
  Zap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Circle
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getStats();
        if (res.data.success) setStats(res.data.stats);
      } catch (e) {}
    };
    fetchStats();
  }, []);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Projects', path: '/projects', icon: FolderKanban, badge: stats?.totalProjects || null },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare, badge: stats?.pendingTasks || null },
    { name: 'Kanban Board', path: '/kanban', icon: Trello, badge: null },
    { name: 'Calendar', path: '/calendar', icon: Calendar, badge: null },
    { name: 'Reports', path: '/reports', icon: BarChart3, badge: null },
    { name: 'Profile', path: '/profile', icon: User, badge: null },
  ];

  const getAvatarUrl = (profilePicture, name) => {
    if (profilePicture) {
      return profilePicture;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=7c3aed&color=fff&bold=true`;
  };

  const completionRate = stats
    ? stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0
    : 0;

  const quickStats = [
    { label: 'Projects', value: stats?.totalProjects ?? '–', color: '#06b6d4', icon: FolderKanban },
    { label: 'Completed', value: stats?.completedTasks ?? '–', color: '#10b981', icon: CheckCircle2 },
    { label: 'Pending', value: stats?.pendingTasks ?? '–', color: '#f59e0b', icon: Clock },
    { label: 'Total Tasks', value: stats?.totalTasks ?? '–', color: '#8b5cf6', icon: Zap },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        background: 'rgba(15, 15, 26, 0.97)',
        borderRight: '1px solid rgba(139, 92, 246, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Logo Header ── */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-purple-900/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1
              className="text-lg font-extrabold tracking-tight"
              style={{ background: 'linear-gradient(to right, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              SprintHub
            </h1>
            <p className="text-[9px] text-purple-400 font-semibold uppercase tracking-widest">
              Project Portal
            </p>
          </div>
        </div>
        <button onClick={closeSidebar} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 md:hidden transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* ── User Profile Mini Card ── */}
      {user && (
        <div className="mx-4 mt-5 p-3.5 rounded-2xl flex items-center gap-3 flex-shrink-0"
          style={{ background: 'rgba(139, 92, 246, 0.10)', border: '1px solid rgba(139, 92, 246, 0.20)' }}>
          <img
            src={getAvatarUrl(user.profilePicture, user.name)}
            alt={user.name}
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff&bold=true`; }}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-500/40 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate leading-tight">{user.name}</p>
            <p className="text-[10px] text-purple-300 truncate mt-0.5">{user.profession || 'Member'}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 ring-2 ring-emerald-400/30" title="Online" />
        </div>
      )}

      {/* ── Quick Stats Grid ── */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2 flex-shrink-0">
        {quickStats.map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl p-2.5 flex flex-col gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between">
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              <span className="text-base font-extrabold text-white leading-none">{value}</span>
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(156,163,175,0.8)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Completion Rate Bar ── */}
      <div className="mx-4 mt-3 p-3 rounded-xl flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-purple-400" /> Task Completion
          </span>
          <span className="text-[11px] font-extrabold text-purple-400">{completionRate}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${completionRate}%`,
              background: 'linear-gradient(to right, #7c3aed, #06b6d4)'
            }}
          />
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <div className="mt-4 px-3 flex-shrink-0">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">
          Navigation
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.1))',
                border: '1px solid rgba(139, 92, 246, 0.35)',
              } : {}}
            >
              {/* Active left accent bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: 'linear-gradient(to bottom, #7c3aed, #06b6d4)' }}
                />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                isActive ? 'text-purple-400' : 'group-hover:scale-110'
              }`} />
              <span className="flex-1">{item.name}</span>
              {/* Badge */}
              {item.badge ? (
                <span
                  className="px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white"
                  style={{ background: isActive ? 'rgba(139,92,246,0.6)' : 'rgba(139,92,246,0.3)' }}
                >
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Upcoming Deadlines Mini ── */}
      {stats?.upcomingDeadlines?.length > 0 && (
        <div className="mx-4 mt-3 p-3 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Upcoming Deadlines
          </p>
          <div className="space-y-1.5">
            {stats.upcomingDeadlines.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <Circle className="w-1.5 h-1.5 text-red-400 flex-shrink-0 fill-current" />
                <span className="text-[10px] text-gray-300 truncate flex-1">{item.name}</span>
                <span className="text-[9px] text-red-400 font-semibold flex-shrink-0">
                  {new Date(item.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Logout Footer ── */}
      <div className="p-4 mt-3 border-t border-purple-900/30 flex-shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          <span>Sign Out of Workspace</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
