import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { X, Plus, Edit, Trash2, Loader2, CheckCircle, MinusCircle, Tag, Layers } from 'lucide-react';
import { productAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const CategoryModal = ({ category, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    isActive: category?.isActive !== undefined ? category.isActive : true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 max-w-[350px]">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubcategoryModal = ({ subcategory, categories, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: subcategory?.name || '',
    category: subcategory?.category?._id || subcategory?.category || '',
    description: subcategory?.description || '',
    isActive: subcategory?.isActive !== undefined ? subcategory.isActive : true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {subcategory ? 'Edit Subcategory' : 'New Subcategory'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {subcategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryManager = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentTab, setCurrentTab] = useState('categories'); // 'categories' or 'subcategories'
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'category' or 'subcategory'
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPopup(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openManagerListener = useCallback(() => {
    setShowPopup(true);
  }, []);

  useEffect(() => {
    window.addEventListener('openCategoryManager', openManagerListener);
    return () => window.removeEventListener('openCategoryManager', openManagerListener);
  }, [openManagerListener]);

  useEffect(() => {
    if (showPopup) {
      fetchCategories();
      fetchSubcategories();
    }
  }, [showPopup]);

  const fetchCategories = async () => {
    try {
      const res = await productAPI.getCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await productAPI.getSubcategories({});
      setSubcategories(res.data);
    } catch (error) {
      toast.error('Failed to load subcategories');
    }
  };

  const saveCategory = async (formData) => {
    setSaving(true);
    try {
      if (editingCategory) {
        await productAPI.updateCategory(editingCategory._id, formData);
        toast.success('Category updated');
        fetchCategories();
      } else {
        await productAPI.createCategory(formData);
        toast.success('Category created');
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const saveSubcategory = async (formData) => {
    setSaving(true);
    try {
      if (editingSubcategory) {
        await productAPI.updateSubcategory(editingSubcategory._id, formData);
        toast.success('Subcategory updated');
        fetchSubcategories();
      } else {
        await productAPI.createSubcategory(formData);
        toast.success('Subcategory created');
        fetchSubcategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subcategory');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure? This may affect products.')) return;
    try {
      await productAPI.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const deleteSubcategory = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await productAPI.deleteSubcategory(id);
      toast.success('Subcategory deleted');
      fetchSubcategories();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Category Manager</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {currentTab === 'categories' ? 'Manage product categories' : 'Manage product subcategories'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <button
            onClick={() => setCurrentTab('categories')}
            className={`flex-1 py-4 px-8 text-center font-semibold transition-colors ${
              currentTab === 'categories'
                ? 'border-b-2 border-primary-600 text-primary-600 bg-white dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-5 h-5 mx-auto mb-1" />
            Categories
          </button>
          <button
            onClick={() => setCurrentTab('subcategories')}
            className={`flex-1 py-4 px-8 text-center font-semibold transition-colors ${
              currentTab === 'subcategories'
                ? 'border-b-2 border-primary-600 text-primary-600 bg-white dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 mx-auto mb-1" />
            Subcategories
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {currentTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Categories ({categories.length})
                </h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setModalType('category');
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  New Category
                </button>
              </div>
              
              {categories.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <Tag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No categories yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first category to organize products</p>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setModalType('category');
                      setShowModal(true);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl"
                  >
                    Create Category
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {categories.map((category) => (
                        <tr key={category._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{category.name}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-md truncate">{category.description || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              category.isActive
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {category.isActive ? <CheckCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingCategory(category);
                                setModalType('category');
                                setShowModal(true);
                              }}
                              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteCategory(category._id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {currentTab === 'subcategories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Subcategories ({subcategories.length})
                </h2>
                <button
                  onClick={() => {
                    setEditingSubcategory(null);
                    setModalType('subcategory');
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  New Subcategory
                </button>
              </div>
              
              {subcategories.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <Layers className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No subcategories yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Create categories first, then add subcategories</p>
                  <button
                    onClick={() => {
                      setEditingSubcategory(null);
                      setModalType('subcategory');
                      setShowModal(true);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl"
                  >
                    Create Subcategory
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {subcategories.map((subcategory) => (
                        <tr key={subcategory._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{subcategory.name}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-md truncate">{subcategory.description || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              subcategory.isActive
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {subcategory.isActive ? <CheckCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                              {subcategory.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingSubcategory(subcategory);
                                setModalType('subcategory');
                                setShowModal(true);
                              }}
                              className="p-2 text-slate Ascending-descending sort (p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteSubcategory(subcategory._id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CRUD Modal */}
        {showModal && (
          modalType === 'category' ? (
            <CategoryModal
              category={editingCategory}
              onClose={() => {
                setShowModal(false);
                setEditingCategory(null);
              }}
              onSave={saveCategory}
              loading={saving}
            />
          ) : (
            <SubcategoryModal
              subcategory={editingSubcategory}
              categories={categories}
              onClose={() => {
                setShowModal(false);
                setEditingSubcategory(null);
              }}
              onSave={saveSubcategory}
              loading={saving}
            />
          )
        )}
      </div>
    </div>
  );
};

export default CategoryManager;

