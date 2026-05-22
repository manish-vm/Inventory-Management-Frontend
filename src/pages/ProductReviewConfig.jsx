import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { api, manufacturingConfigAPI } from '../api/api';
import EmployeeReviewRenderer from '../components/productReview/EmployeeReviewRenderer';
import RejectionQuestionBuilder from '../components/productReview/RejectionQuestionBuilder';
import ReviewAnalyticsCard from '../components/productReview/ReviewAnalyticsCard';
import ReviewRoutingSection from '../components/productReview/ReviewRoutingSection';

const defaultConfig = {
  acceptedRouteStage: '',
  reworkRouteStage: '',
  rejectionQuestionnaireEnabled: false,
  rejectionQuestions: []
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

const ProductReviewConfig = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const stageKey = params.stageId || params.stageNumber;
  const currentStageNumber = Number(params.stageNumber || location.state?.stage?.stageNumber || stageKey || 1);
  const productReviewKey = location.state?.configId
    ? `${location.state.configId}-${currentStageNumber}`
    : `${location.state?.productName || location.state?.partNo || 'stage'}-${currentStageNumber}`;
  const partNo = location.state?.partNo || location.state?.productCode || '';

  const [config, setConfig] = useState(defaultConfig);
  const [analytics, setAnalytics] = useState(null);
  const [stages, setStages] = useState(location.state?.stages || []);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentStage = useMemo(
    () =>
      stages.find((stage) => Number(stage.stageNumber) === currentStageNumber) ||
      location.state?.stage || { stageNumber: currentStageNumber, stageName: `Stage ${currentStageNumber}` },
    [currentStageNumber, location.state?.stage, stages]
  );

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      await Promise.all([fetchConfig(), fetchAnalytics(), fetchStages()]);
      setLoading(false);
    };

    fetchPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageKey]);

  const fetchConfig = async () => {
    try {
      const response = await api.get(`/stage-review-config/${encodeURIComponent(productReviewKey)}`);
      const data = response.data?.data || response.data;
      if (data) {
        setConfig({
          ...defaultConfig,
          ...data,
          rejectionQuestionnaireEnabled: Boolean(data.rejectionQuestionnaireEnabled || data.rejectionQuestions?.length),
          rejectionQuestions: normalizeQuestions(data.rejectionQuestions || [])
        });
      }
    } catch (error) {
      setConfig(defaultConfig);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/stage-review-config/analytics/${encodeURIComponent(productReviewKey)}`, {
        params: partNo ? { partNo } : undefined
      });
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
      if (matched?.stages?.length) {
        setStages(matched.stages);
        const matchedStage = matched.stages.find((stage) => Number(stage.stageNumber) === currentStageNumber);
        const savedQuestions = matchedStage?.reviewForm?.questions || [];
        if (savedQuestions.length > 0) {
          setConfig((prev) => ({
            ...prev,
            rejectionQuestionnaireEnabled: true,
            rejectionQuestions: normalizeQuestions(savedQuestions)
          }));
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

  const saveConfig = async () => {
    setSaving(true);
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
                  questions: config.rejectionQuestions || []
                }
              }
            : {
                stageNumber: stage.stageNumber,
                reviewForm: stage.reviewForm || { questions: [] }
              }
        );

        await manufacturingConfigAPI.saveReviewForms(location.state.configId, {
          stages: nextStages
        });
      }
      toast.success('Product review configuration saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product review configuration');
    } finally {
      setSaving(false);
    }
  };

  const enableQuestionnaire = () => {
    setConfig((prev) => ({
      ...prev,
      rejectionQuestionnaireEnabled: true
    }));
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Review Setup</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Configure outcomes, rejection dependencies, and analytics for {currentStage.stageName}.
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

        <ReviewAnalyticsCard analytics={analytics} />

        <div className="space-y-6">
          <ReviewRoutingSection
            config={config}
            setConfig={setConfig}
            currentStage={currentStage}
            stages={stages}
            onCreateQuestionnaire={enableQuestionnaire}
          />

          <RejectionQuestionBuilder
            enabled={config.rejectionQuestionnaireEnabled}
            onEnable={enableQuestionnaire}
            questions={config.rejectionQuestions}
            setQuestions={(questions) =>
              setConfig((prev) => ({
                ...prev,
                rejectionQuestionnaireEnabled: true,
                rejectionQuestions: questions
              }))
            }
          />

          {config.rejectionQuestionnaireEnabled && config.rejectionQuestions.length > 0 && (
            <section className="rounded-lg border border-slate-200 bg-slate-100 p-5 dark:border-slate-700 dark:bg-slate-950">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Shop Floor Preview</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Conditional sub-questions expand here as rejection answers are selected.
                </p>
              </div>
              <EmployeeReviewRenderer
                questions={config.rejectionQuestions}
                answers={previewAnswers}
                setAnswers={setPreviewAnswers}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewConfig;
