import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { inspectionAPI } from '../../api/api';
import InspectionStatCard from '../../components/inspection/InspectionStatCard';

const EmployeeDashboard = () => {
  const [data, setData] = useState({ today: {}, recentActivity: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await inspectionAPI.getDashboard();
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load inspection dashboard');
      }
    };
    load();
  }, []);

  const today = data.today || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing Inspection Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Scan products, record quality decisions, and maintain traceability.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/app/employee/sheet-inspection" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">
            <FileSpreadsheet className="h-4 w-4" />
            Sheet Entry
          </Link>
          <Link to="/app/employee/scanner" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700">
            <ScanLine className="h-4 w-4" />
            Start Scan
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">Today's Activity</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <InspectionStatCard label="Total Scans" value={today.totalScans} tone="blue" />
          <InspectionStatCard label="Accepted" value={today.accepted} tone="emerald" />
          <InspectionStatCard label="Rejected" value={today.rejected} tone="red" />
          <InspectionStatCard label="Rework" value={today.rework} tone="amber" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">Production Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <InspectionStatCard label="Processed Today" value={today.productsProcessedToday} />
          <InspectionStatCard label="Pending Reviews" value={today.pendingReviews} tone="blue" />
          <InspectionStatCard label="Forwarded" value={today.forwardedToNextStage} tone="emerald" />
          <InspectionStatCard label="Sent Back" value={today.sentBackToPreviousStage} tone="amber" />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
        <div className="space-y-4">
          {(data.recentActivity || []).length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No scans recorded yet today.</p>
          ) : (
            data.recentActivity.map((item) => (
              <div key={item._id} className="flex gap-4 border-l-2 border-primary-200 pl-4 dark:border-primary-800">
                <div className="w-20 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{item.code}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.actionTaken}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default EmployeeDashboard;

