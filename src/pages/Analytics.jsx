import { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Package, QrCode, Workflow } from 'lucide-react';
import { qrCodeAPI, productionLogAPI, assemblyAPI, processingStageAPI, inspectionAPI } from '../api/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [stats, setStats] = useState({
    qrStats: {},
    productionStats: [],
    dailyProduction: [],
    assemblyStats: [],
    stageStats: [],
    inspectionProduction: { totals: {}, stageWise: [], productWise: [], employeeWise: [] }
  });
  const [loading, setLoading] = useState(true);

  const totalQRCodes = Object.values(stats.qrStats).reduce((sum, value) => sum + (value || 0), 0);
  const totalProduced = stats.dailyProduction.reduce((sum, item) => sum + (item.count || 0), 0);
  const totalAssemblies = stats.assemblyStats.reduce((sum, item) => sum + (item.count || 0), 0);
  const activeStages = stats.stageStats.length;

  const barColorClasses = {
    primary: 'bg-sky-500',
    blue: 'bg-sky-500',
    purple: 'bg-violet-500',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500'
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [qrRes, prodRes, dailyRes, asmRes, stageRes, inspectionRes] = await Promise.all([
        qrCodeAPI.getStats(),
        productionLogAPI.getStats(),
        productionLogAPI.getDaily(),
        assemblyAPI.getStats(),
        processingStageAPI.getStats(),
        inspectionAPI.getProductionAnalytics()
      ]);

      setStats({
        qrStats: qrRes.data,
        productionStats: prodRes.data,
        dailyProduction: dailyRes.data,
        assemblyStats: asmRes.data,
        stageStats: stageRes.data,
        inspectionProduction: inspectionRes.data
      });
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = (data, title, color = 'primary') => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400">No data available.</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d.count));
    const barClass = barColorClasses[color] || barColorClasses.primary;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Top trends</span>
        </div>
        <div className="space-y-4 flex-1">
          {data.map((item, index) => (
            <div key={item._id || index} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{item._id}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`${barClass} h-full rounded-full`}
                  style={{ width: `${Math.max((item.count / maxValue) * 100, 6)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQRStats = () => {
    const statusColors = {
      generated: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
      in_production: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200',
      processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
      used_in_assembly: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200'
    };

    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">QR Code Status</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track scanned codes across production flow.</p>
          </div>
          <div className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-sm text-slate-700 dark:text-slate-200">Total {totalQRCodes}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          {Object.entries(stats.qrStats).map(([status, count]) => (
            <div key={status} className={`rounded-3xl p-4 ${statusColors[status] || statusColors.generated}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/80 dark:bg-slate-800 p-2 shadow-sm">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{status.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <p className="text-3xl font-semibold text-slate-900 dark:text-white">{count}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTrendChart = () => {
    if (!stats.dailyProduction || stats.dailyProduction.length === 0) {
      return (
        <div className="rounded-3xl bg-white dark:bg-slate-800 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Production trend</h3>
          <p className="text-slate-500 dark:text-slate-400">No recent production records.</p>
        </div>
      );
    }

    const maxCount = Math.max(...stats.dailyProduction.map(day => day.count));

    return (
      <div className="rounded-3xl bg-white dark:bg-slate-800 shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Production trend</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Last {stats.dailyProduction.length} days</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
            <TrendingUp className="w-4 h-4" /> Stable
          </span>
        </div>

        <div className="grid grid-cols-7 gap-3 items-end flex-1">
          {stats.dailyProduction.map(day => (
            <div key={day._id} className="flex flex-col items-center gap-2">
              <div className="w-full rounded-full bg-slate-100 dark:bg-slate-700 transition-all duration-300" style={{ height: `${Math.max((day.count / maxCount) * 100, 8)}%` }} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{day._id}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Operations dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Production Analytics</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">A consolidated view of production performance, assembly flow, and QR activity to keep operations aligned.</p>
          </div>
          <button
            onClick={fetchAllStats}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <BarChart3 className="w-4 h-4" /> Refresh dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-4">
              <span className="text-sm">QR Codes</span>
              <PieChart className="w-5 h-5" />
            </div>
            <p className="text-4xl font-semibold text-slate-900 dark:text-white">{loading ? '—' : totalQRCodes}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Total tracked QR codes</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-4">
              <span className="text-sm">Production Units</span>
              <Package className="w-5 h-5" />
            </div>
            <p className="text-4xl font-semibold text-slate-900 dark:text-white">{loading ? '—' : totalProduced}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Units produced recently</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-4">
              <span className="text-sm">Assemblies</span>
              <Workflow className="w-5 h-5" />
            </div>
            <p className="text-4xl font-semibold text-slate-900 dark:text-white">{loading ? '—' : totalAssemblies}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Assemblies tracked across stages</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-4">
              <span className="text-sm">Live Stages</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-4xl font-semibold text-slate-900 dark:text-white">{loading ? '—' : activeStages}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Processing stages in the pipeline</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 p-6 shadow-sm">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Total Accepted Items</p>
            <p className="mt-2 text-4xl font-semibold text-emerald-800 dark:text-emerald-200">{loading ? '-' : stats.inspectionProduction.totals.accepted || 0}</p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Acceptance {stats.inspectionProduction.totals.acceptancePercent || 0}%</p>
          </div>
          <div className="rounded-3xl bg-red-50 dark:bg-red-900/20 p-6 shadow-sm">
            <p className="text-sm text-red-700 dark:text-red-300">Total Rejected Items</p>
            <p className="mt-2 text-4xl font-semibold text-red-800 dark:text-red-200">{loading ? '-' : stats.inspectionProduction.totals.rejected || 0}</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">Rejection {stats.inspectionProduction.totals.rejectionPercent || 0}%</p>
          </div>
          <div className="rounded-3xl bg-amber-50 dark:bg-amber-900/20 p-6 shadow-sm">
            <p className="text-sm text-amber-700 dark:text-amber-300">Total Rework Items</p>
            <p className="mt-2 text-4xl font-semibold text-amber-800 dark:text-amber-200">{loading ? '-' : stats.inspectionProduction.totals.rework || 0}</p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">Rework {stats.inspectionProduction.totals.reworkPercent || 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {loading ? (
            <div className="animate-pulse rounded-3xl bg-white dark:bg-slate-800 h-96" />
          ) : (
            renderTrendChart()
          )}
          {loading ? (
            <div className="animate-pulse rounded-3xl bg-white dark:bg-slate-800 h-96" />
          ) : (
            renderQRStats()
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="animate-pulse rounded-3xl bg-white dark:bg-slate-800 h-64" />
          ) : (
            renderBarChart(stats.productionStats, 'Production by Code', 'blue')
          )}
          {loading ? (
            <div className="animate-pulse rounded-3xl bg-white dark:bg-slate-800 h-64" />
          ) : (
            renderBarChart(stats.assemblyStats, 'Assemblies by Status', 'purple')
          )}
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stage Output</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Overview of processing throughput</p>
              </div>
            </div>
            {stats.stageStats.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No stage data available.</p>
            ) : (
              <div className="space-y-4">
                {stats.stageStats.map((item, index) => {
                  const ratio = item.totalInput ? Math.min((item.totalOutput / item.totalInput) * 100, 100) : 0;
                  return (
                    <div key={item._id || index} className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Stage {item._id}</span>
                        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.count} items</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${ratio}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{item.totalInput} in</span>
                        <span>{item.totalOutput} out</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {renderBarChart((stats.inspectionProduction.stageWise || []).map((item) => ({ _id: item._id || 'Stage', count: (item.accepted || 0) + (item.rejected || 0) + (item.rework || 0) })), 'Stage-wise Production Summary', 'green')}
          {renderBarChart((stats.inspectionProduction.productWise || []).map((item) => ({ _id: item._id || 'Product', count: (item.accepted || 0) + (item.rejected || 0) + (item.rework || 0) })), 'Product-wise Production Summary', 'blue')}
          {renderBarChart((stats.inspectionProduction.employeeWise || []).map((item) => ({ _id: item._id || 'Employee', count: (item.accepted || 0) + (item.rejected || 0) + (item.rework || 0) })), 'Employee-wise Production Summary', 'yellow')}
        </div>
      </div>
    </div>
  );
};

export default Analytics;



