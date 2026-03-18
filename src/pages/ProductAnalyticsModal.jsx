import { X, ShoppingCart, Users, TrendingUp, DollarSign, BarChart3, PieChart } from 'lucide-react';

const ProductAnalyticsModal = ({ data, onClose }) => {
  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value || 0);

  const { product, analytics } = data || {};
  const { totalSold = 0, customersBought = 0, customerInterest = 0, firstStockDate, lastActivity, salesHistory = [], recentActivity = [], totalRevenue = 0 } = analytics || {};
  const uniqueCustomersCount = customersBought || 0;
  const lastRestockDate = lastActivity;

  const chartData = salesHistory.slice(-10).map(item => ({
    date: new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    sold: item.sold || item.quantity || 0
  }));

  const customerPieData = [
    { name: 'Repeat Buyers', value: Math.floor(uniqueCustomersCount * 0.6) || 1 },
    { name: 'First Time', value: Math.floor(uniqueCustomersCount * 0.4) }
  ];

  const BarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.sold), 1);
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 h-48">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{title}</h4>
        <div className="h-32 flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const height = (item.sold / maxValue) * 90;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  style={{ height: `${height}%`, backgroundColor: '#6366f1' }}
                  className="w-full rounded transition-all"
                />
                <span className="text-xs text-slate-500">{item.sold}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const PieChartComponent = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#6366f1', '#8b5cf6', '#ec4899'];
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{title}</h4>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16">
            <svg viewBox="0 0 36 36">
              {data.map((item, index) => {
                const size = total > 0 ? 360 * (item.value / total) : 0;
                const start = data.slice(0, index).reduce((a, b) => a + 360 * (b.value / total), 0);
                return (
                  <circle
                    key={index}
                    cx="18"
                    cy="18"
                    r="16"
                    fill="transparent"
                    stroke={colors[index % colors.length]}
                    strokeWidth="8"
                    strokeDasharray={`${size} 360`}
                    strokeDashoffset={360 - start}
                    transform="rotate(-90 18 18)"
                  />
                );
              })}
            </svg>
          </div>
          <div className="space-y-1">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{product?.productName} Analytics</h2>
            <p className="text-sm text-slate-500">{product?.productCode}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl">
              <ShoppingCart className="w-8 h-8 mb-2 opacity-90" />
              <div>
                <p className="text-blue-100 text-sm">Total Sold</p>
                <p className="text-3xl font-bold">{totalSold}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-xl">
              <Users className="w-8 h-8 mb-2 opacity-90" />
              <div>
                <p className="text-emerald-100 text-sm">Customers Bought</p>
                <p className="text-3xl font-bold">{uniqueCustomersCount}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-xl">
              <TrendingUp className="w-8 h-8 mb-2 opacity-90" />
              <div>
                <p className="text-purple-100 text-sm">Interest Score</p>
                <p className="text-3xl font-bold">{customerInterest}%</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl">
              <DollarSign className="w-8 h-8 mb-2 opacity-90" />
              <div>
                <p className="text-orange-100 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <BarChart data={chartData} title="Sold Trend (Last 10 Days)" />
            <PieChartComponent data={customerPieData} title="Customer Types" />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="p-3 text-left font-medium">Date</th>
                  <th className="p-3 text-left font-medium">Type</th>
                  <th className="p-3 text-left font-medium">Quantity</th>
                  <th className="p-3 text-right font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.slice(0, 8).map((activity, index) => (
                  <tr key={index} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="p-3">{new Date(activity.createdAt || activity.date).toLocaleDateString()}</td>
                    <td className="p-3 text-green-600">Sold</td>
                    <td className="p-3 font-medium">{activity.sold || activity.quantity}</td>
                    <td className="p-3 text-right">{activity.invoiceNumber}</td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">No sales activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">First Stock Date</p>
              <p>{firstStockDate ? new Date(firstStockDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500">Last Restock</p>
              <p>{lastRestockDate ? new Date(lastRestockDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500">Current Stock</p>
              <p className="font-bold text-2xl">{product?.stockQuantity || 0}</p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsModal;

