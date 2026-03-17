import { useState, useEffect } from 'react';
import { superAdminAPI } from '../api/api';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    maxProducts: 100,
    maxUsers: 5,
    price: 0,
    duration: 'monthly',
    features: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await superAdminAPI.getPlans();
      setPlans(response.data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = {
      ...formData,
      features: formData.features.split('\n').filter(f => f.trim())
    };

    try {
      if (editingPlan) {
        await superAdminAPI.updatePlan(editingPlan._id, data);
        setSuccess('Plan updated successfully');
      } else {
        await superAdminAPI.createPlan(data);
        setSuccess('Plan created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      maxProducts: plan.maxProducts,
      maxUsers: plan.maxUsers,
      price: plan.price,
      duration: plan.duration,
      features: plan.features?.join('\n') || '',
      status: plan.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await superAdminAPI.deletePlan(id);
      setSuccess('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleToggleStatus = async (plan) => {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      await superAdminAPI.updatePlan(plan._id, { status: newStatus });
      setSuccess(`Plan ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update plan status');
    }
  };

  const resetForm = () => {
    setFormData({
      planName: '',
      maxProducts: 100,
      maxUsers: 5,
      price: 0,
      duration: 'monthly',
      features: '',
      status: 'active'
    });
    setEditingPlan(null);
    setError('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Subscription Plans
        </h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg hover:shadow-lg transition-colors"
        >
          + Create Plan
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {plan.planName}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  plan.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {plan.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${plan.price}
                </span>
                <span className="text-slate-500 dark:text-slate-400">/{plan.duration}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Max Products</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Max Users</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}
                  </span>
                </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(plan)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg ${
                    plan.status === 'active' 
                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                      : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                  }`}
                >
                  {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No subscription plans found. Create one to get started.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  {editingPlan ? 'Edit Plan' : 'Create Plan'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.planName}
                      onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Max Products *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.maxProducts}
                        onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                      />
                      <p className="text-xs text-slate-500 mt-1">Use -1 for unlimited</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Max Users *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.maxUsers}
                        onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                      />
                      <p className="text-xs text-slate-500 mt-1">Use -1 for unlimited</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Price *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Duration *
                      </label>
                      <select
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Features (one per line)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  {editingPlan && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg hover:shadow-lg"
                    >
                      {editingPlan ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;

