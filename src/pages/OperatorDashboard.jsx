import { useState, useEffect } from 'react';
import { Scan, Plus, CheckCircle, AlertCircle, Package, Workflow } from 'lucide-react';
import { qrCodeAPI, manufacturingConfigAPI, rawMaterialAPI, productionLogAPI, processingStageAPI, assemblyAPI } from '../api/api';
import toast from 'react-hot-toast';

const OperatorDashboard = () => {
  const [scannedQR, setScannedQR] = useState(null);
  const [config, setConfig] = useState(null);
  const [actionType, setActionType] = useState('in_production');
  const [quantity, setQuantity] = useState(0);
  const [operator, setOperator] = useState('');
  const [weightData, setWeightData] = useState({ totalWeight: '', unitWeight: '' });
  const [loading, setLoading] = useState(false);
  const hasAdditionalStages = Array.isArray(config?.stages) && config.stages.length > 1;

  const handleScan = async () => {
    const qrId = prompt('Enter QR ID:');
    if (!qrId) return;

    try {
      const response = await qrCodeAPI.getByQRId(qrId);
      setScannedQR(response.data);

      try {
        // Config can be missing; barcode/QR flow should still work.
        const configResponse = await manufacturingConfigAPI.getByCode(response.data.code);
        setConfig(configResponse.data);
      } catch (configError) {
        setConfig(null);
        toast.error(configError?.response?.data?.message || 'Workflow config not found for this barcode');
      }

      toast.success('QR Code scanned successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to find QR Code');
      setScannedQR(null);
      setConfig(null);
    }
  };

  const handleWeightValidation = async () => {
    if (!scannedQR) return;
    
    try {
      const totalWeight = parseFloat(weightData.totalWeight);
      const unitWeight = parseFloat(weightData.unitWeight);
      const calculatedQty = Math.floor(totalWeight / unitWeight);
      
      const response = await rawMaterialAPI.create({
        qrId: scannedQR._id,
        code: scannedQR.code,
        batchNo: scannedQR.batchNo || 'AUTO',
        totalWeight,
        unitWeight,
        quantity: calculatedQty
      });
      
      toast.success(`Validated: ${calculatedQty} units`);
      setWeightData({ totalWeight: '', unitWeight: '' });
    } catch (error) {
      toast.error('Validation failed');
    }
  };

  const handleProductionEntry = async () => {
    if (!scannedQR) return;
    
    try {
      const response = await productionLogAPI.create({
        qrId: scannedQR._id,
        code: scannedQR.code,
        quantity: parseInt(quantity),
        stage: config?.currentStage || 1,
        stageType: actionType,
        operator
      });
      
      const updateResponse = await qrCodeAPI.updateProgress(scannedQR._id, {
        stageNumber: config?.currentStage || 1,
        stageType: actionType,
        quantity: parseInt(quantity),
        operator
      });

      // For non-manufacturing stages (completed/void/used_in_assembly), QR progress handler should set QR.status
      // based on `stageType` enum values.

      
      toast.success('Production entry recorded');
      setQuantity(0);
      setOperator('');
    } catch (error) {
      toast.error('Failed to record production');
    }
  };

  const handleProcessingStage = async () => {
    if (!scannedQR || !config) return;
    
    try {
      const stageNumber = 2;
      
      const response = await processingStageAPI.create({
        qrId: scannedQR._id,
        code: scannedQR.code,
        stageNumber,
        stageName: 'Secondary Processing',
        inputQuantity: scannedQR.quantity,
        operator
      });
      const refreshedQR = await qrCodeAPI.getById(scannedQR._id);
      setScannedQR(refreshedQR.data);
      
      toast.success('Processing stage started');
    } catch (error) {
      toast.error('Failed to start processing stage');
    }
  };

  const handleCompleteProcessingStageAndAssemble = async () => {
    if (!scannedQR || !config) return;

    try {
      const outQtyRaw = prompt('Enter output quantity for this processing stage:', String(scannedQR.quantity || 0));
      const outputQuantity = parseInt(outQtyRaw, 10);
      if (!Number.isFinite(outputQuantity)) {
        toast.error('Invalid output quantity');
        return;
      }

      // In current UI we always create stageNumber=2 for 2-step workflows
      const stageNumber = 2;

      // Fetch the most recent stage for this QR + stageNumber
      const stagesRes = await processingStageAPI.getAll({ qrId: scannedQR._id, stageNumber });
      const stage = (stagesRes.data || [])[0] || null;

      if (!stage) {
        toast.error('No processing stage found to complete');
        return;
      }

      await processingStageAPI.update(stage._id, {
        outputQuantity,
        operator,
        validated: true
      });

      // Optional: complete stage in pipeline
      await processingStageAPI.complete(stage._id);

      // Create a minimal assembly using this QR as a single component.
      // helmetId is required by backend; use prompt.
      const helmetId = prompt('Enter helmetId for assembly:');
      if (!helmetId) {
        toast.error('helmetId is required');
        return;
      }

      await assemblyAPI.create({
        helmetId,
        components: [
          {
            qrId: scannedQR._id,
            code: scannedQR.code,
            quantityUsed: outputQuantity,
            stage: stageNumber
          }
        ],
        remarks: `Auto-assembled from stage ${stageNumber}`,
        assembledBy: operator
      });
      const refreshedQR = await qrCodeAPI.getById(scannedQR._id);
      setScannedQR(refreshedQR.data);

      toast.success('Stage output recorded and assembly created');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to complete stage and assemble');
    }
  };

  const renderWorkflowStatus = () => {
    if (!config) return null;
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Workflow Progress</h3>
        <div className="flex items-center justify-between">
          {config.stages.map((stage, index) => {
            const isCompleted = scannedQR?.stagesCompleted?.some(s => s.stageNumber === stage.stageNumber && s.validated);
            const isCurrent = scannedQR?.currentStage === stage.stageNumber || (!isCompleted && index === 0);
            
            return (
              <div key={stage.stageNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary-500 animate-pulse' : 'bg-slate-300'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5 text-white" /> : <span className="text-white font-bold">{stage.stageNumber}</span>}
                </div>
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{stage.stageName}</span>
                {index < config.stages.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-slate-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Operator Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Scan QR codes and record production data</p>
          </div>
          <button
            onClick={handleScan}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-lg"
          >
            <Scan className="w-5 h-5" /> Scan QR Code
          </button>
        </div>

        {scannedQR && (
          <>
            {renderWorkflowStatus()}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Product Info</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">QR ID:</span> {scannedQR.qrId}</p>
                  <p><span className="font-medium">Code:</span> {scannedQR.code}</p>
                  <p><span className="font-medium">Current Quantity:</span> {scannedQR.quantity}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      scannedQR.status === 'completed' ? 'bg-green-100 text-green-700' :
                      scannedQR.status === 'in_production' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {scannedQR.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weight Validation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Weight</label>
                    <input
                      type="number"
                      value={weightData.totalWeight}
                      onChange={e => setWeightData({ ...weightData, totalWeight: e.target.value })}
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="Enter total weight"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit Weight</label>
                    <input
                      type="number"
                      value={weightData.unitWeight}
                      onChange={e => setWeightData({ ...weightData, unitWeight: e.target.value })}
                      step="0.001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="Enter unit weight"
                    />
                  </div>
                  <button
                    onClick={handleWeightValidation}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Validate & Calculate
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Production Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Action Type</label>
                  <select
                    value={actionType}
                    onChange={e => setActionType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="in_production">in production</option>
                    <option value="processing">processing</option>
                    <option value="completed">completed</option>
                    <option value="used_in_assembly">used in assembly</option>
                    <option value="void">void</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Operator Name</label>
                  <input
                    type="text"
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Enter operator name"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleProductionEntry}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Record Production
                </button>
                {hasAdditionalStages && (
                  <>
                    <button
                      onClick={handleProcessingStage}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Workflow className="w-4 h-4" /> Start Processing
                    </button>
                    <button
                      onClick={handleCompleteProcessingStageAndAssemble}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" /> Complete & Create Assembly
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {!scannedQR && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center">
            <Scan className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Ready to Scan</h3>
            <p className="text-slate-600 dark:text-slate-400">Click the scan button to start recording production data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;




