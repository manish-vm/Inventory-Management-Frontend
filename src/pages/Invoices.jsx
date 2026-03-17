import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Eye, 
  RefreshCcw,
  Loader2,
  X,
  Download
} from 'lucide-react';
import { billingAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const InvoiceDetailModal = ({ invoice, onClose, onRefund, onDownloadPDF }) => {
  const { isAdmin } = useAuth();
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Invoice Details</h2>
            <p className="text-sm text-slate-500">{invoice.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {new Date(invoice.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                invoice.status === 'completed' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : invoice.status === 'refunded'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Customer</p>
              <p className="font-medium text-slate-900 dark:text-white">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cashier</p>
              <p className="font-medium text-slate-900 dark:text-white">{invoice.cashier?.name || 'Unknown'}</p>
            </div>
            {invoice.referredEmployee && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Referred By</p>
                <p className="font-medium text-slate-900 dark:text-white">{invoice.referredEmployee.name || 'Unknown'}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Payment Method</p>
              <p className="font-medium text-slate-900 dark:text-white capitalize">{invoice.paymentMethod}</p>
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
                  {invoice.items.map((item, index) => (
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
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-slate-900 dark:text-white">
              <span>Total</span>
              <span className="text-primary-600 dark:text-primary-400">{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onDownloadPDF(invoice._id)}
              className="flex-1 py-3 px-4 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-xl flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            {isAdmin && invoice.status === 'completed' && (
              <button
                onClick={() => onRefund(invoice._id)}
                className="flex-1 py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                Refund Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filter, setFilter] = useState('all');
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      const response = await billingAPI.getInvoices({});
      let data = response.data;
      
      // Backend already filters, no client-side needed
      if (filter !== 'all') {
        data = data.filter(inv => inv.status === filter);
      }
      
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (id) => {
    try {
      const response = await billingAPI.getInvoiceById(id);
      setSelectedInvoice(response.data);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    }
  };

  const handleRefund = async (id) => {
    if (!confirm('Are you sure you want to refund this invoice? Stock will be restored.')) return;
    try {
      await billingAPI.refund(id);
      alert('Invoice refunded successfully');
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Refund failed');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await billingAPI.downloadInvoicePDF(id);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400">View all transactions</p>
        </div>
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
          {['all', 'completed', 'refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
            <Receipt className="w-12 h-12 mb-4" />
            <p>No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Invoice #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900 dark:text-white">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{invoice.customerName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{invoice.items.length} items</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : invoice.status === 'refunded'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadPDF(invoice._id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewInvoice(invoice._id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onRefund={handleRefund}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default Invoices;

