import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';
import { 
  Bell, 
  Menu, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  User, 
  Check, 
  Trash2, 
  Briefcase, 
  FileText,
  Clock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Poll for notifications every 15 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await notificationAPI.markRead(id);
      if (res.data.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationAPI.markAllRead();
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await notificationAPI.delete(id);
      if (res.data.success) {
        const deleted = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (deleted && !deleted.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'project_created':
      case 'project_updated':
        return <Briefcase className="w-4 h-4 text-cyan-500" />;
      case 'task_created':
      case 'task_updated':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'deadline_reminder':
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-primary-500" />;
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  const getAvatarUrl = (profilePicture, name) => {
    if (profilePicture) {
      return profilePicture;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&bold=true`;
  };

  return (
    <header className="sticky top-0 z-30 h-20 glass-card !rounded-none !border-t-0 !border-x-0 bg-white/70 dark:bg-dark-50/70 border-b border-gray-200/50 dark:border-gray-800/40 px-4 md:px-8 flex items-center justify-between">
      {/* Title / Mobile Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-100 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-lg font-bold tracking-tight text-gray-800 dark:text-gray-200 hidden sm:inline-block">
          SprintHub Workspace
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 border border-gray-200/50 dark:border-gray-800/40 transition-colors shadow-sm"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Icon & Drawer */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 border border-gray-200/50 dark:border-gray-800/40 transition-colors shadow-sm relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-50">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 max-h-[480px] flex flex-col glass-card border border-gray-200/60 dark:border-gray-800/60 shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-dark-200/30">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items */}
              <div className="flex-1 overflow-y-auto max-h-[320px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No notifications available
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`flex gap-3 p-4 border-b border-gray-100 dark:border-gray-800/60 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-dark-100/30 transition-colors ${
                        !notif.isRead ? 'bg-primary-500/5 dark:bg-primary-500/10' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-dark-200">
                          {getNotifIcon(notif.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {notif.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-gray-400 mt-1 block">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex items-start gap-1">
                        {!notif.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary-500 self-center" />
                        )}
                        <button
                          onClick={(e) => handleDeleteNotif(notif.id, e)}
                          className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Dropdown */}
        {user && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 pr-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/40 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors shadow-sm"
            >
              <img
                src={getAvatarUrl(user.profilePicture, user.name)}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary-500/10"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff&bold=true`;
                }}
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 hidden md:inline-block">
                {user.name.split(' ')[0]}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-48 flex flex-col glass-card border border-gray-200/60 dark:border-gray-800/60 shadow-2xl z-50 py-1.5">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800/60 mb-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-dark-100/60 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-dark-100/60 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Security Settings
                </Link>
                
                <div className="border-t border-gray-100 dark:border-gray-800/60 my-1"></div>
                
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
