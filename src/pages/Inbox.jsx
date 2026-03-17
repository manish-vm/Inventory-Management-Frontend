import { useState, useEffect } from 'react';
import { Search, Inbox, Mail, Trash2, Check, Eye, Reply, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { notificationAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const MessageInbox = () => {
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const { user } = useAuth();

  const MESSAGES_PER_PAGE = 10;

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
  const userMessages = res.data.filter(msg => 
        (msg.recipient && msg.recipient.toString() === user._id.toString()) ||
        (msg.to && msg.to.toString() === user._id.toString())
      );



      setMessages(userMessages);
      setUnreadMessages(userMessages.filter(msg => !msg.isRead));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages
    .filter(msg => {
      const matchesFilter = filter === 'all' || 
        (filter === 'unread' && !msg.isRead) ||
        (filter === 'read' && msg.isRead);
      
      const matchesSearch = msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * MESSAGES_PER_PAGE,
    currentPage * MESSAGES_PER_PAGE
  );

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await notificationAPI.delete(id);
      setMessages(messages.filter(msg => msg._id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setReplyLoading(true);
      // For now, just mark as read - backend reply endpoint needed
      await notificationAPI.markAsRead(selectedMessage._id);
      alert('Reply sent! (Backend reply endpoint needed)');
      setShowReply(false);
      setReplyText('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setReplyLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-8 h-8" />
            Inbox
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {unreadMessages.length} unread messages
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Messages List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">Messages ({filteredMessages.length})</h2>
            </div>
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Loading messages...
                </div>
              ) : paginatedMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No messages found</p>
                </div>
              ) : (
                paginatedMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                      selectedMessage?._id === msg._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary-500' : ''
                    } ${!msg.isRead ? 'font-medium' : ''}`}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">
                          {msg.sender?.name?.charAt(0).toUpperCase() || 'S'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {msg.title}
                          </h3>
                          {!msg.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">
                          {msg.message}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            {filteredMessages.length > MESSAGES_PER_PAGE && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {(currentPage - 1) * MESSAGES_PER_PAGE + 1} to {Math.min(currentPage * MESSAGES_PER_PAGE, filteredMessages.length)} of {filteredMessages.length} messages
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-slate-900 dark:text-white">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE)))}
                    disabled={currentPage === Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {!selectedMessage ? (
            <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Select a message</h3>
                <p>Click on a message from the list to view details</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {selectedMessage.sender?.name?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-lg">
                      {selectedMessage.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedMessage.sender?.name || 'System'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkAsRead(selectedMessage._id)}
                  className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Check className="w-3 h-3" />
                  Mark as read
                </button>
              </div>
              <div className="p-6 flex-1">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                  {formatTime(selectedMessage.createdAt)}
                </p>
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReply(!showReply)}
                    className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 text-sm text-red-700 dark:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
                
                {showReply && (
                  <div className="mt-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-vertical"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setShowReply(false);
                          setReplyText('');
                        }}
                        className="flex-1 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReply}
                        disabled={!replyText.trim() || replyLoading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {replyLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInbox;

