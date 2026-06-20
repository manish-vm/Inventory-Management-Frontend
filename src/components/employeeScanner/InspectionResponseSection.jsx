import { CheckCircle2, RotateCcw, Send, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import QuestionCountGrid from '../employeeScanner/QuestionCountGrid';

const fields = [
  { key: 'accepted', label: 'Accepted Items', icon: CheckCircle2, tone: 'emerald' },
  { key: 'rejected', label: 'Rejected Items', icon: XCircle, tone: 'red' },
  { key: 'rework', label: 'Rework Items', icon: RotateCcw, tone: 'amber' }
];

const toneClasses = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300',
  red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300'
};

const InspectionResponseSection = ({
  counts,
  setCounts,
  availableCount,
  unlimitedQuantity = false,
  totalEntered,
  quantityError,
  remarks,
  setRemarks,
  onSubmit,
  submitting,
  derivedTotals,
  selectedInspectionType,
  setSelectedInspectionType,
  rejectionForms = [],
  reworkForms = [],
  rejectDefectDetails = [],
  reworkDefectDetails = [],
  valuesWrapperRejection = {},
  valuesWrapperRework = {},
  onChangeRejection,
  onChangeRework
}) => {
  const [activeMode, setActiveMode] = useState(null); // 'accepted' | 'rejected' | 'rework'

  const rejectedDerived = Number(derivedTotals?.rejected || 0);
  const reworkDerived = Number(derivedTotals?.rework || 0);

  // Required debug logs
  useEffect(() => {
    console.log('Rejection Form', rejectionForms);
    console.log('Rework Form', reworkForms);
  }, [rejectionForms, reworkForms]);


  useEffect(() => {
    if (!activeMode) return;
    if (Number(counts?.[activeMode] || 0) === 0) setActiveMode(null);
  }, [counts, activeMode]);

  const activeInputValue = useMemo(() => {
    if (!activeMode) return '';
    return counts?.[activeMode] ?? 0;
  }, [activeMode, counts]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quantity Breakdown</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {fields.map((field) => {
          const Icon = field.icon;
          const value = Number(counts?.[field.key] || 0);
          const derivedLabel = field.key === 'rejected' ? rejectedDerived : field.key === 'rework' ? reworkDerived : value;
          const active = activeMode === field.key;

          return (
            <button
              key={field.key}
              type="button"
              onClick={() => {
                const nextMode = activeMode === field.key ? null : field.key;
                setActiveMode(nextMode);
                if (field.key === 'accepted') {
                  setSelectedInspectionType(null);
                  setCounts((prev) => {
                    const next = { ...prev };
                    const current = Number(next[field.key] || 0);
                    if (current <= 0) next[field.key] = 1;
                    return next;
                  });
                } else if (field.key === 'rejected') {
                  setSelectedInspectionType('rejected');
                } else if (field.key === 'rework') {
                  setSelectedInspectionType('rework');
                }
              }}
              className={`rounded-lg border p-4 text-left transition ${toneClasses[field.tone]} ${
                active ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : 'hover:opacity-95'
              }`}
            >
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-5 w-5" />
                {field.label}
              </span>

              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
{derivedLabel > 0 ? `${derivedLabel} selected` : 'Tap to enter'}
              </div>
            </button>
          );
        })}
      </div>

      {selectedInspectionType === 'rejected' && (
          <div className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300 mt-4 p-4 rounded-lg">
          <h3 className="mb-2 text-sm font-semibold text-red-700 dark:text-red-300">Rejected reasons</h3>

          {rejectionForms && rejectionForms.length > 0 ? (
            <div className="space-y-4">
              <QuestionCountGrid
                forms={rejectionForms}
                values={valuesWrapperRejection}
                onChange={onChangeRejection}
                defectDetails={rejectDefectDetails}
              />
            </div>
          ) : (

            <div className="rounded-md border border-dashed border-red-300 bg-red-50/30 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              No rejection form configured for this stage.
            </div>
          )}


        </div>
      )}

      {selectedInspectionType === 'rework' && (
        <div className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300 mt-4 p-4 rounded-lg">
          <h3 className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-300">Rework reasons</h3>

          {reworkForms && reworkForms.length > 0 ? (
            <div className="space-y-4">
              <QuestionCountGrid
                forms={reworkForms}
                values={valuesWrapperRework}
                onChange={onChangeRework}
                defectDetails={reworkDefectDetails}
              />
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-amber-300 bg-amber-50/30 p-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-200">
              No rework form configured for this stage.
            </div>
          )}
        </div>
      )}


      {activeMode === 'accepted' && (
        <div className="border-emerald-200 bg-emerald-100 text-emerald-500 dark:border-emerald-900 dark:bg-emerald-800/20 dark:text-emerald-300 mt-5 p-4 rounded-lg">
          <div className="mb-2 text-sm font-semibold  dark:text-green-500">Accepted quantity</div>
          <input
            type="number"
            min="0"
            value={Number(activeInputValue || 0)}
            onChange={(e) =>
              setCounts((prev) => ({
                ...prev,
                accepted: Math.max(0, Number(e.target.value) || 0)
              }))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
          />
        </div>
      )}

      {quantityError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {quantityError}
        </div>
      )}

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Remarks <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter inspection remarks..."
          rows={4}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          if (!submitting) onSubmit();
        }}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 font-medium text-white hover:bg-sky-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" />
        {submitting ? 'Submitting...' : 'Submit Inspection'}
      </button>
    </section>
  );
};

export default InspectionResponseSection;
