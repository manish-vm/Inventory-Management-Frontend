import { useEffect, useMemo, useState } from 'react';
import { Eye, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { inspectionAPI } from '../../api/api';
import InspectionStatCard from '../../components/inspection/InspectionStatCard';

const AdminResponsesPage = () => {
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', result: '' });
  const [tableMode, setTableMode] = useState('summary'); // summary | detailed

  const load = async () => {
    try {
      const response = await inspectionAPI.getAdminResponses(filters);
      setResponses(response.data.responses || []);
      setAnalytics(response.data.analytics || {});
    } catch (error) {
      toast.error('Failed to load inspection responses');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatAnswerValue = (value) => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const computeReasonString = (items) => {
    if (!Array.isArray(items) || items.length === 0) return '';

    // items usually shaped like { questionText/question/questionId, answer }
    return items
      .map((it) => {
        const q = it?.questionText || it?.question || it?.questionId;
        const a = it?.answer;
        const val = formatAnswerValue(a);
        if (!q) return val;
        return `${q}: ${val}`;
      })
      .filter(Boolean)
      .join(' | ');
  };

  const table1Rows = useMemo(() => {
    return responses.map((item) => {
      const acceptedCount = Number(item.acceptedCount || 0);
      const rejectedCount = Number(item.rejectedCount || 0);
      const reworkCount = Number(item.reworkCount || 0);
      const overallCount = acceptedCount + rejectedCount + reworkCount;

      const rejectedReason = computeReasonString(item.rejectionFormResponses);
      const reworkReason = computeReasonString(item.reworkFormResponses);

      return {
        partNo: item.partNo,
        partDescription: item.partDescription,
        productName: item.productName || item.partNo,
        employeeName: item.employeeName,
        stage: item.currentStageName || item.stageName,
        acceptedCount,
        rejectedCount,
        rejectedReason: rejectedCount > 0 ? rejectedReason : '',
        reworkCount,
        reworkReason: reworkCount > 0 ? reworkReason : '',
        overallCount,
        submittedAt: item.submittedAt,
        // preserve for details modal
        raw: item
      };
    });
  }, [responses]);

  const exportCsvTable1 = () => {
    const headers = [
      'Part Number',
      'Description',
      'Employee',
      'Stage',
      'Accepted Count',
      'Rejected Count',
      'Rejected Reason',
      'Rework Count',
      'Rework Reason',
      'Overall Count',
      'Submitted Date'
    ];

    const body = table1Rows.map((r) => [
      r.partNo,
      r.partDescription,
      r.employeeName,
      r.stage,
      r.acceptedCount,
      r.rejectedCount,
      r.rejectedReason,
      r.reworkCount,
      r.reworkReason,
      r.overallCount,
      r.submittedAt
    ]);

    const csv = [headers, ...body]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inspection-responses-table-1.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsvTable2 = () => {
    const headers = [
      'Part number',
      'Product name',
      'Employee',
      'Stage',
      'Reason (both rework and reject separately in a single column)',
      'Status',
      'Count',
      'Submitted date and time (timestamp)'
    ];

    const rows = [];

    for (const r of table1Rows) {
      // accepted: reason should be Null
      if (r.acceptedCount > 0) {
        rows.push([
          r.partNo,
          r.productName,
          r.employeeName,
          r.stage,
          '',
          'ACCEPTED',
          r.acceptedCount,
          r.submittedAt
        ]);
      }

      if (r.rejectedCount > 0) {
        rows.push([
          r.partNo,
          r.productName,
          r.employeeName,
          r.stage,
          r.rejectedReason,
          'REJECTED',
          r.rejectedCount,
          r.submittedAt
        ]);
      }

      if (r.reworkCount > 0) {
        rows.push([
          r.partNo,
          r.productName,
          r.employeeName,
          r.stage,
          r.reworkReason,
          'REWORK',
          r.reworkCount,
          r.submittedAt
        ]);
      }
    }

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inspection-responses-table-2.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const onExport = () => {
    if (tableMode === 'summary') exportCsvTable1();
    else exportCsvTable2();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inspection Responses</h1>
          <p className="text-slate-600 dark:text-slate-400">Review employee form submissions and quality outcomes.</p>
        </div>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          <FileDown className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InspectionStatCard label="Total Responses" value={analytics.totalResponses} />
        <InspectionStatCard label="Accepted Items" value={analytics.acceptedItems} tone="emerald" />
        <InspectionStatCard label="Rejected Items" value={analytics.rejectedItems} tone="red" />
        <InspectionStatCard label="Rework Items" value={analytics.reworkItems} tone="amber" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search part, employee, product"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <select
            value={filters.result}
            onChange={(e) => setFilters({ ...filters, result: e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">All results</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="REWORK">Rework</option>
          </select>
          <button onClick={load} className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white">
            Apply
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTableMode('summary')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              tableMode === 'summary'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            Table 1 - Summary
          </button>
          <button
            type="button"
            onClick={() => setTableMode('detailed')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              tableMode === 'detailed'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            Table 2 - Detailed
          </button>
        </div>

        <div className="overflow-x-auto">
          {tableMode === 'summary' ? (
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  {[
                    'Part Number',
                    'Part Description',
                    'Employee Name',
                    'Current Stage',
                    'Accepted Count',
                    'Rejected Count',
                    'Rejected Reason',
                    'Rework Count',
                    'Rework Reason',
                    'Overall Count',
                    'Submitted Date',
                    'Actions'
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table1Rows.map((r) => (
                  <tr key={r.raw?._id || `${r.partNo}-${r.submittedAt}`} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3 text-sm font-semibold">{r.partNo}</td>
                    <td className="px-4 py-3 text-sm">{r.partDescription || '-'}</td>
                    <td className="px-4 py-3 text-sm">{r.employeeName || '-'}</td>
                    <td className="px-4 py-3 text-sm">{r.stage || '-'}</td>
                    <td className="px-4 py-3 text-sm">{r.acceptedCount}</td>
                    <td className="px-4 py-3 text-sm text-red-700">{r.rejectedCount}</td>
                    <td className="px-4 py-3 text-sm">{r.rejectedReason || '-'}</td>
                    <td className="px-4 py-3 text-sm text-amber-700">{r.reworkCount}</td>
                    <td className="px-4 py-3 text-sm">{r.reworkReason || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{r.overallCount}</td>
                    <td className="px-4 py-3 text-sm">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => setSelected(r.raw)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700"
                      >
                        <Eye className="h-3 w-3" />
                        View Responses
                      </button>
                    </td>
                  </tr>
                ))}
                {table1Rows.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                      No inspection responses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[1150px]">
              <thead className="bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  {[
                    'Part number',
                    'Product name',
                    'Employee',
                    'Stage',
                    'Reason (rework/reject)',
                    'Status',
                    'Count',
                    'Submitted date and time'
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = [];
                  for (const r of table1Rows) {
                    if (r.acceptedCount > 0) {
                      rows.push({
                        key: `acc-${r.partNo}-${r.submittedAt}`,
                        partNo: r.partNo,
                        productName: r.productName,
                        employeeName: r.employeeName,
                        stage: r.stage,
                        reason: '',
                        status: 'ACCEPTED',
                        count: r.acceptedCount,
                        submittedAt: r.submittedAt,
                        raw: r.raw
                      });
                    }
                    if (r.rejectedCount > 0) {
                      rows.push({
                        key: `rej-${r.partNo}-${r.submittedAt}`,
                        partNo: r.partNo,
                        productName: r.productName,
                        employeeName: r.employeeName,
                        stage: r.stage,
                        reason: r.rejectedReason,
                        status: 'REJECTED',
                        count: r.rejectedCount,
                        submittedAt: r.submittedAt,
                        raw: r.raw
                      });
                    }
                    if (r.reworkCount > 0) {
                      rows.push({
                        key: `rw-${r.partNo}-${r.submittedAt}`,
                        partNo: r.partNo,
                        productName: r.productName,
                        employeeName: r.employeeName,
                        stage: r.stage,
                        reason: r.reworkReason,
                        status: 'REWORK',
                        count: r.reworkCount,
                        submittedAt: r.submittedAt,
                        raw: r.raw
                      });
                    }
                  }
                  return rows.map((row) => (
                    <tr
                      key={row.key}
                      className="border-t border-slate-200 dark:border-slate-700"
                      onClick={() => setSelected(row.raw)}
                      style={{ cursor: 'pointer' }}
                      title="Click to view detailed responses"
                    >
                      <td className="px-4 py-3 text-sm font-semibold">{row.partNo}</td>
                      <td className="px-4 py-3 text-sm">{row.productName || '-'}</td>
                      <td className="px-4 py-3 text-sm">{row.employeeName || '-'}</td>
                      <td className="px-4 py-3 text-sm">{row.stage || '-'}</td>
                      <td className="px-4 py-3 text-sm">{row.reason || 'Null'}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        <span
                          className={
                            row.status === 'ACCEPTED'
                              ? 'text-emerald-700'
                              : row.status === 'REJECTED'
                                ? 'text-red-700'
                                : 'text-amber-700'
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{row.count}</td>
                      <td className="px-4 py-3 text-sm">{row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '-'}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-slate-800">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Response Details</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selected.partNo} - {selected.formName}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                <p className="text-xs uppercase text-slate-500">Employee</p>
                <p className="font-medium">{selected.employeeName}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                <p className="text-xs uppercase text-slate-500">Stage</p>
                <p className="font-medium">{selected.currentStageName || selected.stageName}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                <p className="text-xs uppercase text-slate-500">Product</p>
                <p className="font-medium">{selected.productName || selected.partNo}</p>
              </div>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                <p className="text-xs uppercase">Accepted Items</p>
                <p className="text-2xl font-bold">{selected.acceptedCount || 0}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                <p className="text-xs uppercase">Rejected Items</p>
                <p className="text-2xl font-bold">{selected.rejectedCount || 0}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <p className="text-xs uppercase">Rework Items</p>
                <p className="text-2xl font-bold">{selected.reworkCount || 0}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Inspection Form Responses</h3>
              {(selected.responses || []).map((answer) => (
                <div
                  key={answer.questionId || answer.question}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                >
                  <p className="font-medium text-slate-900 dark:text-white">{answer.question}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {Array.isArray(answer.answer)
                      ? answer.answer.join(', ')
                      : answer.answer || '-'}
                  </p>
                </div>
              ))}

              {(selected.rejectionFormResponses || []).length > 0 && (
                <h3 className="pt-3 font-semibold text-slate-900 dark:text-white">Rejection Analysis</h3>
              )}
              {(selected.rejectionFormResponses || []).map((answer) => (
                <div
                  key={`rej-${answer.questionId || answer.question}`}
                  className="rounded-lg border border-red-200 p-4 dark:border-red-900"
                >
                  <p className="font-medium text-slate-900 dark:text-white">{answer.question}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {Array.isArray(answer.answer)
                      ? answer.answer.join(', ')
                      : answer.answer || '-'}
                  </p>
                </div>
              ))}

              {(selected.reworkFormResponses || []).length > 0 && (
                <h3 className="pt-3 font-semibold text-slate-900 dark:text-white">Rework Analysis</h3>
              )}
              {(selected.reworkFormResponses || []).map((answer) => (
                <div
                  key={`rw-${answer.questionId || answer.question}`}
                  className="rounded-lg border border-amber-200 p-4 dark:border-amber-900"
                >
                  <p className="font-medium text-slate-900 dark:text-white">{answer.question}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {Array.isArray(answer.answer)
                      ? answer.answer.join(', ')
                      : answer.answer || '-'}
                  </p>
                </div>
              ))}

              {selected.remarks && (
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-xs uppercase text-slate-500">Remarks</p>
                  <p>{selected.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResponsesPage;

