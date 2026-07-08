import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, History, Loader2, RefreshCw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { inspectionAPI } from '../api/api';

const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '-';
const getPart = (row) => row.partName || row.productName || row.partNumber || '-';
const getProcess = (row) => row.processName || row.stageName || '-';

const PersonStatus = ({ name, count, matched, pending = false }) => {
  const Icon = pending ? ClipboardCheck : matched ? CheckCircle2 : XCircle;
  const classes = pending
    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
    : matched
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
      : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300';

  return (
    <div className={`inline-flex min-w-[160px] items-center gap-2 rounded-lg px-3 py-2 ${classes}`}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name || '-'}</p>
        <p className="text-xs opacity-80">{pending ? 'Awaiting inspector' : `Accepted: ${count ?? 0}`}</p>
      </div>
    </div>
  );
};

const InspectorManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [pendingResponse, logsResponse] = await Promise.all([
        inspectionAPI.getInspectorPendingSubmissions(),
        inspectionAPI.getInspectorVerificationLogs()
      ]);
      setPending(pendingResponse.data.submissions || []);
      setLogs(logsResponse.data.logs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load inspector management logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    const sourceRows = activeTab === 'pending' ? pending : logs;
    const term = search.trim().toLowerCase();
    if (!term) return sourceRows;
    return sourceRows.filter((row) => [
      getPart(row),
      getProcess(row),
      row.stageName,
      row.employeeName,
      row.inspectorName,
      row.productName,
      row.batchNumber
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [activeTab, logs, pending, search]);

  const completedTotals = useMemo(() => logs.reduce((acc, row) => {
    const matched = row.verification?.verificationStatus === 'matched';
    acc.total += 1;
    acc.matched += matched ? 1 : 0;
    acc.mismatched += matched ? 0 : 1;
    return acc;
  }, { total: 0, matched: 0, mismatched: 0 }), [logs]);

  const pendingTotals = useMemo(() => pending.reduce((acc, row) => {
    acc.total += 1;
    acc.accepted += Number(row.employeeAcceptedCount || 0);
    acc.rejected += Number(row.employeeRejectedCount || 0);
    acc.rework += Number(row.employeeReworkCount || 0);
    return acc;
  }, { total: 0, accepted: 0, rejected: 0, rework: 0 }), [pending]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inspector Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Track pending inspections and completed inspector submissions across category and subcategory reports.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search part, process, employee"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white sm:w-72"
          />
          <button
            onClick={load}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'pending' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'}`}
        >
          <ClipboardCheck className="h-4 w-4" />
          Pending
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'completed' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'}`}
        >
          <History className="h-4 w-4" />
          Completed
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-semibold uppercase text-slate-500">{activeTab === 'pending' ? 'Pending Inspections' : 'Completed Inspections'}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{activeTab === 'pending' ? pendingTotals.total : completedTotals.total}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          <p className="text-xs font-semibold uppercase">{activeTab === 'pending' ? 'Accepted Qty' : 'Matched'}</p>
          <p className="mt-1 text-2xl font-bold">{activeTab === 'pending' ? pendingTotals.accepted : completedTotals.matched}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <p className="text-xs font-semibold uppercase">{activeTab === 'pending' ? 'Rejected / Rework Qty' : 'Mismatched'}</p>
          <p className="mt-1 text-2xl font-bold">{activeTab === 'pending' ? pendingTotals.rejected + pendingTotals.rework : completedTotals.mismatched}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        activeTab === 'pending' ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <table className="w-full min-w-[1220px] table-fixed">
            <colgroup>
              <col className="w-[170px]" />
              <col className="w-[190px]" />
              <col className="w-[150px]" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
              <col className="w-[240px]" />
              <col className="w-[240px]" />
              <col className="w-[120px]" />
              <col className="w-[180px]" />
            </colgroup>
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                {['Part', 'Process', 'Stage', 'Employee Count', 'Inspector Count', 'Employee', 'Inspector', 'Difference', 'Submitted At'].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 text-sm font-semibold">{getPart(row)}</td>
                  <td className="px-4 py-3 text-sm">{getProcess(row)}</td>
                  <td className="px-4 py-3 text-sm">{row.stageName || `Stage ${row.stageNumber || '-'}`}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{row.employeeAcceptedCount}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-400">-</td>
                  <td className="px-4 py-3 text-sm">
                    <PersonStatus name={row.employeeName} count={row.employeeAcceptedCount} matched />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <PersonStatus name="Pending" pending />
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-400">-</td>
                  <td className="px-4 py-3 text-sm">{formatDateTime(row.submittedAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">No pending inspections found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <table className="w-full min-w-[1220px] table-fixed">
            <colgroup>
              <col className="w-[170px]" />
              <col className="w-[190px]" />
              <col className="w-[150px]" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
              <col className="w-[240px]" />
              <col className="w-[240px]" />
              <col className="w-[120px]" />
              <col className="w-[180px]" />
            </colgroup>
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                {['Part', 'Process', 'Stage', 'Employee Count', 'Inspector Count', 'Employee', 'Inspector', 'Difference', 'Verified At'].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const matched = row.verification?.verificationStatus === 'matched';
                return (
                  <tr key={row.verificationId || row._id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3 text-sm font-semibold">{getPart(row)}</td>
                    <td className="px-4 py-3 text-sm">{getProcess(row)}</td>
                    <td className="px-4 py-3 text-sm">{row.stageName || `Stage ${row.stageNumber || '-'}`}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{row.employeeAcceptedCount}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{row.verification?.inspectorAcceptedCount}</td>
                    <td className="px-4 py-3 text-sm">
                      <PersonStatus name={row.employeeName} count={row.employeeAcceptedCount} matched={matched} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <PersonStatus name={row.inspectorName} count={row.verification?.inspectorAcceptedCount} matched={matched} />
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${matched ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                      {row.verification?.difference}
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDateTime(row.verification?.verifiedAt)}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">No completed inspector submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )
      )}
    </div>
  );
};

export default InspectorManagement;
