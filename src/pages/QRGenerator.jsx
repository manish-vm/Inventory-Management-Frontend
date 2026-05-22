import { useState, useEffect } from 'react';
import { QrCode, Download, Plus, Copy } from 'lucide-react';
import { qrCodeAPI, productMasterAPI, manufacturingConfigAPI } from '../api/api';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

const statusStyles = {
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  rework: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  in_production: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  used_in_assembly: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  void: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  generated: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
};

const formatStatus = (status) => String(status || 'generated').replace(/_/g, ' ');

const QRGenerator = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [manufacturingConfigs, setManufacturingConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  
  const [formData, setFormData] = useState({
    productName: '',
    barcodeNo: '',
    quantity: 0,
    count: 1
  });

  useEffect(() => {
    fetchQRCodes();
    fetchProducts();
    fetchManufacturingConfigs();
  }, []);

  const fetchQRCodes = async () => {
    setLoading(true);
    try {
      const response = await qrCodeAPI.getAll();
      setQrCodes(response.data);
    } catch (error) {
      toast.error('Failed to fetch QR codes');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productMasterAPI.getAll();
      // productMaster entries look like { productName, productCode, partNo ... }
      setProducts(response.data.filter(p => p.productName));
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchManufacturingConfigs = async () => {
    try {
      const response = await manufacturingConfigAPI.getAll();
      setManufacturingConfigs(response.data);
    } catch (error) {
      toast.error('Failed to fetch manufacturing configurations');
    }
  };

  const getCurrentStageLabel = (qr) => {
    const stageNumber = Number(qr.currentStage || 1);
    const product = products.find((item) =>
      [item.partNo, item.productCode, item.productName].includes(qr.partNo)
    );
    const config = manufacturingConfigs.find((item) =>
      item.productName === product?.productName || item.productName === qr.partNo
    );
    const stage = config?.stages?.find((item) => Number(item.stageNumber) === stageNumber);

    if (qr.status === 'completed') return 'Completed';
    if (stage?.stageName) return `${stage.stageName} (${stageNumber})`;
    return `Stage ${stageNumber}`;
  };

  const generateQRCode = async (qrId) => {
    try {
      const url = await QRCode.toDataURL(qrId, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      return url;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await qrCodeAPI.create({
        productName: formData.productName,
        barcodeNo: formData.barcodeNo,
        quantity: parseInt(formData.quantity)
      });
      
      const qrData = await generateQRCode(response.data.qrId);
      setGeneratedQR({ ...response.data, qrData });
      toast.success('QR Code generated successfully');
      fetchQRCodes();
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    try {
      await qrCodeAPI.bulkCreate({
        productName: formData.productName,
        barcodeNo: formData.barcodeNo,
        quantity: parseInt(formData.quantity),
        count: parseInt(formData.count)
      });
      toast.success(`${formData.count} QR Codes generated successfully`);
      fetchQRCodes();
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to generate QR codes');
    }
  };

  const downloadQR = (qrId, qrData) => {
    const link = document.createElement('a');
    link.href = qrData;
    link.download = `${qrId}.png`;
    link.click();
  };

  const copyQRId = (qrId) => {
    navigator.clipboard.writeText(qrId);
    toast.success('QR ID copied to clipboard');
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">QR Code Generator</h1>
            <p className="text-slate-600 dark:text-slate-400">Generate and manage QR codes for product lifecycle</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Generate QR Code
          </button>
        </div>

        {generatedQR && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Generated QR Code</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white rounded-lg">
                <img src={generatedQR.qrData} alt="QR Code" className="w-48 h-48" />
              </div>
              <div className="flex-1">
                <p className="text-slate-600 dark:text-slate-300 mb-2">
                  <span className="font-medium">QR ID:</span> {generatedQR.qrId}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  <span className="font-medium">Product Name:</span> {generatedQR.partNo}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadQR(generatedQR.qrId, generatedQR.qrData)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={() => copyQRId(generatedQR.qrId)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy ID
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">QR ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">QR Code (variant)</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Quantity</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Current Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : qrCodes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-slate-500">No QR codes generated yet</td>
                  </tr>
                ) : (
                  qrCodes.map(qr => (
                    <tr key={qr._id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{qr.qrId}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{qr.partNo}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{qr.batchNo || '-'}</td>
                      {/* <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{qr.quantity}</td> */}
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {getCurrentStageLabel(qr)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusStyles[qr.status] || statusStyles.generated}`}>
                          {formatStatus(qr.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const qrData = await generateQRCode(qr.qrId);
                              setGeneratedQR({ ...qr, qrData });
                            }}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                            title="View QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copyQRId(qr.qrId)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            title="Copy ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setGeneratedQR(qr);
                              setShowForm(true);
                              setFormData({
                                productName: qr.partNo || '',
                                barcodeNo: qr.batchNo || '',
                                quantity: qr.quantity || 0,
                                count: 1
                              });
                            }}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4h2m-1 0v2m-7 12l-2 2m10-10l7-7a2.828 2.828 0 114 4l-7 7m-4 4l-8 8H3v-2l8-8z" />
                            </svg>
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Delete this QR code?')) return;
                              try {
                                await qrCodeAPI.delete(qr._id);
                                setGeneratedQR(null);
                                fetchQRCodes();
                                toast.success('QR Code deleted');
                              } catch (error) {
                                toast.error(error?.response?.data?.message || 'Failed to delete QR Code');
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a2 2 0 00-2-2H9a2 2 0 00-2 2m12 0H7" />
                            </svg>
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
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Generate QR Code</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Part No *</label>
<select
                     value={formData.productName}
                     onChange={e => setFormData({
                       ...formData,
                       productName: e.target.value,
                       barcodeNo: (products.find(p => p.productName === e.target.value)?.partNo) || (products.find(p => p.productName === e.target.value)?.productCode) || ''
                     })}
                     required
                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                   >
                     <option value="">Select Product</option>
                     {products.map(p => (
                       <option key={p._id} value={p.productName}>{p.productName} - {p.partNo || p.productCode}</option>
                     ))}
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Barcode No</label>
                  <input
                    type="text"
                    value={formData.barcodeNo}
                    onChange={e => setFormData({ ...formData, barcodeNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    placeholder="Product barcode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Generate Single
                </button>
                <button type="button" onClick={handleBulkGenerate} className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                  Bulk Generate
                </button>
              </div>
              <div className="mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bulk Count</label>
                  <input
                    type="number"
                    value={formData.count}
                    onChange={e => setFormData({ ...formData, count: e.target.value })}
                    min="1"
                    defaultValue="5"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="w-full mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
