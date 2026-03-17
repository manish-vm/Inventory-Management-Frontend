import { useState, useEffect } from 'react';
import { 
  Send, 
  MessageCircle, 
  Users, 
  UserPlus, 
  Loader2, 
  X 
} from 'lucide-react';
import { notificationAPI } from '../api/api';

const Messages = () => {
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [title, setTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [tab, setTab] = useState('admins'); // 'admins' or 'employees'
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAdmins();
    if (tab === 'employees') fetchEmployees();
  }, [tab]);

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const response = await notificationAPI.getAllAdmins();
      setAdmins(response.data.map(admin => ({
        _id: admin._id,
        name: admin.username || admin.name || 'Admin',
        email: admin.email
      })));
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await notificationAPI.getAdminUsers({ type: 'employees' });
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      setLoading(true);
      setSuccess('');
      
      if (tab === 'admins') {
        await notificationAPI.sendToAdmin({
          adminId: selectedRecipient._id,
          title: title || `Message from SuperAdmin - ${new Date().toLocaleDateString()}`,
          message: messageContent
        });
      } else {
        await notificationAPI.broadcastToEmployees({
          title: title || `Broadcast Message - ${new Date().toLocaleDateString()}`,
          message: messageContent
        });
      }

      setTitle('');
      setMessageContent('');
      setSuccess(tab === 'admins' ? `Message sent to ${selectedRecipient.name}` : 'Broadcast sent to all employees');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Send Messages</h1>
          <p className="text-slate-500 dark:text-slate-400">Communicate with admins and employees</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('admins')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              tab === 'admins'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 mr-1 inline" />
            Admins (SuperAdmin → Admin)
          </button>
          <button
            onClick={() => setTab('employees')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              tab === 'employees'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 mr-1 inline" />
            Employees (Admin → Employees)
          </button>
        </nav>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex-shrink-0 bg-green-500 rounded-full"></div>
            {success}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipient Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {tab === 'admins' ? 'Select Admin' : 'Broadcast to All'}
            </h3>
            
            {tab === 'admins' ? (
              <div className="space-y-2">
                {loadingAdmins ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : admins.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                    No admins found
                  </p>
                ) : (
                  admins.map((admin) => (
                    <button
                      key={admin._id}
                      onClick={() => setSelectedRecipient(admin)}
                      className={`w-full p-3 rounded-xl text-left flex items-center gap-3 border transition-all ${
                        selectedRecipient?._id === admin._id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {admin.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {admin.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {admin.email}
                        </p>
                      </div>
                      {selectedRecipient?._id === admin._id && (
                        <UserPlus className="w-4 h-4 text-primary-600 dark:text-primary-400 ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Broadcast to All Employees
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  This message will be sent to all employees under your dealer
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              {tab === 'admins' ? 'Send Message to Admin' : 'Broadcast to Employees'}
            </h3>

            {tab === 'admins' && !selectedRecipient && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Select an admin to send message
                </h4>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Choose an admin from the list on the left
                </p>
                <button
                  onClick={() => setTab('employees')}
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Or broadcast to employees →
                </button>
              </div>
            )}

            {(tab === 'employees' || selectedRecipient) && (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {tab === 'admins' ? 'Message Title' : 'Broadcast Title'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter message title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Enter your message here..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-vertical"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMessage('');
                      setSelectedRecipient(null);
                    }}
                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !messageContent.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {tab === 'admins' ? 'Send Message' : 'Send Broadcast'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;


