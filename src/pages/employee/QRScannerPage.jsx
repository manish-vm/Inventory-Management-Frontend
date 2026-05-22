import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { inspectionAPI } from '../../api/api';
import DynamicInspectionForm from '../../components/employeeScanner/DynamicInspectionForm';
import InspectionResponseSection from '../../components/employeeScanner/InspectionResponseSection';
import ProductInfoCard from '../../components/employeeScanner/ProductInfoCard';
import QRScanner from '../../components/employeeScanner/QRScanner';

const parseScanValue = (value) => {
  try {
    const parsed = JSON.parse(value);
    return parsed.itemId || parsed.qrId || parsed.batchNo || parsed.partNo || value;
  } catch {
    return value;
  }
};

const QRScannerPage = () => {
  const [manualValue, setManualValue] = useState('');
  const [lookupData, setLookupData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('');
  const [movementType, setMovementType] = useState('NONE');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const product = lookupData?.product;
  const scannedItemId = product?.itemId || lookupData?.itemState?.itemId || lookupData?.qrCode?.qrId || '';
  const currentIndex = useMemo(() => {
    if (!lookupData?.stages || !lookupData?.stage) return 0;
    return lookupData.stages.findIndex((stage) => Number(stage.stageNumber) === Number(lookupData.stage.stageNumber));
  }, [lookupData]);
  const canMoveBackward = currentIndex > 0;
  const canMoveForward = lookupData?.stages ? currentIndex < lookupData.stages.length - 1 : false;
  const showInspectionForm = Boolean(scannedItemId && selectedStatus === 'REJECTED');

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    if (status !== 'REJECTED') {
      setFormValues({});
    }
  };

  const lookup = async (rawValue) => {
    const value = parseScanValue(rawValue || manualValue).trim();
    if (!value) {
      toast.error('Enter Part No, Batch No, or scan a QR code');
      return;
    }

    setLoading(true);
    try {
      const response = await inspectionAPI.lookupProduct(value);
      let forms = response.data.forms || [];
      if (response.data.stage?.stageNumber) {
        try {
          const formsResponse = await inspectionAPI.getFormsByStage(response.data.stage.stageNumber, {
            partNo: response.data.product?.partNo
          });
          forms = formsResponse.data || [];
        } catch (error) {
          forms = response.data.forms || [];
        }
      }
      setLookupData({ ...response.data, forms });
      setManualValue(value);
      setFormValues({});
      setSelectedStatus('');
      setMovementType('NONE');
      setRemarks('');
      toast.success('Product details loaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Product lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!product) return;
    if (!scannedItemId) {
      toast.error('Scanned item ID is missing. Please scan or search the QR item again.');
      return;
    }
    if (!selectedStatus) {
      toast.error('Select Accepted, Rejected, or Rework');
      return;
    }
    if (movementType === 'BACKWARD' && !remarks.trim()) {
      toast.error('Remarks are mandatory for Backward movement');
      return;
    }

    setSubmitting(true);
    try {
      const activeForm = lookupData.forms?.[0] || {};
      await inspectionAPI.submitEmployeeResponse({
        employeeId: '',
        employeeName: '',
        partNo: product.partNo,
        batchNo: product.batchNo,
        qrId: scannedItemId,
        itemId: scannedItemId,
        currentStage: lookupData.stage?.stageName,
        selectedStatus,
        movementType,
        remarks,
        formId: activeForm.formId,
        formName: activeForm.formName,
        formResponses: showInspectionForm ? Object.values(formValues) : [],
        timestamp: new Date().toISOString()
      });
      toast.success('Inspection submitted and audit log created');
      setLookupData(null);
      setManualValue('');
      setFormValues({});
      setSelectedStatus('');
      setMovementType('NONE');
      setRemarks('');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to submit inspection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-lg bg-gradient-to-r from-slate-950 to-blue-950 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">Manufacturing Execution System</p>
          <h1 className="mt-2 text-2xl font-bold">Employee Product Scanner</h1>
          <p className="mt-1 max-w-3xl text-blue-100">Scan product QR codes, complete stage inspection forms, record quality decisions, and move items through controlled manufacturing stages.</p>
        </div>

        <QRScanner onDetected={(value) => lookup(value)} />

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Or Enter Part No / Batch No Manually</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') lookup();
              }}
              placeholder="BATCH-2025-001"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            />
            <button onClick={() => lookup()} disabled={loading} className="rounded-lg bg-blue-700 px-5 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </section>

        {product && (
          <>
            <ProductInfoCard product={product} />

            {showInspectionForm && (
              <section key={`${scannedItemId}-rejection-form`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dynamic Inspection Form</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Forms are loaded from the current stage configuration.</p>
                </div>
                <DynamicInspectionForm forms={lookupData.forms || []} values={formValues} onChange={setFormValues} />
              </section>
            )}

            <InspectionResponseSection
              status={selectedStatus}
              setStatus={handleStatusChange}
              movementType={movementType}
              setMovementType={setMovementType}
              remarks={remarks}
              setRemarks={setRemarks}
              onSubmit={submit}
              submitting={submitting}
              canMoveForward={canMoveForward}
              canMoveBackward={canMoveBackward}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default QRScannerPage;
