import { useState, useEffect } from 'react';
import { Plus, Upload, Download, Edit, Trash2, Search, Package } from 'lucide-react';
import { productMasterAPI } from '../api/api';
import toast from 'react-hot-toast';

const ProductMaster = () => {
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partNo: '',
    description: '',
    type: '',
    subType: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchSubTypes(selectedType);
    }
  }, [selectedType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productMasterAPI.getAll({ search: searchTerm, type: selectedType });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await productMasterAPI.getTypes();
      setTypes(response.data);
    } catch (error) {
      toast.error('Failed to fetch types');
    }
  };

  const fetchSubTypes = async (type) => {
    try {
      const response = await productMasterAPI.getSubTypes({ type });
      setSubTypes(response.data);
    } catch (error) {
      setSubTypes([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productMasterAPI.update(editingProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productMasterAPI.create(formData);
        toast.success('Product created successfully');
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ partNo: '', description: '', type: '', subType: '' });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      partNo: product.partNo,
      description: product.description,
      type: product.type || '',
      subType: product.subType || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productMasterAPI.delete(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const products = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const [partNo, description, type, subType] = lines[i].split(',').map(s => s.trim());
            products.push({ partNo, description, type, subType });
          }
        }

        const response = await productMasterAPI.upload({ products });
        toast.success(`Uploaded: ${response.data.created} created, ${response.data.updated} updated`);
        fetchProducts();
      } catch (error) {
        toast.error('Failed to upload file');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = 'partNo,description,type,subType\nMASK-GLASS-001,Anti-glare Mask Glass,Mask,X001\nVISOR-001,UV Coated Visor,Visor,X002';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Master</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage product catalog with Part No and Description</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Template
            </button>
            <label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Upload CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ partNo: '', description: '', type: '', subType: '' }); }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Part No or Description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Part No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Sub-Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-slate-500">No products found</td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{product.partNo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.type || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.subType || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(product)} className="p-1 text-primary-600 hover:bg-primary-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Part No *</label>
                  <input
                    type="text"
                    value={formData.partNo}
                    onChange={e => setFormData({ ...formData, partNo: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    disabled={editingProduct}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    list="types"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                  <datalist id="types">
                    {types.map(type => <option key={type} value={type} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub-Type</label>
                  <input
                    type="text"
                    value={formData.subType}
                    onChange={e => setFormData({ ...formData, subType: e.target.value })}
                    list="subtypes"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                  <datalist id="subtypes">
                    {subTypes.map(subType => <option key={subType} value={subType} />)}
                  </datalist>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Save
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400">
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

export default ProductMaster;