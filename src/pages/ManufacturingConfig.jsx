import { useEffect, useState } from 'react';
import { ArrowRight, Edit, Plus, PlusCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { manufacturingConfigAPI, processingStageAPI, productMasterAPI } from '../api/api';

import toast from 'react-hot-toast';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const getWorkflowType = (stages = []) => `${Math.max(stages.length, 1)}-step`;

const renumberStages = (stages = []) =>
  stages.map((stage, index) => ({
    stageNumber: index + 1,
    stageName: /^Stage \d+$/.test(stage.stageName || '') ? `Stage ${index + 1}` : stage.stageName,
    stageType: index === 0 ? 'manufacturing' : stage.stageType || 'processing',
    description: stage.description,
    requiresValidation: Boolean(stage.requiresValidation)
  }));

const ManufacturingConfig = () => {
  const navigate = useNavigate();

  const [configs, setConfigs] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productName: '',
    workflowType: '1-step',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Manufacturing',
        stageType: 'manufacturing',
        requiresValidation: false
      }
    ]
  });

  useEffect(() => {
    const nextWorkflowType = getWorkflowType(formData.stages);
    if (formData.workflowType !== nextWorkflowType) {
      setFormData((prev) => ({ ...prev, workflowType: nextWorkflowType }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.stages]);

  useEffect(() => {
    fetchConfigs();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (configs.length > 0) {
      fetchReviewStats(configs, products);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs, products]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await manufacturingConfigAPI.getAll();
      setConfigs(response.data);
    } catch (error) {
      toast.error('Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  };

  const resolveProductPartNo = (productName) => {
    const product = products.find((item) => item.productName === productName);
    return product?.partNo || product?.productCode || productName;
  };

  const fetchReviewStats = async (nextConfigs = configs, nextProducts = products) => {
    const productLookup = new Map(nextProducts.map((product) => [product.productName, product]));
    const entries = await Promise.all(
      (nextConfigs || []).map(async (config) => {
        const product = productLookup.get(config.productName);
        const partNo = product?.partNo || product?.productCode || config.productName;
        const stageNumber = config.stages?.[0]?.stageNumber || 1;

        try {
          const response = await processingStageAPI.getStageReviewStats(stageNumber, { partNo });
          return [config._id, response.data];
        } catch (error) {
          return [
            config._id,
            {
              totalItems: 0,
              accepted: 0,
              rejected: 0,
              rework: 0,
              pending: 0
            }
          ];
        }
      })
    );

    setReviewStats(Object.fromEntries(entries));
  };

  const fetchProducts = async () => {
    try {
      const response = await productMasterAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const handleProductChange = (productName) => {
    setFormData((prev) => ({ ...prev, productName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productName: formData.productName,
        workflowType: getWorkflowType(formData.stages),
        stages: renumberStages(formData.stages)
      };

      if (editingConfig) {
        await manufacturingConfigAPI.update(editingConfig._id, payload);
        toast.success('Configuration updated successfully');
      } else {
        await manufacturingConfigAPI.create(payload);
        toast.success('Configuration created successfully');
      }

      setShowForm(false);
      setEditingConfig(null);
      fetchConfigs();
    } catch (error) {
      const message =
        error.response?.data?.message || error.response?.data?.error || 'Failed to save configuration';
      toast.error(message);
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      productName: config.productName,
      workflowType: config.workflowType,
      stages: renumberStages(config.stages)
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;

    try {
      await manufacturingConfigAPI.delete(id);
      toast.success('Configuration deleted successfully');
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to delete configuration');
    }
  };

  const insertStageAfter = (stageNumber) => {
    if (formData.stages.length >= 10) return;

    const nextStages = [];
    formData.stages.forEach((stage) => {
      nextStages.push(stage);
      if (stage.stageNumber === stageNumber) {
        nextStages.push({
          stageNumber: stageNumber + 1,
          stageName: `Stage ${stageNumber + 1}`,
          stageType: 'processing',
          requiresValidation: false
        });
      }
    });

    const normalizedStages = renumberStages(nextStages);
    setFormData((prev) => ({
      ...prev,
      workflowType: getWorkflowType(normalizedStages),
      stages: normalizedStages
    }));
  };

  const removeStage = (stageNumber) => {
    if (stageNumber === 1 || formData.stages.length <= 1) return;

    const normalizedStages = renumberStages(formData.stages.filter((s) => s.stageNumber !== stageNumber));

    setFormData((prev) => ({
      ...prev,
      workflowType: getWorkflowType(normalizedStages),
      stages: normalizedStages
    }));
  };

  const openQuestionnaireReview = (config, stage) => {
    if (!stage?.stageNumber) return;

    navigate(`/app/manufacturing-config/stages/${stage.stageNumber}/product-review`, {
      state: {
        configId: config?._id,
        productName: config?.productName,
        partNo: resolveProductPartNo(config?.productName),
        workflowType: config?.workflowType,
        stage,
        stages: config?.stages || []
      }
    });
  };

  const renderStageFlow = (config) => (
    <div className="flex flex-wrap items-center gap-2 max-w-full">
      {config.stages.map((stage, index) => (
        <div key={stage.stageNumber} className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => openQuestionnaireReview(config, stage)}
            className={
              '\n              max-w-48 truncate\n              px-3 py-2\n              bg-indigo-100\n              text-indigo-700\n              rounded-lg\n              text-sm\n              hover:bg-indigo-200\n              transition-colors\n              font-medium\n            '
            }
            title={`Configure Product Review for ${stage.stageName}`}
          >
            {stage.stageName}
          </button>

          {index < config.stages.length - 1 && (
            <ArrowRight
              className={
                '\n              w-4 h-4\n              shrink-0\n              text-slate-400\n            '
              }
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStats = (config) => {
    const stats = reviewStats[config._id] || {};
    const items = [
      ['Total', stats.totalItems ?? stats.total ?? 0, 'text-slate-900 dark:text-white'],
      ['Accepted', stats.accepted ?? stats.acceptedCount ?? 0, 'text-emerald-700 dark:text-emerald-300'],
      ['Rejected', stats.rejected ?? stats.rejectedCount ?? 0, 'text-red-700 dark:text-red-300'],
      ['Rework', stats.rework ?? stats.reworkCount ?? 0, 'text-amber-700 dark:text-amber-300'],
      ['Pending', stats.pending ?? stats.pendingCount ?? 0, 'text-blue-700 dark:text-blue-300']
    ];

    return (
      <div className="grid grid-cols-5 gap-2">
        {items.map(([label, value, color]) => (
          <div key={label} className="rounded-lg bg-slate-50 px-2 py-2 text-center dark:bg-slate-700">
            <p className={`text-base font-semibold ${color}`}>{value}</p>
            <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing Configuration</h1>
            <p className="text-slate-600 dark:text-slate-400">Configure product workflows (stage 1 is direct)</p>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setEditingConfig(null);
              setFormData({
                productName: '',
                workflowType: '1-step',
                stages: [
                  {
                    stageNumber: 1,
                    stageName: 'Manufacturing',
                    stageType: 'manufacturing',
                    requiresValidation: false
                  }
                ]
              });
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Configuration
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] table-fixed">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="w-[24%] px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Product Name
                  </th>
                  <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Workflow
                  </th>
                  <th className="w-[36%] px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Stages
                  </th>
                  {/* <th className="w-[28%] px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Stats
                  </th> */}
                  <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : configs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      No configurations found
                    </td>
                  </tr>
                ) : (
                  configs.map((config) => (
                    <tr key={config._id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="truncate" title={config.productName}>
                          {config.productName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            'px-2 py-1 text-xs rounded-full ' +
                            (config.workflowType === '1-step'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700')
                          }
                        >
                          {getWorkflowType(config.stages)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm align-top">{renderStageFlow(config)}</td>
                      {/* <td className="px-6 py-4 text-sm align-top">{renderStats(config)}</td> */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                            type="button"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(config._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {editingConfig ? 'Edit Configuration' : 'Add Configuration'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
                    <select
                      value={formData.productName}
                      onChange={(e) => handleProductChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p.productName}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Workflow Levels *</label>
                    <div className="mt-2">
                      <div className="space-y-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                        {formData.stages.map((stage, index) => (
                          <div key={stage.stageNumber} className="flex min-w-0 items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                              {stage.stageNumber}
                            </div>
                            <input
                              type="text"
                              value={stage.stageName}
                              onChange={(e) => {
                                const nextStages = formData.stages.map((s) =>
                                  s.stageNumber === stage.stageNumber ? { ...s, stageName: e.target.value } : s
                                );
                                setFormData((prev) => ({ ...prev, stages: nextStages }));
                              }}
                              required
                              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                              placeholder={`Stage ${stage.stageNumber} name`}
                            />
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => insertStageAfter(stage.stageNumber)}
                                disabled={formData.stages.length >= 10}
                                className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-primary-900/20"
                                aria-label={`Add stage after stage ${stage.stageNumber}`}
                                title="Add stage after this"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </button>
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeStage(stage.stageNumber)}
                                  className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  aria-label={`Remove stage ${stage.stageNumber}`}
                                  title="Remove this stage"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {formData.stages.length < 10 && (
                          <button
                            type="button"
                            onClick={() => insertStageAfter(formData.stages[formData.stages.length - 1].stageNumber)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-primary-700 dark:hover:bg-primary-900/20"
                            aria-label="Add workflow level"
                            title="Add workflow level"
                          >
                            <PlusCircle className="w-5 h-5" />
                            Add Level
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-2">Stage 1 is fixed (Direct). Use + to add Stage 2..N and enter their names.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stages Preview</label>
                    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                      {formData.stages.map((stage, index) => (
                        <div key={stage.stageNumber} className="flex min-w-0 items-center">
                          <div
                            className="max-w-44 truncate rounded-lg bg-primary-100 px-3 py-1 text-sm text-primary-700"
                            title={stage.stageName}
                          >
                            {stage.stageName}
                          </div>
                          {index < formData.stages.length - 1 && (
                            <ArrowRight className="mx-1 h-4 w-4 shrink-0 text-slate-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-200 p-6 dark:border-slate-700">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturingConfig;
