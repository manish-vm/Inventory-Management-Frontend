import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, MessageSquare } from 'lucide-react';
import { notificationAPI } from '../api/index.js';


const InboxIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleClick = () => {
    navigate('/inbox');
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
className="relative p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 rounded-lg transition-colors text-white drop-shadow-sm flex items-center justify-center shadow-sm hover:shadow-md"
        title="Inbox"
      >
        <Inbox className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default InboxIcon;

