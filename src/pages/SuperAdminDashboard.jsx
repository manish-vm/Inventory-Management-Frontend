import { useState, useEffect } from 'react';
import { superAdminAPI } from '../api/api';
import { 
  Store, 
  CheckCircle, 
  XCircle, 
  Shield, 
  UserCheck, 
  Users, 
  Package, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  UserCog,
  Activity,
  MessageCircle
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await superAdminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  const statColors = [
    'from-indigo-500 to-blue-600',
    'from-emerald-500 to-teal-600', 
    'from-orange-500 to-red-600',
    'from-purple-500 to-pink-600',
    'from-sky-500 to-cyan-600',
    'from-amber-500 to-yellow-600',
    'from-violet-500 to-indigo-600',
    'from-rose-500 to-red-500',
    'from-teal-500 to-emerald-600',
    'from-green-500 to-emerald-600'
  ];

  const statsList = [{
    title: 'Total Dealers', value: stats?.totalDealers || 0, icon: Store, colorIndex: 0 },
    { title: 'Active Dealers', value: stats?.activeDealers || 0, icon: CheckCircle, colorIndex: 1 },
    { title: 'Suspended Dealers', value: stats?.suspendedDealers || 0, icon: XCircle, colorIndex: 2 },
    { title: 'Total Admins', value: stats?.totalAdmins || 0, icon: Shield, colorIndex: 3 },
    { title: 'Active Admins', value: stats?.activeAdmins || 0, icon: UserCheck, colorIndex: 4 },
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, colorIndex: 5 },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: Package, colorIndex: 6 },
    { title: 'Low Stock Alerts', value: stats?.lowStockProducts || 0, icon: AlertTriangle, colorIndex: 7 },
    { title: 'Active Plans', value: stats?.activePlans || 0, icon: FileText, colorIndex: 8 },
    { title: 'Total Sales', value: `${formatCurrency(stats?.totalSales || 0).toLocaleString()}`, icon: DollarSign, colorIndex: 9 }
  ];

  const quickActionColors = [
    'from-indigo-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-sky-500 to-cyan-600'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Super Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statsList.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${statColors[stat.colorIndex]} hover:from-indigo-600 hover:to-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center shadow-sm text-white drop-shadow-sm hover:shadow-md`}>
                <stat.icon className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/superadmin/admins"
            className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${quickActionColors[0]} hover:from-indigo-600 hover:to-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center group-hover:scale-110 transition-all shadow-sm text-white drop-shadow-sm`}>
              <UserCog className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">Manage Admins</span>
          </a>
          <a
            href="/superadmin/dealers"
            className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${quickActionColors[1]} hover:from-emerald-600 hover:to-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center group-hover:scale-110 transition-all shadow-sm text-white drop-shadow-sm`}>
              <Store className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">Manage Dealers</span>
          </a>
          <a
            href="/superadmin/plans"
            className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${quickActionColors[2]} hover:from-purple-600 hover:to-pink-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center group-hover:scale-110 transition-all shadow-sm text-white drop-shadow-sm`}>
              <FileText className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">Manage Plans</span>
          </a>
          <a
            href="/superadmin/logs"
            className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${quickActionColors[3]} hover:from-orange-600 hover:to-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center group-hover:scale-110 transition-all shadow-sm text-white drop-shadow-sm`}>
              <Activity className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">View Logs</span>
          </a>
          <a
            href="/superadmin/messages"
            className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${quickActionColors[4]} hover:from-sky-600 hover:to-cyan-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center group-hover:scale-110 transition-all shadow-sm text-white drop-shadow-sm`}>
              <MessageCircle className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">Send Messages</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

