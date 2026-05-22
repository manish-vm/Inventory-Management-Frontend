import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

const ReviewRoutingSection = ({ config, setConfig, currentStage, stages = [], onCreateQuestionnaire }) => {
  const currentStageNumber = Number(currentStage?.stageNumber);
  const subsequentStages = stages.filter((stage) => Number(stage.stageNumber) > currentStageNumber);
  const reworkStages = stages.filter((stage) => Number(stage.stageNumber) <= currentStageNumber);

  const update = (field, value) => setConfig({ ...config, [field]: value });

  const stageLabel = (stage) => stage?.stageName || `Stage ${stage?.stageNumber || ''}`;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Accepted Track</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Move product forward after approval.</p>
          </div>
        </div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          On Acceptance, move product from {stageLabel(currentStage)} to
          <select
            value={config.acceptedRouteStage || ''}
            onChange={(e) => update('acceptedRouteStage', e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select next stage</option>
            {subsequentStages.map((stage) => (
              <option key={stage.stageNumber} value={stage.stageNumber}>
                {stageLabel(stage)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm dark:border-amber-900 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Rework Track</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Route product back for correction.</p>
          </div>
        </div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          On Rework, route product back to
          <select
            value={config.reworkRouteStage || ''}
            onChange={(e) => update('reworkRouteStage', e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select rework stage</option>
            {reworkStages.map((stage) => (
              <option key={stage.stageNumber} value={stage.stageNumber}>
                {stageLabel(stage)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-lg border border-red-200 bg-white p-5 shadow-sm dark:border-red-900 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-100 p-2 text-red-700 dark:bg-red-900/40 dark:text-red-300">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Rejected Track</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Collect structured rejection reasons.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateQuestionnaire}
          className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
        >
          {config.rejectionQuestionnaireEnabled ? 'Edit Rejection Questionnaire' : '+ Create Rejection Questionnaire'}
        </button>
      </section>
    </div>
  );
};

export default ReviewRoutingSection;
