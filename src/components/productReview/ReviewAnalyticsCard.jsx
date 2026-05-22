const COLORS = {
  totalItems: 'bg-slate-500',
  accepted: 'bg-emerald-500',
  rejected: 'bg-red-500',
  rework: 'bg-amber-500',
  pending: 'bg-blue-500'
};

const LABELS = {
  totalItems: 'Total Items',
  accepted: 'Total Products Accepted',
  rejected: 'Total Products Rejected',
  rework: 'Total Products Sent for Rework',
  pending: 'Pending'
};

const ReviewAnalyticsCard = ({ analytics }) => {
  const totals = {
    totalItems: Number(analytics?.totalItems || analytics?.total || 0),
    accepted: Number(analytics?.accepted || 0),
    rejected: Number(analytics?.rejected || 0),
    rework: Number(analytics?.rework || 0),
    pending: Number(analytics?.pending || 0)
  };
  const total = totals.totalItems;
  const percent = (value, key) => (key === 'totalItems' ? 100 : total > 0 ? Math.round((value / total) * 100) : 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Stage Analytics</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Outcome mix for this product review stage.</p>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{total} total reviews</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.keys(totals).map((key) => {
          const value = totals[key];
          const pct = percent(value, key);

          return (
            <div key={key} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/60">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{LABELS[key]}</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-sm font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                  {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={`h-full rounded-full ${COLORS[key]}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewAnalyticsCard;
