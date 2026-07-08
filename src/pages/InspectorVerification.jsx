import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, History, Loader2, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { inspectionAPI } from '../api/api';

const statusLabels = {
  matched: 'Matched',
  over_count: 'Over Count',
  under_count: 'Under Count'
};

const statusClasses = {
  matched: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
  over_count: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
  under_count: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
};

const getComparison = (employeeAccepted, inspectorAccepted) => {
  const difference = Number(inspectorAccepted || 0) - Number(employeeAccepted || 0);
  const verificationStatus = difference === 0 ? 'matched' : difference > 0 ? 'over_count' : 'under_count';
  return { difference, verificationStatus };
};

const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '-';
const getPart = (row) => row.partName || row.productName || row.partNumber || '-';
const getProcess = (row) => row.processName || row.stageName || '-';

const CountPill = ({ label, value, tone = 'slate' }) => {
  const classes = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
  };

  return (
    <div className={`rounded-lg px-3 py-2 ${classes[tone]}`}>
      <p className="text-xs font-medium uppercase">{label}</p>
      <p className="text-xl font-bold">{value || 0}</p>
    </div>
  );
};

const DetailField = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
    <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{value || '-'}</p>
  </div>
);

const VerificationPersonStatus = ({ name, matched = true, count }) => {
  const Icon = matched ? CheckCircle2 : XCircle;
  const tone = matched
    ? 'text-emerald-700 dark:text-emerald-300'
    : 'text-red-700 dark:text-red-300';
  const bg = matched
    ? 'bg-emerald-50 dark:bg-emerald-950/30'
    : 'bg-red-50 dark:bg-red-950/30';

  return (
    <div className={`inline-flex min-w-[150px] items-center gap-2 rounded-lg px-3 py-2 ${bg} ${tone}`}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name || '-'}</p>
        {count !== undefined && <p className="text-xs opacity-80">Accepted: {count}</p>}
      </div>
    </div>
  );
};

const VerificationModal = ({ row, onClose, onSaved }) => {
  const [inspectorAcceptedCount, setInspectorAcceptedCount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const comparison = useMemo(
    () => getComparison(row.employeeAcceptedCount, inspectorAcceptedCount),
    [inspectorAcceptedCount, row.employeeAcceptedCount]
  );
  const canSubmit = inspectorAcceptedCount !== '' && Number(inspectorAcceptedCount) >= 0;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      toast.error('Verified accepted count cannot be negative');
      return;
    }

    setSaving(true);
    try {
      await inspectionAPI.submitInspectorVerification({
        employeeSubmissionId: row._id,
        inspectorAcceptedCount: Number(inspectorAcceptedCount),
        remarks
      });
      toast.success('Verification saved');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save verification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Employee Submission</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{getPart(row)} - {getProcess(row)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <DetailField label="Part" value={getPart(row)} />
          <DetailField label="Process" value={getProcess(row)} />
          <DetailField label="Batch Number" value={row.batchNumber} />
          <DetailField label="Stage" value={`${row.stageName || 'Stage'} (${row.stageNumber || '-'})`} />
          <DetailField label="Employee" value={row.employeeName} />
          <DetailField label="Submitted At" value={formatDateTime(row.submittedAt)} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <CountPill label="Employee Accepted" value={row.employeeAcceptedCount} tone="emerald" />
          <CountPill label="Employee Rejected" value={row.employeeRejectedCount} tone="red" />
          <CountPill label="Employee Rework" value={row.employeeReworkCount} tone="amber" />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr]">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Verified Accepted Count</span>
            <input
              type="number"
              min="0"
              value={inspectorAcceptedCount}
              onChange={(event) => setInspectorAcceptedCount(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Remarks</span>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Calculated Result</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[comparison.verificationStatus]}`}>
                {statusLabels[comparison.verificationStatus]}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                Difference: {comparison.difference}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !canSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Save Verification
          </button>
        </div>
      </form>
    </div>
  );
};

const SubmissionsTable = ({ rows, onVerify }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <table className="w-full min-w-[1250px] table-fixed">
      <colgroup>
        <col className="w-[170px]" />
        <col className="w-[130px]" />
        <col className="w-[130px]" />
        <col className="w-[150px]" />
        <col className="w-[150px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[120px]" />
        <col className="w-[110px]" />
        <col className="w-[180px]" />
        <col className="w-[110px]" />
      </colgroup>
      <thead className="bg-slate-50 dark:bg-slate-900/60">
        <tr>
          {['Part', 'Process', 'Batch No', 'Stage', 'Employee', 'Accepted Count', 'Rejected Count', 'Rework Count', 'Status', 'Submitted At', 'Action'].map((head) => (
            <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row._id} className="border-t border-slate-200 dark:border-slate-700">
            <td className="px-4 py-3 text-sm font-semibold">{getPart(row)}</td>
            <td className="px-4 py-3 text-sm">{getProcess(row)}</td>
            <td className="px-4 py-3 text-sm">{row.batchNumber}</td>
            <td className="px-4 py-3 text-sm">{row.stageName || `Stage ${row.stageNumber}`}</td>
            <td className="px-4 py-3 text-sm">{row.employeeName}</td>
            <td className="px-4 py-3 text-sm">{row.employeeAcceptedCount}</td>
            <td className="px-4 py-3 text-sm text-red-700">{row.employeeRejectedCount}</td>
            <td className="px-4 py-3 text-sm text-amber-700">{row.employeeReworkCount}</td>
            <td className="px-4 py-3 text-sm"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">Pending</span></td>
            <td className="px-4 py-3 text-sm">{formatDateTime(row.submittedAt)}</td>
            <td className="px-4 py-3 text-sm">
              <button onClick={() => onVerify(row)} className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">
                Verify
              </button>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-500">No pending submissions found.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const LogsTable = ({ rows }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <table className="w-full min-w-[1180px] table-fixed">
      <colgroup>
        <col className="w-[170px]" />
        <col className="w-[190px]" />
        <col className="w-[150px]" />
        <col className="w-[130px]" />
        <col className="w-[130px]" />
        <col className="w-[230px]" />
        <col className="w-[230px]" />
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
                <VerificationPersonStatus name={row.employeeName} matched count={row.employeeAcceptedCount} />
              </td>
              <td className="px-4 py-3 text-sm">
                <VerificationPersonStatus
                  name={row.inspectorName}
                  matched={matched}
                  count={row.verification?.inspectorAcceptedCount}
                />
              </td>
              <td className={`px-4 py-3 text-sm font-semibold ${matched ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                {row.verification?.difference}
              </td>
              <td className="px-4 py-3 text-sm">{formatDateTime(row.verification?.verifiedAt)}</td>
            </tr>
          );
        })}
        {rows.length === 0 && (
          <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-500">No inspector scan logs found.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const InspectorVerification = ({ initialTab = 'pending' }) => {
  const [pending, setPending] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

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
      toast.error(error.response?.data?.message || 'Failed to load inspector verification');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inspector Verification</h1>
          <p className="text-slate-500 dark:text-slate-400">Cross-check employee accepted counts without changing submitted production records.</p>
        </div>
        <button onClick={load} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
          Refresh
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
        <button onClick={() => setActiveTab('pending')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'pending' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'}`}>
          <ClipboardCheck className="h-4 w-4" />
          Pending
        </button>
        <button onClick={() => setActiveTab('logs')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'logs' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'}`}>
          <History className="h-4 w-4" />
          Completed
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
      ) : activeTab === 'pending' ? (
        <SubmissionsTable rows={pending} onVerify={setSelected} />
      ) : (
        <LogsTable rows={logs} />
      )}

      {selected && <VerificationModal row={selected} onClose={() => setSelected(null)} onSaved={load} />}
    </div>
  );
};

export default InspectorVerification;
