import { useState, useEffect } from 'react';
import { 
  User, 
  TrendingUp, 
  Users, 
  Package, 
  Target, 
  DollarSign,
  ShoppingCart,
  Clock,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { employeeAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await employeeAPI.getEmployeeProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const { employee, sales, topCustomers, topProducts, recentSales } = profileData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">View your sales performance and analytics</p>
        </div>
      </div>

      {/* Employee Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
            {employee?.name?.charAt(0).toUpperCase() || 'E'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{employee?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400">{employee?.email}</p>
            <p className="text-slate-500 dark:text-slate-400">{employee?.phone}</p>
          </div>
        </div>
      </div>

      {/* Sales Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Sales</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(sales?.totalSales)}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{sales?.totalOrders || 0}</p>
        </div>

        {/* Monthly Target */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Target</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(sales?.monthlyTarget)}</p>
        </div>

        {/* Target Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Target Progress</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{sales?.targetProgress || 0}%</p>
          </div>
          <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${sales?.targetProgress >= 100 ? 'bg-green-500' : 'bg-primary-500'}`}
              style={{ width: `${Math.min(sales?.targetProgress || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Customers and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Customers</h3>
          </div>
          
          {topCustomers && topCustomers.length > 0 ? (
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{customer.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{customer.orderCount} orders</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(customer.totalSpent)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No customers yet</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Selling Products</h3>
          </div>
          
          {topProducts && topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-accent-600 dark:text-accent-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{product.quantitySold} sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No products sold yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Sales</h3>
        </div>
        
        {recentSales && recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Invoice</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {recentSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{sale.customerName || 'Walk-in Customer'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                      {formatCurrency(sale.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No sales yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
