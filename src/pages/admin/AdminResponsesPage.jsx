import { useEffect, useState } from 'react';
import { Eye, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { inspectionAPI } from '../../api/api';
import InspectionStatCard from '../../components/inspection/InspectionStatCard';

const AdminResponsesPage = () => {
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', result: '' });

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

  const exportCsv = () => {
    const headers = ['Part Number', 'Description', 'Employee', 'Stage', 'Result', 'Submitted Date'];
    const body = responses.map((item) => [
      item.partNo,
      item.partDescription,
      item.employeeName,
      item.currentStageName || item.stageName,
      item.inspectionResult,
      item.submittedAt
    ]);
    const csv = [headers, ...body].map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inspection-responses.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inspection Responses</h1>
          <p className="text-slate-600 dark:text-slate-400">Review employee form submissions and quality outcomes.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200">
          <FileDown className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InspectionStatCard label="Total Responses" value={analytics.totalResponses} />
        <InspectionStatCard label="Accepted Responses" value={analytics.acceptedResponses} tone="emerald" />
        <InspectionStatCard label="Rejected Responses" value={analytics.rejectedResponses} tone="red" />
        <InspectionStatCard label="Rework Responses" value={analytics.reworkResponses} tone="amber" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search part, employee, product" className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
          <select value={filters.result} onChange={(e) => setFilters({ ...filters, result: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
            <option value="">All results</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="REWORK">Rework</option>
          </select>
          <button onClick={load} className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white">Apply</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                {['Part Number', 'Part Description', 'Employee Name', 'Current Stage', 'Inspection Result', 'Submitted Date', 'Actions'].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((item) => (
                <tr key={item._id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 text-sm font-semibold">{item.partNo}</td>
                  <td className="px-4 py-3 text-sm">{item.partDescription || '-'}</td>
                  <td className="px-4 py-3 text-sm">{item.employeeName || '-'}</td>
                  <td className="px-4 py-3 text-sm">{item.currentStageName || item.stageName}</td>
                  <td className="px-4 py-3 text-sm">{item.inspectionResult}</td>
                  <td className="px-4 py-3 text-sm">{new Date(item.submittedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => setSelected(item)} className="inline-flex items-center gap-1 rounded-lg bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                      <Eye className="h-3 w-3" />
                      View Responses
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-slate-800">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Response Details</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selected.partNo} - {selected.formName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-slate-700">Close</button>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60"><p className="text-xs uppercase text-slate-500">Employee</p><p className="font-medium">{selected.employeeName}</p></div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60"><p className="text-xs uppercase text-slate-500">Current Stage</p><p className="font-medium">{selected.currentStageName || selected.stageName}</p></div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60"><p className="text-xs uppercase text-slate-500">Result</p><p className="font-medium">{selected.inspectionResult}</p></div>
            </div>

            <div className="space-y-3">
              {(selected.responses || []).map((answer) => (
                <div key={answer.questionId || answer.question} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="font-medium text-slate-900 dark:text-white">{answer.question}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResponsesPage;
