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
  DollarSign
} from 'lucide-react';
import Barcode from 'react-barcode';
import { productAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, MinusCircle, Tag } from 'lucide-react';
import CategoryManager from '../components/CategoryManager';
import ProductAnalyticsModal from './ProductAnalyticsModal';

// Helper function to encode product details into barcode (table format)
const encodeProductForBarcode = (product) => {
  // Table format: PC:code|N:name
  return `PC:${product.productCode}|N:${product.productName}`;
};

// Helper function to decode product from barcode
const decodeProductFromBarcode = (barcodeData) => {
  try {
    // Parse table format: PC:code|N:name
    const parts = barcodeData.split('|');
    const result = {};
    parts.forEach(part => {
      const [key, value] = part.split(':');
      if (key === 'PC') result.productCode = value;
      if (key === 'N') result.productName = value;
    });
    return result.productCode || result.productName ? result : null;
  } catch (e) {
    return null;
  }
};

// Barcode Popup Modal Component
const BarcodePopup =({ product, onClose }) => {
  if (!product) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  // Generate barcode value with product details in table format
  const barcodeValue = encodeProductForBarcode(product);

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

        {/* Barcode Display with table format */}
        <div className="flex flex-col items-center mb-4  -mt-6 from-primary-600 to-primary-800 p-4 rounded-lg">
          <div className="bg-white rounded-xl p-2 flex flex-col items-center">
                      <Barcode 
                        value={barcodeValue} 
                        format="CODE128"
                        width={1}
                        height={60}
                        displayValue={false}
                        background="#ffffff"
                        lineColor="#000000"
                      />
                    </div>
          <p className="text-white/60 text-xs mt-2 font-mono">{barcodeValue}</p>
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
            <span className="text-sm text-slate-500 dark:text-slate-400">Base Price</span>
            <span className="font-bold text-sm text-primary-600 dark:text-primary-400">{formatCurrency(product.basePrice)}</span>
          </div>
          {product.sellingPrice && product.sellingPrice > 0 && product.sellingPrice !== product.basePrice && (
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Selling Price</span>
              <span className="font-medium text-sm text-slate-900 dark:text-white line-through">{formatCurrency(product.sellingPrice)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Stock</span>
            <span className={`font-medium text-sm ${
              product.stockQuantity <= product.minStockLevel
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-900 dark:text-white'
            }`}>
              {product.stockQuantity}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Min Stock Level</span>
            <span className="font-medium text-sm text-slate-900 dark:text-white">{product.minStockLevel}</span>
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
      await onSave(formData);
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



const ProductModal = ({ product, categories, subcategories, onClose, onSave, isAdmin }) => {
  const [formData, setFormData] = useState({
    productName: product?.productName || '',
    productCode: product?.productCode || '',
    category: product?.category?._id || product?.category || '',
    subcategory: product?.subcategory?._id || product?.subcategory || '',
    stockQuantity: product?.stockQuantity || 0,
    minStockLevel: product?.minStockLevel || 5,
    basePrice: product?.basePrice || 0,
    sellingPrice: product?.sellingPrice || 0,
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
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
                Product Code (Barcode)
              </label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                placeholder="Auto-generated if empty"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

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
                Selling Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Base Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Min Stock Level
              </label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
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
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
const [showLowStock, setShowLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Initialize showLowStock from URL query parameter
  useEffect(() => {
    const lowStockParam = searchParams.get('lowStock');
    if (lowStockParam === 'true') {
      setShowLowStock(true);
    }
  }, [searchParams]);

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
    fetchCategoriesList();
    fetchSubcategoriesList();
  }, []);

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

  useEffect(() => {
    fetchProducts();
  }, [search, showLowStock, categoryFilter, subcategoryFilter]);

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

  const handleSave = async (formData) => {
    try {
      const dataToSend = {
        ...formData,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
      };
      if (editingProduct) {
        await productAPI.update(editingProduct._id, dataToSend);
      } else {
        await productAPI.create(dataToSend);
      }
      setShowModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleAnalyticsClick = async (product) => {
    try {
      setAnalyticsLoading(true);
      const response = await productAPI.getProductAnalytics(product._id);
      setAnalyticsData(response.data);
      setShowAnalyticsModal(true);
    } catch (error) {
      toast.error('Failed to load analytics: ' + (error.response?.data?.message || error.message));
    } finally {
      setAnalyticsLoading(false);
    }
  };

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
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
              showLowStock 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Low Stock
          </button>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Price</th>
                  {isAdmin && <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
{products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer" onClick={() => handleAnalyticsClick(product)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
            <span className="font-medium text-slate-900 dark:text-white">{product.productName}</span>
                        <BarChart3 className="w-4 h-4 text-blue-600 ml-2" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="flex flex-col items-start gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        {product.productCode && (
                          <img 
                            src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(product.productCode)}&code=Code128&height=30&width=1&showsilent=true`}
                            alt={product.productCode}
                            className="h-8 w-10 object-cover"
                          />
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <ZoomIn className="w-3 h-3" />
                          {product.productCode}
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {product.subcategory?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        product.stockQuantity <= product.minStockLevel
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {product.stockQuantity}
                      </span>
                    </td>
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
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowModal(true);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
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
          isAdmin={isAdmin}
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
        <BarcodePopup 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

{showAnalyticsModal && analyticsData && (
        <ProductAnalyticsModal 
          data={analyticsData} 
          onClose={() => {
            setShowAnalyticsModal(false);
            setAnalyticsData(null);
          }} 
        />
      )}
    </div>
  );
}

export default Products;