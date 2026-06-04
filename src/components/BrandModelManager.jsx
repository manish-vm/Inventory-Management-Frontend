import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, Plus, Edit, Trash2, Loader2, CheckCircle, MinusCircle, Tag, Layers } from 'lucide-react';
import { brandModelAPI } from '../api/api';

const BrandModal = ({ brand, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    isActive: brand?.isActive ?? true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {brand ? 'Edit Brand' : 'New Brand'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              className="rounded"
            />
            Active
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {brand ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModelModal = ({ model, brands, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: model?.name || '',
    brandId: model?.brandId || '',
    isActive: model?.isActive ?? true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {model ? 'Edit Model' : 'New Model'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand *</label>
            <select
              value={formData.brandId}
              onChange={(e) => setFormData((p) => ({ ...p, brandId: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              className="rounded"
            />
            Active
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {model ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BrandModelManager = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('brands'); // 'brands' | 'models'

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]); // flattened: { _id, modelId, name, brandId, brandName, isActive }

  const [editingBrand, setEditingBrand] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const brandIdByName = useMemo(() => {
    const map = new Map();
    for (const b of brands) map.set(b.name?.toLowerCase(), b._id);
    return map;
  }, [brands]);

  const fetchBrands = useCallback(async () => {
    const response = await brandModelAPI.getActiveBrands();
    setBrands(response.data || []);
    return response.data || [];
  }, []);

  const fetchModels = useCallback(async (activeBrands) => {
    const bList = activeBrands || [];
    const results = [];

    for (const brand of bList) {
      const modelsRes = await brandModelAPI.getModelsByBrand(brand._id);
      const list = modelsRes.data || [];
      for (const m of list) {
        results.push({
          _id: `${brand._id}-${m._id}`,
          modelId: m._id,
          name: m.name,
          brandId: brand._id,
          brandName: brand.name,
          isActive: m.isActive,
        });
      }
    }

    setModels(results);
  }, []);

  const refreshAll = useCallback(async () => {
    const activeBrands = await fetchBrands();
    await fetchModels(activeBrands);
  }, [fetchBrands, fetchModels]);

  useEffect(() => {
    refreshAll().catch((e) => {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to load brands/models');
    });
  }, [refreshAll]);

  const handleBrandSave = async (payload) => {
    setLoading(true);
    try {
      if (editingBrand?._id) {
        await brandModelAPI.updateBrand(editingBrand._id, payload);
        toast.success('Brand updated');
      } else {
        await brandModelAPI.createBrand(payload);
        toast.success('Brand created');
      }
      await refreshAll();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSave = async (payload) => {
    setLoading(true);
    try {
      const { name, brandId, isActive } = payload;
      if (!name || !brandId) {
        toast.error('Model name and brand are required');
        return;
      }

      if (editingModel?.modelId) {
        await brandModelAPI.updateModel(editingModel.modelId, { name, brandId, isActive });
        toast.success('Model updated');
      } else {
        // If model exists for brand+name, update it.
        const existing = models.find(
          (m) => m.brandId === brandId && m.name?.toLowerCase() === name.toLowerCase()
        );

        if (existing) {
          await brandModelAPI.updateModel(existing.modelId, { name, brandId, isActive });
        } else {
          await brandModelAPI.createModel(brandId, { name, isActive });
        }

        toast.success('Model saved');
      }

      await refreshAll();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to save model');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    setLoading(true);
    try {
      await brandModelAPI.deleteBrand(brandId);
      toast.success('Brand deleted');
      await refreshAll();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to delete brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (modelId) => {
    setLoading(true);
    try {
      await brandModelAPI.deleteModel(modelId);
      toast.success('Model deleted');
      await refreshAll();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to delete model');
    } finally {
      setLoading(false);
    }
  };

  const activeModelsCount = models.length;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative mx-auto mt-10 w-full max-w-6xl bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Brand & Model Manager</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage brands and their models.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pb-4">
          <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <button
              onClick={() => setCurrentTab('brands')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                currentTab === 'brands'
                  ? 'border-b-2 border-primary-600 text-primary-600 bg-white dark:bg-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Tag className="w-5 h-5" /> Brands ({brands.length})
              </div>
            </button>
            <button
              onClick={() => setCurrentTab('models')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                currentTab === 'models'
                  ? 'border-b-2 border-primary-600 text-primary-600 bg-white dark:bg-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Layers className="w-5 h-5" /> Models ({activeModelsCount})
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-0">
          {currentTab === 'brands' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Entries ({brands.length})</h2>
                <button
                  onClick={() => {
                    setEditingBrand(null);
                    setEditingModel(null);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                >
                  <Plus className="w-5 h-5" /> New
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {brands.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                          No brands loaded yet.
                        </td>
                      </tr>
                    ) : (
                      brands.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">{b.name}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                b.isActive
                                  ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {b.isActive ? <CheckCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                              {b.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingBrand(b);
                                  setEditingModel(null);
                                  setShowModal(true);
                                }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                                disabled={loading}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (!confirm('Are you sure? This may affect products.')) return;
                                  handleDeleteBrand(b._id);
                                }}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
                                disabled={loading}
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
          )}

          {currentTab === 'models' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Entries ({models.length})</h2>
                <button
                  onClick={() => {
                    setEditingModel(null);
                    setEditingBrand(null);
                    setShowModal(true);
                  }}
                  disabled={brands.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    brands.length === 0
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  }`}
                >
                  <Plus className="w-5 h-5" /> New
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Model</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Brand</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {models.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                          No models loaded yet.
                        </td>
                      </tr>
                    ) : (
                      models.map((it) => (
                        <tr key={it._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">{it.name}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{it.brandName}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                it.isActive
                                  ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {it.isActive ? <CheckCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                              {it.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingModel(it);
                                  setEditingBrand(null);
                                  setShowModal(true);
                                }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                                disabled={loading}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (!it?.modelId) return toast.error('Model not found');
                                  handleDeleteModel(it.modelId);
                                }}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
                                disabled={loading}
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
          )}
        </div>

        {showModal && currentTab === 'brands' && (
          <BrandModal
            brand={editingBrand}
            onClose={() => {
              setShowModal(false);
              setEditingBrand(null);
            }}
            onSave={handleBrandSave}
            loading={loading}
          />
        )}

        {showModal && currentTab === 'models' && (
          <ModelModal
            model={editingModel}
            brands={brands}
            onClose={() => {
              setShowModal(false);
              setEditingModel(null);
            }}
            onSave={handleModelSave}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default BrandModelManager;


