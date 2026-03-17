import { useState, useEffect } from 'react';
import { superAdminAPI } from '../api/api';

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [formData, setFormData] = useState({
    dealerName: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    adminId: '',
    subscriptionPlan: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dealersRes, adminsRes, plansRes] = await Promise.all([
        superAdminAPI.getDealers(),
        superAdminAPI.getAdmins(),
        superAdminAPI.getPlans()
      ]);
      setDealers(dealersRes.data);
      setAdmins(adminsRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingDealer) {
        await superAdminAPI.updateDealer(editingDealer._id, formData);
        setSuccess('Dealer updated successfully');
      } else {
        await superAdminAPI.createDealer(formData);
        setSuccess('Dealer created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save dealer');
    }
  };

  const handleEdit = (dealer) => {
    setEditingDealer(dealer);
    setFormData({
      dealerName: dealer.dealerName,
      address: dealer.address,
      contactPerson: dealer.contactPerson,
      phone: dealer.phone,
      email: dealer.email,
      adminId: dealer.adminId?._id || dealer.adminId || '',
      subscriptionPlan: dealer.subscriptionPlan?._id || dealer.subscriptionPlan || '',
      status: dealer.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dealer? This will also deactivate all associated users.')) return;
    
    try {
      await superAdminAPI.deleteDealer(id);
      setSuccess('Dealer deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete dealer');
    }
  };

  const handleToggleStatus = async (dealer) => {
    const newStatus = dealer.status === 'active' ? 'suspended' : 'active';
    try {
      await superAdminAPI.updateDealer(dealer._id, { status: newStatus });
      setSuccess(`Dealer ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update dealer status');
    }
  };

  const resetForm = () => {
    setFormData({
      dealerName: '',
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      adminId: '',
      subscriptionPlan: '',
      status: 'active'
    });
    setEditingDealer(null);
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
          Dealer Management
        </h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg hover:shadow-lg transition-colors"
        >
          + Create Dealer
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

      {/* Dealer Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Dealer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Admin Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {dealers.map((dealer) => (
                <tr key={dealer._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {dealer.dealerName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {dealer.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {dealer.contactPerson}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {dealer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {dealer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {dealer.adminId?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {dealer.subscriptionPlan?.planName || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dealer.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {dealer.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(dealer.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(dealer)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(dealer)}
                        className={`${dealer.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} dark:text-green-400 dark:hover:text-green-300`}
                      >
                        {dealer.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(dealer._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dealers.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No dealers found. Create one to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  {editingDealer ? 'Edit Dealer' : 'Create Dealer'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Dealer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.dealerName}
                      onChange={(e) => setFormData({ ...formData, dealerName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Assign Admin
                    </label>
                    <select
                      value={formData.adminId}
                      onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="">Select Admin</option>
                      {admins.map((admin) => (
                        <option key={admin._id} value={admin._id}>
                          {admin.name} ({admin.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Subscription Plan
                    </label>
                    <select
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="">Select Plan</option>
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.planName} - ${plan.price}/{plan.duration}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editingDealer && (
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
                        <option value="suspended">Suspended</option>
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
                      {editingDealer ? 'Update' : 'Create'}
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

export default DealerManagement;

