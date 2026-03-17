import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  User,
  Mail,
  Receipt,
  Calendar,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { dashboardAPI, billingAPI, refundRequestAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';


// StatCard component for Admin Dashboard
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const getColorClasses = () => {
    switch(color) {
      case 'blue':
        return 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400';
      case 'green':
        return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      case 'orange':
        return 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400';
      case 'red':
        return 'bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'teal':
        return 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400';
      default:
        return 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400';
    }
  };

  const getIconBg = () => {
    switch(color) {
      case 'blue':
        return 'bg-gradient-to-br from-primary-500 to-primary-600 ';
      case 'green':
        return 'bg-gradient-to-br from-success-500 to-success-600';
      case 'orange':
        return 'bg-gradient-to-br from-warning-500 to-warning-600';
      case 'red':
        return 'bg-gradient-to-br from-danger-500 to-danger-600';
      case 'purple':
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'teal':
        return 'bg-gradient-to-br from-accent-500 to-accent-600';
      case 'yellow':
        return 'bg-gradient-to-br from-amber-500 to-yellow-500';
      case 'orange':
        return 'bg-gradient-to-br from-warning-500 to-warning-600';
      default:
        return 'bg-gradient-to-br from-surface-500 to-surface-600';
    }
  };


  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft hover:shadow-card transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <p className="text-3xl font-bold mt-2 text-surface-900 dark:text-surface-100">{value}</p>
          {subtitle && (
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1.5 mt-3 text-sm font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend >= 0 ? 
                <TrendingUp className="w-4 h-4" /> : 
                <TrendingDown className="w-4 h-4" />
              }
              <span>{Math.abs(trend)}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl ${getIconBg()} shadow-soft group-hover:shadow-glow transition-shadow duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Decorative gradient line */}
      <div className={`h-1 mt-4 rounded-full bg-gradient-to-r ${getIconBg()} opacity-20`} />
    </div>
  );
};

// Customer/Employee Dashboard - Shows profile + purchase history only
const UserDashboard = ({ user }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refundRequests, setRefundRequests] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, refundRes] = await Promise.all([
          billingAPI.getInvoices({}),
          refundRequestAPI.getMy()
        ]);
        setInvoices(invoicesRes.data);
        setRefundRequests(refundRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  
  // Check if invoice has a pending refund request
  const getRefundStatus = (invoiceId) => {
    const request = refundRequests.find(r => 
      r.invoiceId === invoiceId && r.status === 'pending'
    );
    if (request) return { status: 'pending', request };
    
    const approved = refundRequests.find(r => 
      r.invoiceId === invoiceId && r.status === 'approved'
    );
    if (approved) return { status: 'approved', request: approved };
    
    const rejected = refundRequests.find(r => 
      r.invoiceId === invoiceId && r.status === 'rejected'
    );
    if (rejected) return { status: 'rejected', request: rejected };
    
    return null;
  };

  const handleRefundRequest = async () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund');
      return;
    }
    
    setSubmitting(true);
    try {
      await refundRequestAPI.create({
        invoiceId: selectedInvoice._id,
        reason: refundReason
      });
      alert('Refund request submitted successfully!');
      setShowRefundModal(false);
      setRefundReason('');
      
      // Refresh refund requests
      const refundRes = await refundRequestAPI.getMy();
      setRefundRequests(refundRes.data);
      
      // Refresh invoices to get updated status
      const invoicesRes = await billingAPI.getInvoices({});
      setInvoices(invoicesRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Filter invoices based on status
  const filteredInvoices = invoices.filter(inv => {
    if (filter !== 'all' && inv.status !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        inv.invoiceNumber?.toLowerCase().includes(searchLower) ||
        inv.items?.some(item => item.productName?.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.username}!</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.username}</h2>
            <p className="text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Mail className="w-5 h-5" />
                <span>{user?.email || 'No email provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Spent</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">This Month</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(
                  invoices
                    .filter(inv => {
                      const invDate = new Date(inv.createdAt);
                      const now = new Date();
                      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Purchase History</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredInvoices.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No purchases found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredInvoices.map((invoice) => (
              <div key={invoice._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                {/* Invoice Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'completed' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
                
                {/* Quick Product List */}
                <div className="flex flex-wrap gap-2">
                  {invoice.items?.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">
                      {item.quantity}x {item.productName}
                    </span>
                  ))}
                  {invoice.items?.length > 3 && (
                    <span className="px-2 py-1 text-xs text-slate-500">
                      +{invoice.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredInvoices.length > 10 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredInvoices.length} orders
            </p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Order Details</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {new Date(selectedInvoice.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedInvoice.status === 'completed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Payment Method</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{selectedInvoice.paymentMethod}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Items Purchased</h3>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Product</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Price</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900 dark:text-white">{item.productName}</p>
                            <p className="text-xs text-slate-500">{item.productCode}</p>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                            {formatCurrency(item.sellingPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tax</span>
                  <span>{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Refund Request Button & Status */}
              {selectedInvoice.status === 'completed' && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  {(() => {
                    const refundInfo = getRefundStatus(selectedInvoice._id);
                    if (!refundInfo) {
                      return (
                        <button
                          onClick={() => setShowRefundModal(true)}
                          className="w-full py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-5 h-5" />
                          Request Refund
                        </button>
                      );
                    }
                    
                    if (refundInfo.status === 'pending') {
                      return (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Refund Request Pending</span>
                          </div>
                          <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                            Your refund request is being reviewed by admin.
                          </p>
                        </div>
                      );
                    }
                    
                    if (refundInfo.status === 'approved') {
                      return (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Refund Approved</span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                            {refundInfo.request.adminResponse}
                          </p>
                        </div>
                      );
                    }
                    
                    if (refundInfo.status === 'rejected') {
                      return (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">Refund Rejected</span>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                            Reason: {refundInfo.request.adminResponse}
                          </p>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Request Refund</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedInvoice?.invoiceNumber}</p>
              </div>
              <button onClick={() => { setShowRefundModal(false); setRefundReason(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Refund Amount</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(selectedInvoice?.totalAmount)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reason for Refund <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please provide a reason for your refund request..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowRefundModal(false); setRefundReason(''); }}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefundRequest}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refundRequests, setRefundRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [topProducts, setTopProducts] = useState([]);

  // Function to fetch all dashboard data
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      const [statsRes, lowStockRes, salesRes, refundRes, topProductsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getLowStock(),
        dashboardAPI.getSalesChart(),
        refundRequestAPI.getAll({ status: 'pending' }),
        dashboardAPI.getTopProducts(30, 5)
      ]);
      setStats(statsRes.data);
      setLowStock(lowStockRes.data);
      setSalesChart(salesRes.data);
      setRefundRequests(refundRes.data);
      setTopProducts(topProductsRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and set up polling for real-time updates
  useEffect(() => {
    fetchData();

    // Poll every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this refund request? Stock will be restored.')) return;
    
    setProcessing(true);
    try {
      await refundRequestAPI.approve(requestId);
      alert('Refund request approved successfully!');
      fetchData(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve refund request');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      await refundRequestAPI.reject(selectedRequest._id, rejectReason);
      alert('Refund request rejected!');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      fetchData(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject refund request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          subtitle="In inventory"
          icon={Package}
          color="blue"
        />

        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          subtitle="All time sales"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats?.todayRevenue)}
          subtitle={`${stats?.todayInvoices || 0} transactions`}
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="This Month's Revenue"
          value={formatCurrency(stats?.monthlyRevenue)}
          subtitle={`${stats?.monthlyInvoices || 0} transactions`}
          icon={Calendar}
          color="teal"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          subtitle="Need restocking"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Pending Refunds"
          value={refundRequests.length}
          subtitle="Awaiting approval"
          icon={RefreshCw}
          color="yellow"
        />
      </div>

      {/* Quick Actions - Admin Only */}
      {true && (


        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/app/products?lowStock=true"
              className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="font-medium text-orange-700 dark:text-orange-300">Low Stock</span>
            </Link>
            <Link
              to="/app/refund-requests?status=pending"
              className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="font-medium text-yellow-700 dark:text-yellow-300">Pending Refunds</span>
            </Link>
            <Link
              to="/app/messages"
              className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-medium text-indigo-700 dark:text-indigo-300">Send Messages</span>
            </Link>
          </div>
        </div>
      )}


      {/* Low Stock Alerts and Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Low Stock Alerts
          </h2>
          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 dark:text-slate-400">
              <AlertTriangle className="w-12 h-12 mb-2 opacity-50" />
              <p>All items are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lowStock.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{item.productName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.productCode}</p>
                  </div>
                  <span className="text-red-600 dark:text-red-400 font-semibold">{item.stockQuantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products Selling */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Top Products Selling
          </h2>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
              <p>No sales data available</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {topProducts.map((product, index) => {
                const maxValue = Math.max(...topProducts.map(p => p.totalSold), 1);
                const width = (product.totalSold / maxValue) * 100;
                const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                return (
                  <div key={product._id || index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                        {product.productName}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {product.totalSold} sold
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${width}%`, backgroundColor: colors[index % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Refund Requests Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pending Refund Requests
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review and process customer refund requests
          </p>
        </div>
        
        {refundRequests.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pending refund requests</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {refundRequests.map((request) => (
              <div key={request._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {request.invoiceNumber}
                      </p>
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Customer: {request.customerName} | Amount: {formatCurrency(request.totalAmount)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Requested: {new Date(request.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(request)}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
                
                {/* Reason */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Reason for Refund:
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {request.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Refund Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Reject Refund Request</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedRequest?.invoiceNumber}</p>
              </div>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedRequest(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Refund Amount</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(selectedRequest?.totalAmount)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this refund request..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedRequest(null); }}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component - decides which dashboard to show based on role
const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  
  // Only admins see the full admin dashboard
  // Employees and customers see the simplified user dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  return <UserDashboard user={user} />;
};

export default Dashboard;

