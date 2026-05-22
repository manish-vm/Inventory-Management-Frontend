import { CheckCircle2, RotateCcw, Send, XCircle } from 'lucide-react';

const options = [
  { value: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2, className: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' },
  { value: 'REJECTED', label: 'Rejected', icon: XCircle, className: 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300' },
  { value: 'REWORK', label: 'Rework', icon: RotateCcw, className: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300' }
];

const InspectionResponseSection = ({ status, setStatus, movementType, setMovementType, remarks, setRemarks, onSubmit, submitting, canMoveForward, canMoveBackward }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Inspection Result & Stage Movement</h2>

    <div className="grid gap-4 lg:grid-cols-3">
      {options.map((option) => {
        const Icon = option.icon;
        const selected = status === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatus(option.value)}
            className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${selected ? option.className : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200'}`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-semibold">{option.label}</span>
          </button>
        );
      })}
    </div>

    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Stage Movement</label>
        <select value={movementType} onChange={(e) => setMovementType(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
          <option value="NONE">No movement</option>
          <option value="FORWARD" disabled={!canMoveForward}>Forward / Move To Next Stage</option>
          <option value="BACKWARD" disabled={!canMoveBackward}>Backward / Move To Previous Stage</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Remarks</label>
        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter inspection remarks..." rows={4} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
      </div>
    </div>

    <button type="button" onClick={onSubmit} disabled={submitting} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-medium text-white hover:bg-blue-800 disabled:opacity-60">
      <Send className="h-4 w-4" />
      {submitting ? 'Submitting...' : 'Submit Inspection'}
    </button>
  </section>
);

export default InspectionResponseSection;
