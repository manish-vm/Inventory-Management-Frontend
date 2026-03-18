import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  RefreshCw,
  Calendar,
  PieChart,
  Loader2
} from 'lucide-react';
import { dashboardAPI, billingAPI, productAPI, customerAPI, refundRequestAPI } from '../api/api';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value || 0);
};

// Simple Bar Chart Component
const BarChart = ({ data, title, xKey, yKey, color = '#6366f1', formatter }) => {
  const maxValue = Math.max(...data.map(d => d[yKey]), 1);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, index) => {
          const height = item[yKey] > 0 ? (item[yKey] / maxValue) * 100 : 5;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex items-end justify-center h-48">
                <div 
                  className="w-full max-w-12 rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative"
                  style={{ height: `${height}%`, backgroundColor: color }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {formatter ? formatter(item[yKey]) : item[yKey]}
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 text-center">
                {item[xKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple Pie Chart Component
const PieChartComponent = ({ data, title }) => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3', '#ef444b82f64', '#14b8a6'];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.reduce((acc, item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const previousPercentage = acc.offset;
              acc.elements.push(
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                  strokeDashoffset={-previousPercentage * 2.51}
                  className="transition-all duration-300"
                />
              );
              acc.offset += percentage;
              return acc;
            }, { elements: [], offset: 0 }).elements}
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Top Products Horizontal Bar Chart
const TopProductsChart = ({ products, title }) => {
  const maxValue = Math.max(...products.map(p => p.totalSold), 1);
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {products.map((product, index) => {
          const width = (product.totalSold / maxValue) * 100;
          return (
            <div key={product._id || index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                  {product.productName}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {product.totalSold} sold
                </span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${width}%`, backgroundColor: colors[index % colors.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {trend && (
      <div className={`flex items-center gap-1 mt-4 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{Math.abs(trend)}% vs last period</span>
      </div>
    )}
  </div>
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // days
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [refundStats, setRefundStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const fetchAllData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      
      const days = parseInt(timeRange);
      const [
        salesRes, 
        categoryRes, 
        topProductsRes, 
        statsRes, 
        invoicesRes,
        refundRes,
        customersRes
      ] = await Promise.all([
        dashboardAPI.getSalesChart(),
        dashboardAPI.getCategoryDistribution(),
        dashboardAPI.getTopProducts(days, 10),
        dashboardAPI.getStats(),
        billingAPI.getInvoices({}),
        refundRequestAPI.getAll({}),
        customerAPI.getAll()
      ]);
      
      // Process sales data
      setSalesData(salesRes.data);
      
      // Process category data
      setCategoryData(categoryRes.data);
      
      // Process top products
      setTopProducts(topProductsRes.data);
      
      // Set stats
      setStats(statsRes.data);
      
      // Set invoices
      setInvoices(invoicesRes.data);
      
      // Process refund stats
      const refunds = refundRes.data;
      setRefundStats({
        pending: refunds.filter(r => r.status === 'pending').length,
        approved: refunds.filter(r => r.status === 'approved').length,
        rejected: refunds.filter(r => r.status === 'rejected').length
      });
      
      // Set customers
      setCustomers(customersRes.data);
      
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate period-specific stats
  const getFilteredInvoices = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return invoices.filter(inv => new Date(inv.createdAt) >= cutoffDate);
  };

  const filteredInvoices = getFilteredInvoices();
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const completedInvoices = filteredInvoices.filter(inv => inv.status === 'completed').length;
  const refundedInvoices = filteredInvoices.filter(inv => inv.status === 'refunded').length;

  // Prepare sales chart data for the selected period
  const getSalesChartData = () => {
    const days = parseInt(timeRange);
    const salesByDate = {};
    
    // Initialize all dates
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      salesByDate[dateStr] = { date: date.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }), revenue: 0, invoices: 0 };
    }
    
    // Fill in actual data
    filteredInvoices.forEach(inv => {
      const dateStr = new Date(inv.createdAt).toISOString().split('T')[0];
      if (salesByDate[dateStr]) {
        salesByDate[dateStr].revenue += inv.totalAmount || 0;
        salesByDate[dateStr].invoices += 1;
      }
    });
    
    return Object.values(salesByDate);
  };

  const chartData = getSalesChartData();

  // Prepare category data for pie chart
  const getCategoryChartData = () => {
    const categoryMap = {};
    filteredInvoices.forEach(inv => {
      inv.items?.forEach(item => {
        // Get category from populated productId
        const categoryObj = item.productId?.category;
        const cat = categoryObj?.name || categoryObj || 'Uncategorized';
        if (!categoryMap[cat]) {
          categoryMap[cat] = 0;
        }
        categoryMap[cat] += item.total || 0;
      });
    });
    
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  };

  const categoryChartData = getCategoryChartData();

  // Prepare payment method distribution
  const getPaymentMethodData = () => {
    const methodMap = {};
    filteredInvoices.forEach(inv => {
      const method = inv.paymentMethod || 'Other';
      if (!methodMap[method]) {
        methodMap[method] = 0;
      }
      methodMap[method] += 1;
    });
    
    return Object.entries(methodMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  };

  const paymentMethodData = getPaymentMethodData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Track your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-600 p-1">
            <Calendar className="w-5 h-5 text-slate-500 ml-2" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-slate-800 bg-white text-black dark:bg-slate-800 text-white outline-none"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <button
            onClick={() => fetchAllData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${filteredInvoices.length} transactions`}
          icon={DollarSign}
          color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Completed Sales"
          value={completedInvoices}
          subtitle="Successful transactions"
          icon={ShoppingCart}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Refunded"
          value={refundedInvoices}
          subtitle={`${refundedInvoices > 0 ? formatCurrency(filteredInvoices.filter(inv => inv.status === 'refunded').reduce((sum, inv) => sum + inv.totalAmount, 0)) : '-'} total`}
          icon={RefreshCw}
          color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        />
        <StatCard
          title="Total Customers"
          value={customers.length}
          subtitle="Registered users"
          icon={Users}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Bar Chart */}
        <BarChart 
          data={chartData} 
          title={`Sales - Last ${timeRange} Days`}
          xKey="date"
          yKey="revenue"
          color="#6366f1"
          formatter={formatCurrency}
        />
        
        {/* Category Distribution */}
        <PieChartComponent 
          data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'No Data', value: 1 }]}
          title="Sales by Category"
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {topProducts.length > 0 ? (
          <TopProductsChart 
            products={topProducts.slice(0, 5)} 
            title={`Top Products - Last ${timeRange} Days`}
          />
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Products</h3>
            <div className="h-48 flex items-center justify-center text-slate-500">
              No sales data available
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <PieChartComponent 
          data={paymentMethodData.length > 0 ? paymentMethodData : [{ name: 'No Data', value: 1 }]}
          title="Payment Methods Distribution"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Refund Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Refund Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-slate-600 dark:text-slate-400">Pending</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{refundStats.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-600 dark:text-slate-400">Approved</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{refundStats.approved}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600 dark:text-slate-400">Rejected</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{refundStats.rejected}</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Average Order Value</h3>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(completedInvoices > 0 ? totalRevenue / completedInvoices : 0)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">per transaction</p>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Highest Order</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(Math.max(...filteredInvoices.map(inv => inv.totalAmount || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Lowest Order</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(Math.min(...filteredInvoices.filter(inv => inv.totalAmount > 0).map(inv => inv.totalAmount), Infinity) || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Inventory Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <span className="text-slate-600 dark:text-slate-400">Total Products</span>
              <span className="font-bold text-slate-900 dark:text-white">{stats?.totalProducts || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <span className="text-slate-600 dark:text-slate-400">Stock Value</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(stats?.totalStockValue)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <span className="text-slate-600 dark:text-slate-400">Low Stock Items</span>
              <span className="font-bold text-slate-900 dark:text-white">{stats?.lowStockCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;


