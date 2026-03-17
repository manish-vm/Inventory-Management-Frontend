import { useState, useEffect } from 'react';
import { superAdminAPI } from '../api/api';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    role: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.currentPage, filters]);

  const fetchLogs = async () => {
    try {
      const params = {
        page: pagination.currentPage,
        limit: 50,
        ...filters
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await superAdminAPI.getActivityLogs(params);
      setLogs(response.data.logs);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      employee: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      customer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return colors[role] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Activity Logs
        </h1>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Total: {pagination.total} entries
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE_ADMIN">Create Admin</option>
              <option value="UPDATE_ADMIN">Update Admin</option>
              <option value="DELETE_ADMIN">Delete Admin</option>
              <option value="CREATE_DEALER">Create Dealer</option>
              <option value="UPDATE_DEALER">Update Dealer</option>
              <option value="DELETE_DEALER">Delete Dealer</option>
              <option value="CREATE_PLAN">Create Plan</option>
              <option value="UPDATE_PLAN">Update Plan</option>
              <option value="DELETE_PLAN">Delete Plan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {log.userId?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {log.userId?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(log.role)}`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 dark:text-slate-300 max-w-md truncate">
                      {log.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {log.ipAddress || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No activity logs found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;

