import { useState, useEffect } from 'react';
import { 
  RefreshCcw, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  X,
  Plus,
  Check,
  Ban
} from 'lucide-react';
import { refundRequestAPI, billingAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value || 0);
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };
  
  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const RefundRequestModal = ({ request, onClose, onApprove, onReject }) => {
  const { isAdmin } = useAuth();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Refund Request Details</h2>
            <p className="text-sm text-slate-500">{request.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Customer</p>
              <p className="font-medium text-slate-900 dark:text-white">{request.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <StatusBadge status={request.status} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Request Date</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reason</p>
              <p className="font-medium text-slate-900 dark:text-white">{request.reason}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Items</h3>
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
                  {request.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{item.productName}</p>
                        <p className="text-sm text-slate-500">{item.productCode}</p>
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
              <span>{formatCurrency(request.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax</span>
              <span>{formatCurrency(request.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-slate-900 dark:text-white">
              <span>Total</span>
              <span className="text-primary-600 dark:text-primary-400">{formatCurrency(request.totalAmount)}</span>
            </div>
          </div>

          {/* Admin Response */}
          {request.adminResponse && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Admin Response</p>
              <p className="text-slate-900 dark:text-white">{request.adminResponse}</p>
              {request.processedBy && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Processed by: {request.processedBy.username}
                </p>
              )}
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && request.status === 'pending' && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              {showRejectForm ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => onReject(request._id, rejectReason)}
                      className="flex-1 py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Ban className="w-5 h-5" />
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => onApprove(request._id)}
                    className="flex-1 py-3 px-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Approve Refund
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reject Refund
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateRefundModal = ({ invoices, onClose, onSubmit }) => {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);

  useEffect(() => {
    if (selectedInvoice) {
      const invoice = invoices.find(inv => inv._id === selectedInvoice);
      setSelectedInvoiceData(invoice);
    }
  }, [selectedInvoice, invoices]);

  const handleSubmit = async () => {
    if (!selectedInvoice || !reason.trim()) {
      alert('Please select an invoice and provide a reason');
      return;
    }
    setLoading(true);
    await onSubmit({ invoiceId: selectedInvoice, reason });
    setLoading(false);
  };

  // Filter out already refunded invoices
  const availableInvoices = invoices.filter(inv => inv.status !== 'refunded');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Request Refund</h2>
            <p className="text-sm text-slate-500">Submit a refund request</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Invoice Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Invoice
            </label>
            <select
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Select an invoice...</option>
              {availableInvoices.map((invoice) => (
                <option key={invoice._id} value={invoice._id}>
                  {invoice.invoiceNumber} - {formatCurrency(invoice.totalAmount)} ({new Date(invoice.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Invoice Preview */}
          {selectedInvoiceData && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Customer:</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedInvoiceData.customerName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Items:</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedInvoiceData.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500">Payment:</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{selectedInvoiceData.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total:</p>
                  <p className="font-medium text-primary-600 dark:text-primary-400">{formatCurrency(selectedInvoiceData.totalAmount)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reason for Refund
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you are requesting a refund..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedInvoice || !reason.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg disabled:bg-slate-300 dark:disabled:bg-slate-600 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RefreshCcw className="w-5 h-5" />
                Submit Refund Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const RefundRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchRequests();
    if (!isAdmin) {
      fetchInvoices();
    }
  }, [isAdmin]);

  const fetchRequests = async () => {
    try {
      const response = await refundRequestAPI.getAll({});
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch refund requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await billingAPI.getInvoices({});
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  const handleViewRequest = async (id) => {
    try {
      const response = await refundRequestAPI.getAll({});
      const request = response.data.find(r => r._id === id);
      setSelectedRequest(request);
    } catch (error) {
      console.error('Failed to fetch request details:', error);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve this refund request?')) return;
    try {
      await refundRequestAPI.approve(id);
      alert('Refund request approved successfully');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve refund request');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await refundRequestAPI.reject(id, reason);
      alert('Refund request rejected');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject refund request');
    }
  };

  const handleCreateRequest = async (data) => {
    try {
      await refundRequestAPI.create(data);
      alert('Refund request submitted successfully');
      setShowCreateModal(false);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create refund request');
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      req.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count pending for admin badge
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAdmin ? 'Refund Requests' : 'My Refund Requests'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isAdmin ? 'Manage customer refund requests' : 'View and request refunds'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg rounded-xl"
          >
            <Plus className="w-5 h-5" />
            Request Refund
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl capitalize flex items-center gap-2 ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'pending' && pendingCount > 0 && (
                <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
            <RefreshCcw className="w-12 h-12 mb-4" />
            <p>No refund requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Invoice</th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900 dark:text-white">{request.invoiceNumber}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{request.customerName}</td>
                    )}
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {formatCurrency(request.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewRequest(request._id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Refund Modal */}
      {showCreateModal && (
        <CreateRefundModal
          invoices={invoices}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRequest}
        />
      )}

      {/* View Request Modal */}
      {selectedRequest && (
        <RefundRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default RefundRequests;

