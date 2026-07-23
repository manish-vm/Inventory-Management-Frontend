import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { api, manufacturingConfigAPI } from '../api/api';
import EmployeeReviewRenderer from '../components/productReview/EmployeeReviewRenderer';
import RejectionQuestionBuilder from '../components/productReview/RejectionQuestionBuilder';
import ReviewAnalyticsCard from '../components/productReview/ReviewAnalyticsCard';
import ReviewRoutingSection from '../components/productReview/ReviewRoutingSection';
import {
  helmetD1DrrReport,
  helmetD1RejectionReport,
  helmetD2RejectionReport,
  helmetD3RejectionReport,
  helmetD4RejectionReport
} from '../data/helmetWorkbookReportData';
import {
  helmetD2DrrReport,
  helmetD3DrrReport,
  helmetD4DrrReport
} from '../data/correctedHelmetDrrData';
import { visorMouldingReports } from '../data/visorMouldingReportData';
import {
  shellMouldingReports,
  visorCoatingReports,
  visorMechanismTopMouldingReports
} from '../data/additionalMouldingReportData';
import {
  bopReports,
  chinCoverReports,
  spoilerReports,
  stagewiseReports
} from '../data/latestWorkbookReportData';

const defaultConfig = {
  acceptedRouteStage: '',
  okQuestionnaireEnabled: false,
  okQuestions: [],
  rejectionQuestionnaireEnabled: false,
  rejectionQuestions: [],
  reworkQuestionnaireEnabled: false,
  reworkQuestions: []
};

const normalizeQuestions = (questions = []) =>
  questions.map((question) => ({
    ...question,
    responseType: question.responseType || 'text',
    options: (question.options || []).map((option) => ({
      optionId: option.optionId || `${option.value || option.label}-${Math.random().toString(36).slice(2, 8)}`,
      label: option.label || option.value || '',
      value: option.value || option.label || '',
      subQuestions: normalizeQuestions(option.subQuestions || [])
    }))
  }));

const toKey = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const lineFromValue = (...values) => {
  const text = values.join(' ').toLowerCase();
  const match = text.match(/\bd\s*([1-4])\b/);
  return match ? Number(match[1]) : null;
};

const reportTypeFromValue = (...values) => {
  const text = values.join(' ').toLowerCase();
  if (text.includes('helmet') && text.includes('drr')) return 'helmet-assembly';
  if (text.includes('visor') && text.includes('coating')) return 'visor-coating';
  if (text.includes('visor') && (text.includes('mechanism') || text.includes('vm top') || text.includes('visor top'))) {
    return 'visor-mechanism-top-moulding';
  }
  if (text.includes('visor') && (text.includes('mould') || text.includes('mold'))) return 'visor-moulding';
  if (text.includes('shell') && (text.includes('mould') || text.includes('mold'))) return 'shell-moulding';
  if (text.includes('chin cover')) return 'chin-cover-moulding';
  if (text.includes('spoiler')) return 'spoiler-moulding';
  if (text.includes('stagewise')) return 'stagewise-rejection';
  if (text.includes('bop') || text.includes('inward')) return 'bop-parts-receipt';
  if (/\bdrr\b/.test(text)) return 'helmet-assembly';
  if (text.includes('assembly') || text.includes('assy')) return 'helmet-assembly';
  return '';
};

const reportRowsByContext = ({ productionLine, reportType }) => {
  const line = Number(String(productionLine || '').replace(/\D/g, '')) || null;
  const byLine = (reports) => reports.find((report) => Number(report.line) === line)?.rows || [];
  if (reportType === 'helmet-assembly') {
    return line === 1
      ? [...(helmetD1DrrReport.rows || []), ...(helmetD1RejectionReport.rows || [])]
      : line === 2
      ? [...(helmetD2DrrReport.rows || []), ...(helmetD2RejectionReport.rows || [])]
      : line === 3
      ? [...(helmetD3DrrReport.rows || []), ...(helmetD3RejectionReport.rows || [])]
      : line === 4
      ? [...(helmetD4DrrReport.rows || []), ...(helmetD4RejectionReport.rows || [])]
      : [];
  }
  if (reportType === 'visor-moulding') return byLine(visorMouldingReports);
  if (reportType === 'visor-mechanism-top-moulding') return byLine(visorMechanismTopMouldingReports);
  if (reportType === 'visor-coating') return byLine(visorCoatingReports);
  if (reportType === 'shell-moulding') return byLine(shellMouldingReports);
  if (reportType === 'stagewise-rejection') return byLine(stagewiseReports);
  if (reportType === 'chin-cover-moulding') return byLine(chinCoverReports);
  if (reportType === 'spoiler-moulding') return byLine(spoilerReports);
  if (reportType === 'bop-parts-receipt') return byLine(bopReports);
  return [];
};

const groupedProcessDefects = (rows = []) => {
  const groups = new Map();
  let currentProcess = '';
  let currentPart = '';

  rows.forEach((row) => {
    if (row.assemblyProcess || row.defectGroup) currentProcess = String(row.assemblyProcess || row.defectGroup).trim();
    if (row.partDetails) currentPart = String(row.partDetails).trim();
    const process = currentProcess || 'Unspecified';
    const partDetails = currentPart;
    const defectType = String(row.defectDetails || row.rejectionDetails || row.partDetails || currentPart || '').trim();
    if (!defectType) return;
    if (!groups.has(process)) groups.set(process, new Map());
    if (!groups.get(process).has(defectType)) {
      groups.get(process).set(defectType, { defectType, partDetails });
    }
  });

  return Array.from(groups.entries()).map(([assemblyProcess, defects]) => ({
    assemblyProcess,
    defects: Array.from(defects.values())
  }));
};

const ProductReviewConfig = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const modeFromParam = params.configurationMode;
  const configurationMode = modeFromParam === 'finalStages' || location.state?.configurationMode === 'finalStages' ? 'finalStages' : 'stages';
  const stageKey = params.stageId || params.stageNumber;
  const currentStageNumber = Number(params.stageNumber || location.state?.stage?.stageNumber || stageKey || 1);
  const productReviewKey = location.state?.configId
    ? `${location.state.configId}-${configurationMode}-${currentStageNumber}`
    : `${location.state?.productName || location.state?.code || location.state?.code || 'stage'}-${configurationMode}-${currentStageNumber}`;
  const code = location.state?.code || location.state?.code || location.state?.productId || '';
  const productName = location.state?.productName || location.state?.productDescription || location.state?.code || location.state?.code || 'Selected Product';

  const [config, setConfig] = useState(defaultConfig);
  const [analytics, setAnalytics] = useState(null);
  const [stages, setStages] = useState(location.state?.stages || []);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [reworkPreviewAnswers, setReworkPreviewAnswers] = useState({});
  const [showRejectionBuilder, setShowRejectionBuilder] = useState(false);
  const [showReworkBuilder, setShowReworkBuilder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingQuestionnaire, setSavingQuestionnaire] = useState('');
  const [savedRejectionSnapshot, setSavedRejectionSnapshot] = useState(null);
  const [savedReworkSnapshot, setSavedReworkSnapshot] = useState(null);

  const currentStage = useMemo(
    () =>
      stages.find((stage) => Number(stage.stageNumber) === currentStageNumber) ||
      location.state?.stage || { stageNumber: currentStageNumber, stageName: `Stage ${currentStageNumber}` },
    [currentStageNumber, location.state?.stage, stages]
  );

  const rejectionOptionGroups = useMemo(() => {
    const inferredReportType = currentStage.reportType || reportTypeFromValue(productName, currentStage.stageName);
    const rows = reportRowsByContext({
      productionLine: currentStage.productionLine || `D${lineFromValue(productName, currentStage.stageName) || ''}`,
      reportType: inferredReportType
    });
    return groupedProcessDefects(rows);
  }, [currentStage.productionLine, currentStage.reportType, currentStage.stageName, productName]);

  const applyReportOptionsToRejectionQuestions = (questions = []) =>
    normalizeQuestions(questions).map((question) => {
      if (!rejectionOptionGroups.length) return question;
      const questionId = question.questionId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return {
        ...question,
        questionId,
        responseType: 'checkbox',
        optionsLocked: true,
        optionsSource: 'dashboard-report-sheet',
        options: rejectionOptionGroups.map((group) => {
          const processKey = toKey(group.assemblyProcess);
          return {
            optionId: `${questionId}-${processKey}`,
            label: group.assemblyProcess,
            value: group.assemblyProcess,
            assemblyProcess: group.assemblyProcess,
            optionsLocked: true,
            subQuestions: [
              {
                questionId: `${questionId}-${processKey}-defects`,
                questionText: `${group.assemblyProcess} defect type`,
                responseType: 'checkbox',
                assemblyProcess: group.assemblyProcess,
                optionsLocked: true,
                optionsSource: 'dashboard-report-sheet',
                options: group.defects.map((defect) => ({
                  optionId: `${questionId}-${processKey}-${toKey(defect.defectType)}`,
                  label: defect.defectType,
                  value: defect.defectType,
                  assemblyProcess: group.assemblyProcess,
                  partDetails: defect.partDetails,
                  defectType: defect.defectType,
                  subQuestions: []
                }))
              }
            ]
          };
        })
      };
    });

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      await fetchConfig();
      await Promise.all([fetchAnalytics(), fetchStages()]);
      setLoading(false);
    };

    fetchPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageKey]);

  useEffect(() => {
    if (!rejectionOptionGroups.length || !config.rejectionQuestions.length) return;
    setConfig((prev) => ({
      ...prev,
      rejectionQuestions: applyReportOptionsToRejectionQuestions(prev.rejectionQuestions)
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rejectionOptionGroups.length]);

  const fetchConfig = async () => {
    try {
      const response = await api.get(`/stage-review-config/${encodeURIComponent(productReviewKey)}`);
      const data = response.data?.data || response.data;
      if (data) {
        const isFinalMode = configurationMode === 'finalStages';
        setConfig((prev) => ({
          ...defaultConfig,
          ...prev,
          ...data,
          okQuestionnaireEnabled: isFinalMode
            ? Boolean(data.okQuestionnaireEnabled && data.okQuestions?.length)
            : Boolean(data.okQuestionnaireEnabled || data.okQuestions?.length),
          okQuestions: normalizeQuestions(data.okQuestions || []),
          rejectionQuestionnaireEnabled: isFinalMode
            ? Boolean(data.rejectionQuestionnaireEnabled && data.rejectionQuestions?.length)
            : Boolean(data.rejectionQuestionnaireEnabled || data.rejectionQuestions?.length),
          rejectionQuestions: isFinalMode
            ? normalizeQuestions(data.rejectionQuestions || [])
            : applyReportOptionsToRejectionQuestions(data.rejectionQuestions || []),
          reworkQuestionnaireEnabled: Boolean(data.reworkQuestionnaireEnabled || data.reworkQuestions?.length || prev.reworkQuestions?.length),
          reworkQuestions: normalizeQuestions(data.reworkQuestions?.length ? data.reworkQuestions : prev.reworkQuestions || [])
        }));
      }
    } catch (error) {
      setConfig((prev) => ({
        ...defaultConfig,
        ...prev
      }));
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/stage-review-config/analytics/${encodeURIComponent(productReviewKey)}`, {
        params: code ? { code: code } : undefined
      });
      // Expected payload from backend: { accepted, rejected, rework, pending, totalItems }
      // Backend parameter is still named code for compatibility, but the value is Code.

      setAnalytics(response.data?.data || response.data);
    } catch (error) {
      setAnalytics({ accepted: 0, rejected: 0, rework: 0 });
    }
  };

  const fetchStages = async () => {
    if (location.state?.stage && location.state?.workflowType) {
      const count = Number.parseInt(location.state.workflowType, 10);
      if (Number.isFinite(count) && count > 0) {
        setStages((prev) =>
          prev.length
            ? prev
            : Array.from({ length: count }, (_, index) => ({
                stageNumber: index + 1,
                stageName: index + 1 === location.state.stage.stageNumber ? location.state.stage.stageName : `Stage ${index + 1}`
              }))
        );
      }
    }

    try {
      const response = await manufacturingConfigAPI.getAll();
      const configs = response.data || [];
      const matched =
        configs.find((item) => item._id === location.state?.configId) ||
        configs.find((item) => item.productName === location.state?.productName);
      const selectedStages = configurationMode === 'finalStages' ? (matched?.finalStages || []) : (matched?.stages || []);
      if (selectedStages.length) {
        setStages(selectedStages);
        const matchedStage = selectedStages.find((stage) => Number(stage.stageNumber) === currentStageNumber);
        const savedQuestions = matchedStage?.reviewForm?.questions || [];
        const savedOkQuestions = matchedStage?.reviewForm?.okForm?.questions || [];
        const savedRejectionQuestions = matchedStage?.reviewForm?.rejectionForm?.questions || [];
        const savedReworkQuestions = matchedStage?.reviewForm?.reworkForm?.questions || [];
        const hasFinalQuestions = savedOkQuestions.length > 0 || savedRejectionQuestions.length > 0;
        const hasStandardQuestions = savedQuestions.length > 0 || savedRejectionQuestions.length > 0 || savedReworkQuestions.length > 0;
        if ((configurationMode === 'finalStages' && hasFinalQuestions) || (configurationMode !== 'finalStages' && hasStandardQuestions)) {
          setConfig((prev) => ({
            ...prev,
            okQuestionnaireEnabled: Boolean(savedOkQuestions.length),
            okQuestions: normalizeQuestions(savedOkQuestions),
            rejectionQuestionnaireEnabled: configurationMode === 'finalStages'
              ? Boolean(savedRejectionQuestions.length)
              : Boolean(savedRejectionQuestions.length || savedQuestions.length),
            rejectionQuestions: configurationMode === 'finalStages'
              ? normalizeQuestions(savedRejectionQuestions)
              : applyReportOptionsToRejectionQuestions(savedRejectionQuestions.length ? savedRejectionQuestions : savedQuestions),
            reworkQuestionnaireEnabled: Boolean(savedReworkQuestions.length),
            reworkQuestions: normalizeQuestions(savedReworkQuestions)
          }));
          setSavedRejectionSnapshot(JSON.stringify(configurationMode === 'finalStages' ? normalizeQuestions(savedRejectionQuestions) : applyReportOptionsToRejectionQuestions(savedRejectionQuestions.length ? savedRejectionQuestions : savedQuestions)));
          setSavedReworkSnapshot(JSON.stringify(normalizeQuestions(savedReworkQuestions)));
        }
      }
    } catch (error) {
      if (!stages.length) {
        setStages([
          { stageNumber: currentStageNumber, stageName: `Stage ${currentStageNumber}` },
          { stageNumber: currentStageNumber + 1, stageName: `Stage ${currentStageNumber + 1}` }
        ]);
      }
    }
  };

  const persistConfig = async (successMessage = 'Product review configuration saved') => {
    try {
      await api.post(`/stage-review-config/${encodeURIComponent(productReviewKey)}`, config);
    if (location.state?.configId) {
        const nextStages = stages.map((stage) =>
          Number(stage.stageNumber) === currentStageNumber
          ? {
              ...stage,
              reviewForm: {
                formId: `stage-${stage.stageNumber}-admin`,
                formName: `${stage.stageName} Inspection Form`,
                questions: stage.reviewForm?.questions || [],
                rejectionForm: {
                  formId: `stage-${stage.stageNumber}-rejection-admin`,
                  formName: configurationMode === 'finalStages' ? `${stage.stageName} Not OK Form` : `${stage.stageName} Rejection Analysis Form`,
                  questions: config.rejectionQuestions || []
                },
                reworkForm: {
                    formId: `stage-${stage.stageNumber}-rework-admin`,
                    formName: `${stage.stageName} Rework Analysis Form`,
                    questions: config.reworkQuestions || []
                  }
                }
              }
            : {
                stageNumber: stage.stageNumber,
                reviewForm: stage.reviewForm || { questions: [] }
              }
        );

        await manufacturingConfigAPI.saveReviewForms(location.state.configId, {
          target: configurationMode,
          stages: nextStages
        });
      }
      toast.success(successMessage);
      setSavedRejectionSnapshot(JSON.stringify(config.rejectionQuestions));
      setSavedReworkSnapshot(JSON.stringify(config.reworkQuestions));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product review configuration');
      throw error;
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await persistConfig();
    } finally {
      setSaving(false);
    }
  };

  const saveQuestionnaire = async (type) => {
    setSavingQuestionnaire(type);
    try {
      const messageMap = {
        ok: 'OK questionnaire saved',
        rejection: configurationMode === 'finalStages' ? 'Not OK questionnaire saved' : 'Rejection questionnaire saved',
        rework: 'Rework questionnaire saved'
      };
      await persistConfig(messageMap[type] || 'Questionnaire saved');
    } finally {
      setSavingQuestionnaire('');
    }
  };

  const cloneQuestionsForPairedQuestionnaire = (questions = []) =>
    normalizeQuestions(JSON.parse(JSON.stringify(questions || [])));

  const copyQuestionnaireToPairedType = (sourceType) => {
    setConfig((prev) => {
      if (sourceType === 'rejection') {
        return {
          ...prev,
          reworkQuestionnaireEnabled: true,
          reworkQuestions: cloneQuestionsForPairedQuestionnaire(prev.rejectionQuestions)
        };
      }

      return {
        ...prev,
        rejectionQuestionnaireEnabled: true,
        rejectionQuestions: cloneQuestionsForPairedQuestionnaire(prev.reworkQuestions)
      };
    });

    if (sourceType === 'rejection') {
      setShowReworkBuilder(true);
      toast.success('Rejection questionnaire copied to Rework');
    } else {
      setShowRejectionBuilder(true);
      toast.success('Rework questionnaire copied to Rejection');
    }
  };

  const enableQuestionnaire = () => {
    setConfig((prev) => ({
      ...prev,
      rejectionQuestionnaireEnabled: true
    }));
    setShowRejectionBuilder(true);
  };

  const enableReworkQuestionnaire = () => {
    setConfig((prev) => ({
      ...prev,
      reworkQuestionnaireEnabled: true
    }));
    setShowReworkBuilder(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/app/manufacturing-config')}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Manufacturing Config
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Review Setup</h1><br></br>
            <p className="text-slate-600 font-bold  dark:text-slate-400">
              {productName} - {currentStage.stageName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {configurationMode === 'finalStages'
                ? 'Configure Not OK questionnaire and routing for this final stage.'
                : 'Configure inspection, rejection, and rework questionnaires for this product stage.'}
            </p>
          </div>
          <button
            type="button"
            onClick={saveConfig}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        <ReviewAnalyticsCard analytics={analytics} configurationMode={configurationMode} />

        <div className="space-y-6">
          <ReviewRoutingSection
            config={config}
            setConfig={setConfig}
            currentStage={currentStage}
            stages={stages}
            configurationMode={configurationMode}
            onCreateQuestionnaire={enableQuestionnaire}
            onCreateReworkQuestionnaire={enableReworkQuestionnaire}
          />

          <RejectionQuestionBuilder
            enabled={showRejectionBuilder}
            onEnable={enableQuestionnaire}
            questions={config.rejectionQuestions}
            setQuestions={(questions) =>
              setConfig((prev) => ({
                ...prev,
                rejectionQuestionnaireEnabled: true,
                rejectionQuestions: configurationMode === 'finalStages' ? questions : applyReportOptionsToRejectionQuestions(questions)
              }))
            }
            autoOptionGroups={configurationMode === 'finalStages' ? [] : rejectionOptionGroups}
            onSave={() => saveQuestionnaire('rejection')}
            saving={savingQuestionnaire === 'rejection'}
            canSave={JSON.stringify(config.rejectionQuestions) !== savedRejectionSnapshot}
            title={configurationMode === 'finalStages' ? 'Not OK Questionnaire Builder' : 'Rejection Questionnaire Builder'}
            emptyMessage={configurationMode === 'finalStages' ? 'No Not OK questions configured yet.' : 'No rejection questions configured yet.'}
            saveLabel={configurationMode === 'finalStages' ? 'Save Not OK Questionnaire' : 'Save Rejection Questionnaire'}
            onCopy={configurationMode === 'finalStages' ? undefined : () => copyQuestionnaireToPairedType('rejection')}
            copyLabel={configurationMode === 'finalStages' ? '' : 'Copy to Rework'}
          />

          {configurationMode !== 'finalStages' && (
          <RejectionQuestionBuilder
            enabled={showReworkBuilder}
            onEnable={enableReworkQuestionnaire}
            questions={config.reworkQuestions}
            setQuestions={(questions) =>
              setConfig((prev) => ({
                ...prev,
                reworkQuestionnaireEnabled: true,
                reworkQuestions: questions
              }))
            }
            title={configurationMode === 'finalStages' ? 'Not OK Questionnaire Builder' : 'Rework Questionnaire Builder'}
            emptyMessage="No rework questions configured yet."
            onSave={() => saveQuestionnaire('rework')}
            saving={savingQuestionnaire === 'rework'}
            canSave={JSON.stringify(config.reworkQuestions) !== savedReworkSnapshot}
            saveLabel={configurationMode === 'finalStages' ? 'Save Not OK Questionnaire' : 'Save Rework Questionnaire'}
            onCopy={configurationMode === 'finalStages' ? undefined : () => copyQuestionnaireToPairedType('rework')}
            copyLabel={configurationMode === 'finalStages' ? '' : 'Copy to Reject'}
          />
          )}

          {config.rejectionQuestionnaireEnabled && config.rejectionQuestions.length > 0 && (
            <section className="rounded-lg border border-red-200 bg-red-50/60 p-5 dark:border-red-900 dark:bg-red-900/10">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {configurationMode === 'finalStages' ? 'Not OK Shop Floor Preview' : 'Rejection Shop Floor Preview'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Conditional sub-questions expand here as {configurationMode === 'finalStages' ? 'not OK' : 'rejection'} answers are selected.
                </p>
              </div>
              <EmployeeReviewRenderer
                questions={config.rejectionQuestions}
                answers={previewAnswers}
                setAnswers={setPreviewAnswers}
              />
            </section>
          )}

          {configurationMode !== 'finalStages' && config.reworkQuestionnaireEnabled && config.reworkQuestions.length > 0 && (
            <section className="rounded-lg border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900 dark:bg-amber-900/10">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Rework Shop Floor Preview</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Conditional sub-questions expand here as rework answers are selected.
                </p>
              </div>
              <EmployeeReviewRenderer
                questions={config.reworkQuestions}
                answers={reworkPreviewAnswers}
                setAnswers={setReworkPreviewAnswers}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewConfig;
