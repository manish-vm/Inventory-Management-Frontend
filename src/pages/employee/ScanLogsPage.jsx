import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { inspectionAPI } from '../../api/api';

const ScanLogsPage = () => {
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await inspectionAPI.getScanLogs({ search });
      // backend may return either { rows } or { logs } depending on version
      const next = response?.data?.logs || response?.data?.rows || [];
      setRows(Array.isArray(next) ? next : []);
      setDetails(Array.isArray(response?.data?.details) ? response.data.details : []);
    } catch (err) {
      setRows([]);
      setDetails([]);
      setError('Failed to load scan logs');
      toast.error('Failed to load scan logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scan Logs</h1>
          <p className="text-slate-600 dark:text-slate-400">Audit-friendly product inspection summary by Code.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search part or product"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <button onClick={load} className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white">
            Search
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { key: 'summary', label: 'Summary' },
          { key: 'details', label: 'Details' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-700 dark:text-primary-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {loading ? (
          <div className="px-4 py-10 text-center text-slate-500">Loading scan logs...</div>
        ) : error ? (
          <div className="px-4 py-10 text-center text-red-600">{error}</div>
        ) : activeTab === 'summary' ? (
          <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                {[
                  'Code',
                  'Product Name',
                  'Product Description',
                  'Current Stage',
                  'Total Ideal Product Count',
                  'Accepted Count',
                  'Rejected Count',
                  'Rework Count',
                  'Pending Count',
                  'Last Action',
                  'Last Updated',
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
              {rows.map((row) => (
                <tr key={row.code} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{row.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.productName || row.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.productDescription || '-'}</td>

                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.currentStage || '-'}</td>
                  <td className="px-4 py-3 text-sm">{row.totalIdealProductCount}</td>
                  <td className="px-4 py-3 text-sm text-emerald-700">{row.acceptedCount}</td>
                  <td className="px-4 py-3 text-sm text-red-700">{row.rejectedCount}</td>
                  <td className="px-4 py-3 text-sm text-amber-700">{row.reworkCount}</td>
                  <td className="px-4 py-3 text-sm text-blue-700">{row.pendingCount}</td>
                  <td className="px-4 py-3 text-sm">{row.lastAction}</td>
                  <td className="px-4 py-3 text-sm">{row.lastUpdated ? new Date(row.lastUpdated).toLocaleString() : '-'}</td>
                  {/* <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        to={`/app/employee/traceability/${row.code}`}
                      >
                        History
                      </Link>
                      <Link
                        className="rounded-lg bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                        to={`/app/employee/traceability/${row.code}`}
                      >
                        Responses
                      </Link>
                      <Link
                        className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        to={`/app/employee/traceability/${row.code}`}
                      >
                        Timeline
                      </Link>
                    </div>
                  </td> */}
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                    No scan logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                {['Date & Time', 'Code', 'Product Name', 'Stage', 'Previous Accepted', 'Accepted', 'Total Accepted', 'Rejected', 'Rework', 'Result', 'Remarks'].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {details.map((row) => (
                <tr key={row._id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 text-sm">{new Date(row.submittedAt || row.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{row.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.productName || row.code}</td>
                  <td className="px-4 py-3 text-sm">{row.stageName || `Stage ${row.stageNumber}`}</td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-700">{Number(row.previousAcceptedCount || 0)}</td>
                  <td className="px-4 py-3 text-sm text-emerald-700">{Number(row.acceptedCount || 0)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-emerald-700">
                    {Number(row.previousAcceptedCount || 0) + Number(row.acceptedCount || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-700">{Number(row.rejectedCount || 0)}</td>
                  <td className="px-4 py-3 text-sm text-amber-700">{Number(row.reworkCount || 0)}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${
                    row.inspectionResult === 'ACCEPTED'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : row.inspectionResult === 'REJECTED'
                        ? 'text-red-700 dark:text-red-400'
                        : row.inspectionResult === 'REWORK'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-slate-600 dark:text-slate-300'
                  }`}>{row.inspectionResult || '-'}</td>
                  <td className="max-w-sm px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.remarks || '-'}</td>
                </tr>
              ))}
              {details.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">No detailed inspection logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ScanLogsPage;
