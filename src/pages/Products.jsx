import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  BarChart3,
  X,
  Loader2,
  ZoomIn,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Upload,
  Download
} from 'lucide-react';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { productAPI, brandModelAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, MinusCircle, Tag } from 'lucide-react';
import CategoryManager from '../components/CategoryManager';
import ProductAnalyticsModal from './ProductAnalyticsModal';

const getQRCodeValue = (product) => {
  if (!product?.withQRCode) return '';
  return product?.code || product?.code || product?.productName || product?._id || '';
};

// QR Code Popup Modal Component
const QRCodePopup = ({ product, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    let active = true;
    const value = getQRCodeValue(product);

    if (!value) {
      setQrDataUrl(null);
      return;
    }

    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: 220,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        if (active) setQrDataUrl(url);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQRCode();

    return () => {
      active = false;
    };
  }, [product]);

  if (!product) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 p-4 -mt-10" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-sm max-h-[550px] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Product Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center mb-4 -mt-6 from-primary-600 to-primary-800 p-4 rounded-lg">
          <div className="bg-white rounded-xl p-2 flex flex-col items-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Product QR Code" className="h-40 w-40 object-contain" />
            ) : (
              <div className="h-40 w-40 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                QR unavailable
              </div>
            )}
          </div>
          <p className="text-white/60 text-xs mt-2 font-mono">{getQRCodeValue(product)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Product Name</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">{product.productName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Category</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">{product.category?.name || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Subcategory</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">{product.subcategory?.name || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Brand</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">{product.brandName || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Model</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">{product.model || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Category</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">{product.category?.name || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Subcategory</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">{product.subcategory?.name || '-'}</span>
          </div>
        </div>


        <button onClick={onClose} className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg text-sm">
          Close
        </button>
      </div>
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    isActive: category?.isActive !== undefined ? category.isActive : true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        brandName: undefined,
        model: undefined,
      };
      // Backend expects brandId/modelId to resolve names
      delete payload.brandName;
      delete payload.model;
      await onSave(payload);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              Active
            </label>
          </div>
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
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subcategory Modal Component
const SubcategoryModal = ({ subcategory, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: subcategory?.name || '',
    category: subcategory?.category?._id || subcategory?.category || '',
    description: subcategory?.description || '',
    isActive: subcategory?.isActive !== undefined ? subcategory.isActive : true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {subcategory ? 'Edit Subcategory' : 'Add Subcategory'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              Active
            </label>
          </div>
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
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {subcategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



const ProductModal = ({
  product,
  categories,
  subcategories,
  brands,
  models,
  allModels,
  onClose,
  onSave,
  onBrandChange,
  isAdmin,
}) => {
  const [formData, setFormData] = useState({
    productName: product?.productName || '',
    code: product?.code || product?.code || '',
    stockQuantity: product?.stockQuantity ?? 0,

    // Product stores brand/model as strings; ids are derived for dropdowns.
    brandId: product?.brandId || '',
    modelId: product?.modelId || '',

    brandName: product?.brandName || '',
    model: product?.model || '',

    category: product?.category?._id || product?.category || '',
    subcategory: product?.subcategory?._id || product?.subcategory || '',
  });

  const [useQRCode, setUseQRCode] = useState(product?.withQRCode ?? true);
  const [loading, setLoading] = useState(false);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  useEffect(() => {
    if (formData.category) {
      setFilteredSubcategories(subcategories.filter(sub => sub.category?._id === formData.category || sub.category === formData.category));
    } else {
      setFilteredSubcategories([]);
    }
    if (!formData.category) {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category, subcategories]);

  useEffect(() => {
    // 1) Keep selected model valid for the chosen brand.
    if (!formData.brandId) {
      if (formData.modelId) setFormData((prev) => ({ ...prev, modelId: '' }));
      return;
    }

    if (formData.modelId) {
      const modelBelongsToBrand = models?.some((m) => String(m._id) === String(formData.modelId));
      if (!modelBelongsToBrand) setFormData((prev) => ({ ...prev, modelId: '' }));
    }

    // 2) For edit mode: backend stores `model` as string (not modelId).
    // If modelId is empty but we have brandId + model name + loaded models, derive modelId.
    if (!formData.modelId && formData.model && Array.isArray(models) && models.length > 0) {
      const target = String(formData.model).trim().toLowerCase();
      const match = models.find((m) => String(m.name).trim().toLowerCase() === target);
      if (match) {
        setFormData((prev) => ({ ...prev, modelId: match._id }));
      }
    }
  }, [formData.brandId, formData.modelId, formData.model, models]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData, { createQRCode: useQRCode });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Auto-generated if empty"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            {(
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  QR Option
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="useQRCode"
                      value="yes"
                      checked={useQRCode}
                      onChange={() => setUseQRCode(true)}
                      className="h-4 w-4 text-primary-600 border-slate-300"
                    />
                    With QR
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="useQRCode"
                      value="no"
                      checked={!useQRCode}
                      onChange={() => setUseQRCode(false)}
                      className="h-4 w-4 text-primary-600 border-slate-300"
                    />
                    Without QR
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stock Quantity
              </label>
              <input
                type="text"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subcategory
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                disabled={!formData.category}
              >
                <option value="">Select Subcategory</option>
                {filteredSubcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Brand *
              </label>
              <select
                value={formData.brandId}
                onChange={async (e) => {
                  const brandId = e.target.value;
                  setFormData(prev => ({ ...prev, brandId, modelId: '', model: '' }));
                  if (onBrandChange) {
                    await onBrandChange(brandId);
                  }
                }}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Select Brand</option>
                {brands.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Model *
              </label>
              <select
                value={formData.modelId}
                onChange={(e) => {
                  const value = e.target.value;
                  const selectedModel = (models || allModels).find((m) => String(m._id) === value);
                  setFormData(prev => ({
                    ...prev,
                    modelId: value,
                    brandId: prev.brandId || selectedModel?.brandId?._id || selectedModel?.brandId || prev.brandId,
                    brandName: prev.brandName || selectedModel?.brandId?.name || prev.brandName,
                    model: selectedModel?.name || prev.model,
                  }));
                }}
                disabled={!((formData.brandId || allModels.length > 0))}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60"
              >
                <option value="">Select Model</option>
                {(formData.brandId ? models : allModels).map(m => (
                  <option key={m._id} value={m._id}>
                    {m.name}{!formData.brandId && m.brandId?.name ? ` (${m.brandId.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products = () => {
  const { isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [uploadingProducts, setUploadingProducts] = useState(false);


  const [selectedProduct, setSelectedProduct] = useState(null);
  // const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  // const [analyticsData, setAnalyticsData] = useState(null);
  // const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Initialize showLowStock from URL query parameter
  useEffect(() => {
    const lowStockParam = searchParams.get('lowStock');
    if (lowStockParam === 'true') {
      setShowLowStock(true);
    }
  }, [searchParams]);

  const normalizeHeader = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const normalizeCellValue = (value) => {
    if (value === null || value === undefined) return '';
    return typeof value === 'string' ? value.trim() : value;
  };

  const productColumnMap = {
    productname: 'productName',
    producname: 'productName',
    partdetails: 'productName',
    partdetail: 'productName',
    partname: 'productName',
    name: 'productName',
    description: 'description',
    code: 'code',
    productcode: 'code',
    partno: 'code',
    partnumber: 'code',
    rootcode: 'code',
    categre: 'categoryName',
    category: 'categoryName',
    subcat: 'subcategoryName',
    subcatego: 'subcategoryName',
    subcategoryname: 'subcategoryName',
    subcategory: 'subcategoryName',
    brand: 'brandName',
    brandname: 'brandName',
    model: 'model',
    models: 'model',
    quantity: 'quantity',
    stockquantity: 'stockQuantity',
    numberofitems: 'numberOfItems',
    items: 'numberOfItems',
    withqr: 'withQRCode',
    withqrcode: 'withQRCode',
    qrcode: 'withQRCode',
    rejectdefects: 'rejectDefects',
    rejectdefectdetails: 'rejectDefects',
    rejectiondefects: 'rejectDefects',
    reworkdefects: 'reworkDefects',
    reworkdefectdetails: 'reworkDefects'
  };

  const parseWorkflowTemplateRows = (sheet) => {
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const headers = rows[0] || [];
    const stageColumnIndexes = headers
      .map((header, index) => ({ header: normalizeHeader(header), index }))
      .filter(({ header }) => /^stage\d+$/.test(header));

    return rows.slice(1).map((row) => {
      const parsedRow = {};

      headers.forEach((header, index) => {
        const mappedKey = productColumnMap[normalizeHeader(header)];
        if (mappedKey) parsedRow[mappedKey] = normalizeCellValue(row[index]);
      });

      parsedRow.workflowStages = stageColumnIndexes
        .map(({ header, index }) => {
          const stageNumber = Number(header.replace('stage', ''));
          return {
            stageNumber,
            stageName: normalizeCellValue(row[index]),
            enabled: normalizeCellValue(row[index]),
            accepted: normalizeCellValue(row[index + 1]),
            rejectionQuestion: normalizeCellValue(row[index + 2]),
            rejectionOptionType: normalizeCellValue(row[index + 3]),
            rejectionOptions: normalizeCellValue(row[index + 4]),
            reworkQuestion: normalizeCellValue(row[index + 5]),
            reworkOptionType: normalizeCellValue(row[index + 6]),
            reworkOptions: normalizeCellValue(row[index + 7])
          };
        })
        .filter((stage) =>
          [stage.enabled, stage.accepted, stage.rejectionQuestion, stage.rejectionOptionType, stage.rejectionOptions, stage.reworkQuestion, stage.reworkOptionType, stage.reworkOptions]
            .some((value) => String(value || '').trim())
        );

      return parsedRow;
    }).filter((row) =>
      Object.entries(row).some(([key, value]) => key !== 'workflowStages' && String(value || '').trim()) ||
      row.workflowStages?.length
    );
  };

  const handleProductExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingProducts(true);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const productsToUpload = parseWorkflowTemplateRows(sheet);

      const response = await productAPI.bulkUpload(productsToUpload);
      const { created = 0, updated = 0, qrCreated = 0, workflowCreated = 0, workflowUpdated = 0, errors = [] } = response.data || {};
      toast.success(`Imported ${created} new and ${updated} updated products. Workflows: ${workflowCreated} new, ${workflowUpdated} updated. QR created: ${qrCreated}.`);
      if (errors.length) toast.error(`${errors.length} row(s) failed. Check console for details.`);
      if (errors.length) console.table(errors);
      await Promise.all([
        fetchProducts(),
        fetchCategoriesList(),
        fetchSubcategoriesList(),
        loadBrands(),
        fetchAllModels()
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to import products');
    } finally {
      setUploadingProducts(false);
    }
  };

  const handleDownloadWorkflowTemplate = () => {
    const templateRows = [
      [ 'Product Name', 
        'Code',
        'Category',
        'Subcategory',
        'Brand', 
        'Model',
        'Stage 1', 
        'Accepted',
        'Question for rejected',
        'Rejected Option Type',
        'Options (separate with ,)',
        'Question for Rework',
        'Rework Option Type', 
        'Options (separate with ,)', 
        'Stage 2', 
        'Accepted',
        'Question for rejected',
        'Rejected Option Type', 
        'Options (separate with ,)', 
        'Question for Rework',
        'Rework Option Type',
        'Options (separate with ,)',
        'Stage 3',
        'Accepted', 
        'Question for rejected',
        'Rejected Option Type', 
        'Options (separate with ,)',
        'Question for Rework',
        'Rework Option Type', 
        'Options (separate with ,)'
      ]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateRows);
    worksheet['!cols'] = [{ wch: 22 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'workflow-template.xlsx');
  };

  const fetchCategoriesList = async () => {
    setLoadingCategories(true);
    try {
      const response = await productAPI.getCategories();
      setCategoriesList(response.data);
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSubcategoriesList = async () => {
    setLoadingSubcategories(true);
    try {
      const response = await productAPI.getSubcategories({});
      setSubcategoriesList(response.data);
      setSubcategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
    } finally {
      setLoadingSubcategories(false);
    }
  };

  useEffect(() => {
    const loadProductTaxonomy = async () => {
      setLoadingCategories(true);
      setLoadingSubcategories(true);
      try {
        await Promise.all([fetchCategoriesList(), fetchSubcategoriesList()]);
      } catch (error) {
        toast.error('Failed to load product taxonomy');
      } finally {
        setLoadingCategories(false);
        setLoadingSubcategories(false);
      }
    };

    loadProductTaxonomy();
  }, [isAdmin]);

  // Fetch products when search/filter changes
  useEffect(() => {
    if (categoryFilter) {
      const filtered = subcategories.filter(sub => sub.category?._id === categoryFilter || sub.category === categoryFilter);
      setFilteredSubcategories(filtered);
      setSubcategoryFilter('');
    } else {
      setFilteredSubcategories([]);
    }
  }, [categoryFilter, subcategories]);

  const fetchAllModels = async () => {
    try {
      const response = await brandModelAPI.getAllModels();
      const modelsData = response.data || [];
      setAllModels(modelsData);
      setModels(modelsData);
      return modelsData;
    } catch (e) {
      console.error('Failed to fetch all models', e);
      setAllModels([]);
      setModels([]);
      return [];
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandModelAPI.getActiveBrands();
      setBrands(response.data);
    } catch (e) {
      console.error('Failed to fetch brands', e);
      setBrands([]);
    }
  };

  useEffect(() => {
    loadBrands();
    fetchAllModels();
  }, []);

  const fetchModelsByBrand = async (brandId) => {
    if (!brandId) {
      setModels(allModels);
      return;
    }
    try {
      const response = await brandModelAPI.getModelsByBrand(brandId);
      setModels(response.data || []);
    } catch (e) {
      console.error('Failed to fetch models for brand', e);
      setModels([]);
    }
  };

  const handleBrandChange = async (brandId) => {
    setModels([]);
    await fetchModelsByBrand(brandId);
  };

  const refreshBrands = async () => {
    try {
      const response = await brandModelAPI.getActiveBrands();
      const data = response.data || [];
      setBrands(data);
      return data;
    } catch (e) {
      console.error('Failed to fetch brands', e);
      setBrands([]);
      return [];
    }
  };

  // Fetch products when search/filter changes
  useEffect(() => {
    fetchProducts();
  }, [search, showLowStock, categoryFilter, subcategoryFilter]);

  // Keep models in sync with the selected brand (same style as category -> subcategory).
  // For edits: backend product stores brandName + model (not brandId/modelId).
  useEffect(() => {
    if (!showModal) return;

    let active = true;
    const timeoutId = setTimeout(async () => {
      if (!active) return;

      await refreshBrands();
      await fetchAllModels();
      if (!active) return;

      const currentProduct = editingProduct;
      const derivedBrandId =
        currentProduct?.brandId ||
        (currentProduct?.brandName
          ? (brands || []).find((b) => b.name === currentProduct.brandName)?._id
          : '');

      if (!derivedBrandId) {
        const freshModels = await fetchAllModels();
        if (!active) return;
        setModels(freshModels);
        return;
      }

      await fetchModelsByBrand(derivedBrandId);
    }, 500); // Add 500ms delay to prevent rapid API calls

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, editingProduct]);


  const fetchProducts = async () => {

    try {
      const params = { search };
      if (showLowStock) params.lowStock = 'true';
      if (categoryFilter) params.category = categoryFilter;
      if (subcategoryFilter) params.subcategory = subcategoryFilter;
      const response = await productAPI.getAll(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await productAPI.getSubcategories({});
      setSubcategories(response.data);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  const handleSave = async (formData, options = {}) => {
    try {
      const dataToSend = {
        ...formData,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        withQRCode: Boolean(options.createQRCode),
      };
      delete dataToSend.numberOfItems;

      if (editingProduct) {
        await productAPI.update(editingProduct._id, dataToSend);
      } else {
        await productAPI.create(dataToSend);
      }

      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      setShowModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  // const handleAnalyticsClick = async (product) => {
  //   try {
  //     setAnalyticsLoading(true);
  //     const response = await productAPI.getProductAnalytics(product._id);
  //     setAnalyticsData(response.data);
  //     setShowAnalyticsModal(true);
  //   } catch (error) {
  //     toast.error('Failed to load analytics: ' + (error.response?.data?.message || error.message));
  //   } finally {
  //     setAnalyticsLoading(false);
  //   }
  // };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleCategorySave = async (formData) => {
    try {
      if (editingCategory) {
        await productAPI.updateCategory(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await productAPI.createCategory(formData);
        toast.success('Category created successfully');
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      fetchCategoriesList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleSubcategorySave = async (formData) => {
    try {
      if (editingSubcategory) {
        await productAPI.updateSubcategory(editingSubcategory._id, formData);
        toast.success('Subcategory updated successfully');
      } else {
        await productAPI.createSubcategory(formData);
        toast.success('Subcategory created successfully');
      }
      setShowSubcategoryModal(false);
      setEditingSubcategory(null);
      fetchSubcategoriesList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subcategory');
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await productAPI.deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategoriesList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleSubcategoryDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await productAPI.deleteSubcategory(id);
      toast.success('Subcategory deleted successfully');
      fetchSubcategoriesList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your inventory</p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadWorkflowTemplate}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Download className="w-5 h-5" />
              Download Template
            </button>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              {uploadingProducts ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={uploadingProducts}
                onChange={handleProductExcelUpload}
              />
            </label>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        )}
      </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 lg:flex-[2]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none flex-1 lg:w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none flex-1 lg:w-auto"
          >
            <option value="">All Subcategories</option>
            {filteredSubcategories.map((sub) => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
          {/* <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
              showLowStock 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Low Stock
          </button> */}
        </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
            <Package className="w-12 h-12 mb-4" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Subcategory</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Model</th>
                  {/* <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Stock</th> */}
                  {!isAdmin && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Price</th>
                  )}

                  {isAdmin && <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
            <span className="font-medium text-slate-900 dark:text-white">{product.productName}</span>
                        {/* <BarChart3 className="w-4 h-4 text-blue-600 ml-2" /> */}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className="flex flex-col items-start gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        {product.withQRCode && (product.code || product.code) && (
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(product.code || product.code)}`}
                            alt={product.code || product.code}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400" onMouseDown={(e) => e.preventDefault()}>
                          {product.withQRCode && <ZoomIn className="w-3 h-3" />}
                          {product.code || product.code}
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {product.subcategory?.name || '-'}
                    </td>
                    {/* <td className="px-6 py-4">
                      <span className={`font-medium ${
                        product.stockQuantity <= product.minStockLevel
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {product.stockQuantity}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {product.brandName || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {product.model || '-'}
                    </td>
                  

                    {/* Hide price for admins */}
                    {!isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(product.basePrice)}
                          </span>
                          {product.sellingPrice && product.sellingPrice > 0 && product.sellingPrice !== product.basePrice && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 line-through">
                              {formatCurrency(product.sellingPrice)}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Print icon: prints this product's QR code */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const code = product.code || product.code;
                            if (!product.withQRCode) {
                              alert('This product was created without QR code generation.');
                              return;
                            }
                            const printWin = window.open('', '_blank', 'width=600,height=400');
                            if (!printWin) {
                              alert('Popup blocked. Please allow popups to print QR code.');
                              return;
                            }
                            printWin.document.write(`<!doctype html><html><head><title>Print QR Code</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;">`);
                            printWin.document.write(`
                              <div style="text-align:center;font-family:Arial,sans-serif;">
                                <div style="margin-bottom:12px;font-weight:600;">${product.productName}</div>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(code)}" alt="QR code" />
                                <div style="margin-top:10px;font-size:12px;">${code}</div>
                              </div>
                            `);
                            printWin.document.write(`</body></html>`);
                            printWin.document.close();
                            printWin.focus();
                            printWin.print();
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                          title="Print QR code"
                        >
                          <span className="text-sm">🖨️</span>
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProduct(product);
                                setShowModal(true);
                              }}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(product._id);
                              }}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          models={models}
          allModels={allModels}
          isAdmin={isAdmin}
          onBrandChange={handleBrandChange}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={handleCategorySave}
        />
      )}

      {showSubcategoryModal && (
        <SubcategoryModal
          subcategory={editingSubcategory}
          categories={categoriesList}
          onClose={() => {
            setShowSubcategoryModal(false);
            setEditingSubcategory(null);
          }}
          onSave={handleSubcategorySave}
        />
      )}

{selectedProduct && (
        <QRCodePopup 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

{/* {showAnalyticsModal && analyticsData && (
        <ProductAnalyticsModal 
          data={analyticsData} 
          onClose={() => {
            setShowAnalyticsModal(false);
            setAnalyticsData(null);
          }} 
        />
      )} */}
    </div>
  );
}

export default Products;
