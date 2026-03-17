import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, MessageSquare, AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { notificationAPI } from '../api/api.js';
import { useTheme } from '../context/ThemeContext';


const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!isOpen) {
      await fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(notifications.filter(n => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'refund_approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'refund_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-white' : 'text-surface-900'} drop-shadow-sm flex items-center justify-center shadow-sm hover:shadow-md`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                <Bell className={`w-8 h-8 mx-auto mb-2 opacity-50 ${theme === 'dark' ? '' : 'text-surface-900'}`} />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/inbox';
                        }} 
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
                      >
                        View all messages
                      </button>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

