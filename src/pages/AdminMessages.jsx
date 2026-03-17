import { useState, useEffect } from 'react';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Loader2, 
  X 
} from 'lucide-react';
import api from '../api/api.js';

import { useAuth } from '../context/AuthContext';

const AdminMessages = () => {
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [title, setTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [tab, setTab] = useState('employees'); // 'employees' or 'customers'
  const [success, setSuccess] = useState('');

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      if (tab === 'employees') {
        fetchEmployees();
      } else {
        fetchCustomers();
      }
    }
  }, [tab, isAdmin]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await api.get('/notifications/users', { params: { type: 'employees' } });


      setEmployees(response.data.map(emp => ({
        _id: emp._id,
        name: emp.username || emp.name || 'Employee',
        email: emp.email
      })));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await api.get('/notifications/users', { params: { type: 'customers' } });


      setCustomers(response.data.map(cust => ({
        _id: cust._id,
        name: cust.username || cust.name || 'Customer',
        email: cust.email
      })));
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      setLoading(true);
      setSuccess('');

      const broadcastData = {
        title: title || `Broadcast Message - ${new Date().toLocaleDateString()}`,
        message: messageContent
      };

      if (tab === 'employees') {
        await api.post('/notifications/broadcast-employees', broadcastData);

        setSuccess('Broadcast sent to all employees successfully!');
      } else {
        await api.post('/notifications/broadcast-customers', broadcastData);

        setSuccess('Broadcast sent to all customers successfully!');
      }

      // Reset form
      setTitle('');
      setMessageContent('');
      setSelectedRecipient(null);
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      setSuccess('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        <p>Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Broadcast Messages</h1>
          <p className="text-slate-500 dark:text-slate-400">Send announcements to your employees or customers</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('employees')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              tab === 'employees'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 mr-1 inline" />
            Employees
          </button>
          <button
            onClick={() => setTab('customers')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              tab === 'customers'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 mr-1 inline" />
            Customers
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
        {/* Broadcast Info (no individual select needed for broadcast) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Broadcast to All {tab === 'employees' ? 'Employees' : 'Customers'}
            </h3>
            
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Send to Entire Team
              </h4>
              <p className="text-slate-500 dark:text-slate-400">
                {tab === 'employees' 
                  ? 'This message will be sent to all employees under your dealer account'
                  : 'This message will be sent to all customers under your dealer account'
                }
              </p>
              {tab === 'employees' ? (
                <p className="text-sm text-slate-400 mt-2">{employees.length} employees</p>
              ) : (
                <p className="text-sm text-slate-400 mt-2">{customers.length} customers</p>
              )}
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              {tab === 'employees' ? 'Employee Broadcast' : 'Customer Broadcast'}
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Broadcast Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter broadcast title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter your broadcast message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-vertical"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setMessageContent('');
                  }}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading || !messageContent.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;

