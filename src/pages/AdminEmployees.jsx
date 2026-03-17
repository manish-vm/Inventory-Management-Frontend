import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  X,
  Loader2,
  Phone,
  Mail,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Lock,
  Key
} from 'lucide-react';
import { employeeAPI } from '../api/api';


import { useAuth } from '../context/AuthContext';



const EmployeeModal = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    address: employee?.address || '',
    password: '',
    canLogin: employee?.canLogin || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (formData.canLogin && !employee && !formData.password) {
      setError('Password is required when login access is enabled');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      // Only send password if it's filled (for new employees or password changes)
      const dataToSend = { ...formData };
      if (employee && !formData.password) {
        delete dataToSend.password;
      }
      await onSave(dataToSend);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {employee ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Enter employee name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Enter address"
                rows={3}
              />
            </div>
          </div>

          {/* Login Access Section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Login Access
            </h3>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Allow Employee Login</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Employee can login with email and password</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, canLogin: !formData.canLogin })}
                className={`p-1 ${formData.canLogin ? 'text-primary-600' : 'text-slate-400'}`}
              >
                {formData.canLogin ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            {formData.canLogin && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password {!employee && '*'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder={employee ? "Leave blank to keep current password" : "Enter password"}
                    required={!employee}
                  />
                </div>
                {employee && (
                  <p className="text-xs text-slate-500 mt-1">Leave blank to keep the existing password</p>
                )}
              </div>
            )}
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
              {employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminEmployees = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [search, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getEmployees();



      let data = response.data;
      
      // Apply search filter
      if (search) {
        data = data.filter(e => 
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.phone.includes(search) ||
          (e.email && e.email.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        data = data.filter(e => e.isActive === (statusFilter === 'active'));
      }
      
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setError('');
      if (editingEmployee) {
        await employeeAPI.updateEmployee(editingEmployee._id, formData);


        setSuccess('Employee updated successfully');
      } else {
        await employeeAPI.createEmployee(formData);

        setSuccess('Employee created successfully');
      }
      setShowModal(false);
      setEditingEmployee(null);
      fetchEmployees();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save employee';
      setError(errorMsg);
      // Auto-hide error message after 3 seconds
      setTimeout(() => setError(''), 3000);
      throw new Error(errorMsg); // Re-throw to show in modal
    }
  };


  const handleDelete = async (id) => {
    const employee = employees.find(e => e._id === id);
    if (!window.confirm(`Are you sure you want to delete ${employee?.name}? This action cannot be undone.`)) return;
    try {
      setError('');
      await employeeAPI.deleteEmployee(id);

      setSuccess('Employee deleted successfully');
      fetchEmployees();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
      // Auto-hide error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };


  const activeEmployees = employees.filter(e => e.isActive).length;
  const inactiveEmployees = employees.length - activeEmployees;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your employee database</p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Employees</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{employees.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeEmployees}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ToggleRight className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Inactive</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveEmployees}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ToggleLeft className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl capitalize ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
            <Users className="w-12 h-12 mb-4" />
            <p>No employees found</p>
          </div>
        ) : (
<div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-400 font-semibold">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {employee.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {employee.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{employee.address || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        employee.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(employee._id)}
                          className={`p-2 rounded-lg ${
                            employee.isActive
                              ? 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400' : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
                              
                          }`}
                          title={employee.isActive ? 'Deactivate' : 'Activate' }
                        >
                          {employee.isActive ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingEmployee(employee);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminEmployees;


