// UPDATED ProductMaster.jsx
// Added:
// ✅ Product Review Configuration Button
// ✅ Navigate to Product Review Page
// ✅ Stage Selection Modal
// ✅ Manufacturing Review Integration
// ✅ Review Status Indicator
// ✅ Quick Access to Questionnaire Config

import { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  Search,
  Package,
  ClipboardCheck,
  Settings
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { productMasterAPI } from '../api/api';

import toast from 'react-hot-toast';

const ProductMaster = () => {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedType, setSelectedType] = useState('');

  const [loading, setLoading] = useState(false);

  /* NEW */

  const [showStageSelector, setShowStageSelector] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [manufacturingStages, setManufacturingStages] = useState([]);

  const [formData, setFormData] = useState({
    partNo: '',
    description: '',
    type: '',
    subType: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchTypes();
    fetchManufacturingStages();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchSubTypes(selectedType);
    }
  }, [selectedType]);

  const fetchProducts = async () => {

    setLoading(true);

    try {

      const response = await productMasterAPI.getAll({
        search: searchTerm,
        type: selectedType
      });

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

      const response = await productMasterAPI.getSubTypes({
        type
      });

      setSubTypes(response.data);

    } catch (error) {

      setSubTypes([]);

    }
  };

  /* ========================================= */
  /* FETCH MANUFACTURING STAGES */
  /* ========================================= */

  const fetchManufacturingStages = async () => {

    try {

      const response = await fetch(
        '/api/manufacturing-stages'
      );

      const data = await response.json();

      setManufacturingStages(data.data || []);

    } catch (error) {

      console.error(error);

      toast.error(
        'Failed to fetch manufacturing stages'
      );
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      if (editingProduct) {

        await productMasterAPI.update(
          editingProduct._id,
          formData
        );

        toast.success(
          'Product updated successfully'
        );

      } else {

        await productMasterAPI.create(formData);

        toast.success(
          'Product created successfully'
        );
      }

      setShowForm(false);

      setEditingProduct(null);

      setFormData({
        partNo: '',
        description: '',
        type: '',
        subType: ''
      });

      fetchProducts();

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to save product'
      );
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

    if (
      window.confirm(
        'Are you sure you want to delete this product?'
      )
    ) {

      try {

        await productMasterAPI.delete(id);

        toast.success(
          'Product deleted successfully'
        );

        fetchProducts();

      } catch (error) {

        toast.error(
          'Failed to delete product'
        );
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

            const [
              partNo,
              description,
              type,
              subType
            ] = lines[i]
              .split(',')
              .map(s => s.trim());

            products.push({
              partNo,
              description,
              type,
              subType
            });
          }
        }

        const response =
          await productMasterAPI.upload({
            products
          });

        toast.success(
          `Uploaded: ${response.data.created} created, ${response.data.updated} updated`
        );

        fetchProducts();

      } catch (error) {

        toast.error(
          'Failed to upload file'
        );
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {

    const csvContent =
      'partNo,description,type,subType\nMASK-GLASS-001,Anti-glare Mask Glass,Mask,X001\nVISOR-001,UV Coated Visor,Visor,X002';

    const blob = new Blob(
      [csvContent],
      { type: 'text/csv' }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;

    a.download =
      'product_template.csv';

    a.click();
  };

  /* ========================================= */
  /* OPEN PRODUCT REVIEW CONFIG */
  /* ========================================= */

  const openReviewConfig = (product) => {

    setSelectedProduct(product);

    setShowStageSelector(true);
  };

  /* ========================================= */
  /* NAVIGATE TO REVIEW CONFIG */
  /* ========================================= */

  const navigateToReviewConfig = (stageId) => {

    navigate(
      `/manufacturing-config/stages/${stageId}/product-review`,
      {
        state: {
          product: selectedProduct
        }
      }
    );

    setShowStageSelector(false);
  };

  return (

    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">

      <div className="max-w-7xl mx-auto">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="flex items-center justify-between mb-6">

          <div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Product Master
            </h1>

            <p className="text-slate-600 dark:text-slate-400">
              Manage product catalog with
              Product Review workflows
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={downloadTemplate}
              className="
                px-4 py-2
                bg-slate-600
                text-white
                rounded-lg
                hover:bg-slate-700
                transition-colors
                flex items-center gap-2
              "
            >
              <Download className="w-4 h-4" />
              Template
            </button>

            <label
              className="
                px-4 py-2
                bg-primary-600
                text-white
                rounded-lg
                hover:bg-primary-700
                transition-colors
                flex items-center gap-2
                cursor-pointer
              "
            >
              <Upload className="w-4 h-4" />
              Upload CSV

              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />

            </label>

            <button
              onClick={() => {

                setShowForm(true);

                setEditingProduct(null);

                setFormData({
                  partNo: '',
                  description: '',
                  type: '',
                  subType: ''
                });
              }}
              className="
                px-4 py-2
                bg-primary-600
                text-white
                rounded-lg
                hover:bg-primary-700
                transition-colors
                flex items-center gap-2
              "
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>

          </div>

        </div>

        {/* ========================================= */}
        {/* SEARCH */}
        {/* ========================================= */}

        <div className="
          bg-white dark:bg-slate-800
          rounded-xl shadow-sm
          p-4 mb-6
        ">

          <div className="flex gap-4">

            <div className="flex-1">

              <div className="relative">

                <Search className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  w-5 h-5 text-slate-400
                " />

                <input
                  type="text"
                  placeholder="Search by Part No or Description..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="
                    w-full pl-10 pr-4 py-2
                    border border-slate-300
                    dark:border-slate-600
                    rounded-lg
                    bg-white dark:bg-slate-700
                    text-slate-900 dark:text-white
                  "
                />

              </div>

            </div>

            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value)
              }
              className="
                px-4 py-2
                border border-slate-300
                dark:border-slate-600
                rounded-lg
                bg-white dark:bg-slate-700
                text-slate-900 dark:text-white
              "
            >

              <option value="">
                All Types
              </option>

              {types.map(type => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* ========================================= */}
        {/* TABLE */}
        {/* ========================================= */}

        <div className="
          bg-white dark:bg-slate-800
          rounded-xl shadow-sm
          overflow-hidden
        ">

          <table className="w-full">

            <thead>

              <tr className="
                border-b border-slate-200
                dark:border-slate-700
              ">

                <th className="px-6 py-3 text-left">
                  Part No
                </th>

                <th className="px-6 py-3 text-left">
                  Description
                </th>

                <th className="px-6 py-3 text-left">
                  Type
                </th>

                <th className="px-6 py-3 text-left">
                  Sub-Type
                </th>

                <th className="px-6 py-3 text-left">
                  Review Config
                </th>

                <th className="px-6 py-3 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {products.map(product => (

                <tr
                  key={product._id}
                  className="
                    border-b border-slate-200
                    dark:border-slate-700
                  "
                >

                  <td className="px-6 py-4">
                    {product.partNo}
                  </td>

                  <td className="px-6 py-4">
                    {product.description}
                  </td>

                  <td className="px-6 py-4">
                    {product.type || '-'}
                  </td>

                  <td className="px-6 py-4">
                    {product.subType || '-'}
                  </td>

                  {/* ========================================= */}
                  {/* PRODUCT REVIEW CONFIG */}
                  {/* ========================================= */}

                  <td className="px-6 py-4">

                    <button
                      onClick={() =>
                        openReviewConfig(product)
                      }
                      className="
                        flex items-center gap-2
                        px-3 py-2
                        bg-indigo-600
                        text-white
                        rounded-lg
                        hover:bg-indigo-700
                      "
                    >

                      <ClipboardCheck className="w-4 h-4" />

                      Configure Review

                    </button>

                  </td>

                  {/* ========================================= */}
                  {/* ACTIONS */}
                  {/* ========================================= */}

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          handleEdit(product)
                        }
                        className="
                          p-1 text-primary-600
                          hover:bg-primary-50
                          rounded
                        "
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(product._id)
                        }
                        className="
                          p-1 text-red-600
                          hover:bg-red-50
                          rounded
                        "
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* ========================================= */}
      {/* STAGE SELECTOR MODAL */}
      {/* ========================================= */}

      {showStageSelector && (

        <div className="
          fixed inset-0
          bg-black/50
          flex items-center justify-center
          z-50
        ">

          <div className="
            bg-white dark:bg-slate-800
            rounded-xl
            p-6
            w-full
            max-w-lg
          ">

            <div className="
              flex items-center gap-3
              mb-6
            ">

              <Settings className="
                w-6 h-6 text-indigo-600
              " />

              <h2 className="
                text-xl font-bold
                text-slate-900 dark:text-white
              ">

                Select Manufacturing Stage

              </h2>

            </div>

            <div className="space-y-3">

              {manufacturingStages.map(stage => (

                <button
                  key={stage._id}
                  onClick={() =>
                    navigateToReviewConfig(stage._id)
                  }
                  className="
                    w-full
                    flex items-center justify-between
                    p-4
                    border border-slate-200
                    dark:border-slate-700
                    rounded-lg
                    hover:border-indigo-500
                    hover:bg-indigo-50
                    dark:hover:bg-slate-700
                    transition-all
                  "
                >

                  <div className="text-left">

                    <p className="
                      font-semibold
                      text-slate-900 dark:text-white
                    ">
                      {stage.name}
                    </p>

                    <p className="
                      text-sm text-slate-500
                    ">
                      Configure review workflow
                    </p>

                  </div>

                  <Package className="
                    w-5 h-5 text-indigo-600
                  " />

                </button>

              ))}

            </div>

            <button
              onClick={() =>
                setShowStageSelector(false)
              }
              className="
                mt-6 w-full
                px-4 py-2
                bg-slate-300
                dark:bg-slate-700
                rounded-lg
              "
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default ProductMaster;