const InspectionStatCard = ({ label, value, tone = 'slate', helper }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className={`mb-3 inline-flex rounded-lg px-2 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>
        {label}
      </div>
      <p className="text-3xl font-semibold text-slate-900 dark:text-white">{value ?? 0}</p>
      {helper && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helper}</p>}
    </div>
  );
};

export default InspectionStatCard;
