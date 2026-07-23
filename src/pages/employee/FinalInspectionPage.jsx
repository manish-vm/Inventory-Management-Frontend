import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, PackageSearch } from 'lucide-react';
import { inspectionAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import QRScanner from '../../components/employeeScanner/QRScanner';
import InspectionResponseSection from '../../components/employeeScanner/InspectionResponseSection';
import ProductInfoCard from '../../components/employeeScanner/ProductInfoCard';

const missingDefectDetailForCount = (values = {}) =>
  Object.values(values).some((item) => {
    if (item?.type !== 'count') return false;
    const count = Number(item.answer || 0);
    if (count <= 0 || String(item.defectDetail || item.question || '').trim()) return false;
    const optionKey = String(item.optionKey || '');
    if (optionKey === '__response__') return true;
    const questionId = String(item.questionId || item.question || '');
    return Object.values(values).some((candidate) => (
      candidate?.type !== 'count' &&
      String(candidate?.questionId || candidate?.question || '') === questionId &&
      answerValues(candidate.answer).includes(optionKey)
    ));
  });

function answerValues(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (value === null || value === undefined) return [];
  const text = String(value).trim();
  return text ? [text] : [];
}

const deriveSelectedCounts = (values = {}) => {
  const selectedByQuestion = {};
  let freeFormTotal = 0;
  let optionTotal = 0;

  Object.values(values).forEach((item) => {
    if (item?.type === 'count') return;
    const questionId = String(item?.questionId || item?.question || '');
    if (!questionId) return;
    selectedByQuestion[questionId] = new Set(answerValues(item.answer));
  });

  Object.values(values).forEach((item) => {
    if (item?.type !== 'count') return;
    const count = Number(item.answer || 0);
    if (!Number.isFinite(count) || count <= 0) return;
    const questionId = String(item?.questionId || item?.question || '');
    const optionKey = String(item?.optionKey || '');
    if (optionKey === '__response__') {
      freeFormTotal += count;
      return;
    }
    if (selectedByQuestion[questionId]?.has(optionKey)) optionTotal += count;
  });

  return optionTotal + freeFormTotal;
};

const FinalInspectionPage = () => {
  const { user } = useAuth();
  const { themeFactory } = useTheme();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [lookupData, setLookupData] = useState(null);
  const [selectedStageNumber, setSelectedStageNumber] = useState('');
  const [inspectionValues, setInspectionValues] = useState({});
  const [rejectionValues, setRejectionValues] = useState({});
  const [reworkValues, setReworkValues] = useState({});
  const [counts, setCounts] = useState({ accepted: 0, rejected: 0, rework: 0 });
  const [activeQuantityMode, setActiveQuantityMode] = useState(null);
  const [selectedInspectionType, setSelectedInspectionType] = useState(null);

  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const productDetailsRef = useRef(null);

  const product = lookupData?.product;
  const availableCount = Number(product?.availableCount || 0);

  const selectedStage = useMemo(
    () =>
      lookupData?.stages?.find(
        (stage) => Number(stage.stageNumber) === Number(selectedStageNumber)
      ),
    [lookupData, selectedStageNumber]
  );
  const isOpenIntakeStage = Number(selectedStageNumber) === 1;

  const totalAcceptedDerived = useMemo(() => {
    return deriveSelectedCounts(inspectionValues);
  }, [inspectionValues]);

  const totalRejectedDerived = useMemo(() => {
    return deriveSelectedCounts(rejectionValues);
  }, [rejectionValues]);

  const totalReworkDerived = useMemo(() => {
    return deriveSelectedCounts(reworkValues);
  }, [reworkValues]);

  const totalEntered =
    (lookupData?.forms?.length && Object.keys(inspectionValues).length ? totalAcceptedDerived : Number(counts.accepted || 0)) +
    Number(totalRejectedDerived || 0) +
    Number(totalReworkDerived || 0);

  const quantityError =
    !isOpenIntakeStage && totalEntered > availableCount
      ? `Accepted + Rejected + Rework counts cannot exceed the available quantity.`
      : totalEntered < 0
        ? `Accepted + Rejected + Rework counts must be zero or more.`
        : '';

  useEffect(() => {
    const q = search.trim();
    const handle = setTimeout(async () => {
      if (!q && !dropdownOpen) {
        setSuggestions([]);
        setSuggestionsError('');
        return;
      }
      try {
        setSuggestionsLoading(true);
        setSuggestionsError('');
        const response = await inspectionAPI.searchProducts({ q, finalStage: true });
        setSuggestions(response.data || []);
      } catch (error) {
        setSuggestions([]);
        setSuggestionsError(!user?.assignedFinalStageRole ? 'No final stage role has been assigned yet' : (error.response?.data?.message || 'Unable to load assigned products'));
      } finally {
        setSuggestionsLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [search, dropdownOpen]);

  useEffect(() => {
    if (!product) return;
    const scrollHandle = window.setTimeout(() => {
      productDetailsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

    return () => window.clearTimeout(scrollHandle);
  }, [product?.productId, product?.code, product?.productName]);

  const loadProduct = async (key, { showToast = true } = {}) => {
    if (!key) return;
    setLoading(true);
    try {
      const response = await inspectionAPI.lookupBatchProduct(key, { finalStage: true });
      setLookupData(response.data);

      const backendCurrentStageNumber =
        response.data.stage?.stageNumber ||
        response.data.product?.currentStageNumber;
      const currentSelectable = response.data.stages?.find(
        (stage) =>
          Number(stage.stageNumber) === Number(backendCurrentStageNumber) &&
          stage.selectable
      );
      const firstSelectable =
        currentSelectable ||
        response.data.stages?.find((stage) => stage.selectable && Number(stage.availableCount || 0) > 0) ||
        response.data.stages?.find((stage) => stage.selectable);
      const initialStageNumber = firstSelectable?.stageNumber || backendCurrentStageNumber || '';
      setSelectedStageNumber(initialStageNumber);

      setInspectionValues({});
      setRejectionValues({});
      setReworkValues({});
      setCounts({ accepted: 0, rejected: 0, rework: 0 });
      setRemarks('');
      setSelectedInspectionType(null);
      setSuggestions([]);
      setDropdownOpen(false);
      if (showToast) toast.success('Product batch loaded');

      if (initialStageNumber && response.data.product) {
        const stageForUi = (response.data.stages || []).find(
          (s) => Number(s.stageNumber) === Number(initialStageNumber)
        );
        if (stageForUi) {
          setLookupData((current) => ({
            ...current,
            product: {
              ...current?.product,
              availableCount: Number(stageForUi.availableCount || 0)
            }
          }));
        }
        try {
          const [rejectionRes] = await Promise.all([
            inspectionAPI.getFormsByStage(initialStageNumber, {
              code: response.data.product.code,
              productName: response.data.product.productName,
              formType: 'rejection',
              finalStage: true
            })
          ]);
          setLookupData((current) => ({
            ...current,
            forms: [],
            rejectionForms: rejectionRes.data || [],
            reworkForms: []
          }));
        } catch {
          // Silent — forms will load when stage is clicked
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Product lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const loadStageForms = async (stageNumber) => {
    setSelectedStageNumber(stageNumber);
    setInspectionValues({});
    setRejectionValues({});
    setReworkValues({});
    setCounts({ accepted: 0, rejected: 0, rework: 0 });
    setRemarks('');
    setSelectedInspectionType(null);

    if (!product || !stageNumber) return;

    const stageForUi = (lookupData?.stages || []).find(
      (s) => Number(s.stageNumber) === Number(stageNumber)
    );

    if (stageForUi) {
      setLookupData((current) => ({
        ...current,
        product: {
          ...current?.product,
          availableCount: Number(stageForUi.availableCount || 0)
        }
      }));
    }

    try {
      const [rejectionRes] = await Promise.all([
        inspectionAPI.getFormsByStage(stageNumber, {
          code: product.code,
          productName: product.productName,
          formType: 'rejection',
          finalStage: true
        })
      ]);

      setLookupData((current) => ({
        ...current,
        forms: [],
        rejectionForms: rejectionRes.data || current?.rejectionForms || [],
        reworkForms: []
      }));

    } catch {
      toast.error('Failed to load stage forms');
    }
  };

  const submit = async () => {
    if (!product || !selectedStage) return;

    if (totalEntered <= 0) {
      toast.error('Enter at least one processed item');
      return;
    }

    if (quantityError) {
      toast.error(quantityError);
      return;
    }

    if (!isOpenIntakeStage && totalEntered > availableCount) {
      toast.error('Accepted + Rejected + Rework counts cannot exceed the available quantity.');
      return;
    }

    if (totalRejectedDerived > 0 && missingDefectDetailForCount(rejectionValues)) {
      toast.error('Enter a reject count for the selected reason details');
      return;
    }

    if (totalReworkDerived > 0 && missingDefectDetailForCount(reworkValues)) {
      toast.error('Enter a rework count for the selected reason details');
      return;
    }

    setSubmitting(true);
    try {
      await inspectionAPI.submitEmployeeResponse({
        productId: product.productId,
        code: product.code,
        batchNo: product.batchNo,
        productName: product.productName,
        stageId: selectedStage.stageNumber,
        stageName: selectedStage.stageName,
        productionLine: selectedStage.productionLine || '',
        reportType: selectedStage.reportType || '',
        processKey: selectedStage.processKey || '',
        processName: selectedStage.processName || selectedStage.stageName || '',
        partKey: selectedStage.partKey || '',
        partName: selectedStage.partName || product.partDescription || product.productName || '',
        acceptedCount: lookupData?.forms?.length && Object.keys(inspectionValues).length ? totalAcceptedDerived : Number(counts.accepted || 0),
        rejectedCount: totalRejectedDerived > 0 ? totalRejectedDerived : Number(counts.rejected || 0),
        reworkCount: 0,
        inspectionFormResponses: Object.values(inspectionValues),
        rejectionFormResponses: Object.values(rejectionValues),
        reworkFormResponses: [],
        finalStage: true,
        remarks,
        submittedAt: new Date().toISOString()
      });

      toast.success('Final inspection submitted');
      setInspectionValues({});
      setRejectionValues({});
      setReworkValues({});
      setCounts({ accepted: 0, rejected: 0, rework: 0 });
      setRemarks('');
      setSelectedInspectionType(null);
      await loadProduct(product.productName || product.code, { showToast: false });
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to submit final inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetected = (decodedText) => {
    if (!decodedText) return;
    const key = String(decodedText).trim();
    if (!key) return;
    setSearch(key);
    loadProduct(key);
  };

  const handleDropdownOpen = () => {
    setDropdownOpen(true);
  };

  return (
    <div className={`min-h-screen ${themeFactory.classFor('page')}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={`rounded-lg p-6 shadow-sm ${themeFactory.classFor('hero')}`}>
          <p className={`text-sm font-semibold uppercase tracking-wide ${themeFactory.classFor('heroEyebrow')}`}>
            Manufacturing Execution System
          </p>
          <h1 className="mt-2 text-2xl font-bold">Final Inspection</h1>
          <p className={`mt-1 max-w-3xl ${themeFactory.classFor('heroBody')}`}>
            Enter the product name, choose your working stage, and submit final inspection results.
          </p>
        </div>

        <QRScanner onDetected={handleDetected} />

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <PackageSearch className="h-5 w-5" />
            Product Search
          </h2>

          <div className="relative">
            <input
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                if (!value.trim() && product) {
                  setLookupData(null);
                  setSelectedStageNumber('');
                  setInspectionValues({});
                  setRejectionValues({});
                  setReworkValues({});
                  setCounts({ accepted: 0, rejected: 0, rework: 0 });
                }
                setDropdownOpen(true);
              }}
              onFocus={() => {
                handleDropdownOpen();
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const q = search.trim();
                if (!q) return;
                loadProduct(q);
              }}
              placeholder="Search or select product"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 dark:border-slate-600 dark:bg-slate-900"
            />

            <button
              type="button"
              onClick={handleDropdownOpen}
              className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              aria-label="Open dropdown"
            >
              <ChevronDown className="h-4 w-4" />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {suggestionsLoading ? (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    Loading assigned products...
                  </div>
                ) : suggestionsError ? (
                  <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {suggestionsError}
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {!user?.assignedFinalStageRole ? 'No final stage role has been assigned yet' : (search.trim() ? 'No assigned products match your search.' : 'No products are assigned to your final stage role.')}
                  </div>
                ) : suggestions.map((item) => (
                    <button
                      key={`${item.productId || item.code}-${item.batchNo || item.productName}`}
                      type="button"
                      onClick={() => {
                        setSearch(item.productName);
                        setDropdownOpen(false);
                        loadProduct(item.productName);
                      }}
                      className="block w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span className="block font-semibold text-slate-900 dark:text-white">
                        {item.productName}
                      </span>
                      <span className="text-sm text-slate-500">
                        {item.code ? `Code ${item.code}` : 'Product'}
                      </span>
                    </button>
                ))}
              </div>
            )}
          </div>

          {!user?.assignedFinalStageRole && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              No final stage role has been assigned to your account. Please contact your administrator.
            </p>
          )}

          <button
            onClick={() => {
              const q = search.trim();
              if (!q) return;
              loadProduct(q);
            }}
            disabled={loading || !user?.assignedFinalStageRole}
            className="mt-3 rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Proceed'}
          </button>
        </section>

        {product && (
          <>
            <div ref={productDetailsRef} className="scroll-mt-4">
              <ProductInfoCard
                product={{
                  ...product,
                  currentStage: selectedStage?.stageName || product?.currentStage || '',
                  currentStageNumber: selectedStage?.stageNumber || product?.currentStageNumber,
                  currentStageName: selectedStage?.stageName || product?.currentStage
                }}
              />
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Current Working Stage
              </h2>
              <div className="grid gap-3 md:grid-cols-5">
                {(lookupData.stages || []).map((stage) => {
                  const isSelected = Number(stage.stageNumber) === Number(selectedStageNumber);

                  return <button
                    key={stage.stageNumber}
                    type="button"
                    disabled={!stage.selectable}
                    onClick={() => loadStageForms(stage.stageNumber)}
                    aria-pressed={isSelected}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300 ring-offset-2 dark:border-emerald-400 dark:bg-emerald-600 dark:ring-emerald-700 dark:ring-offset-slate-800'
                        : stage.selectable
                          ? 'border-slate-300 bg-white text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20'
                        : 'border-slate-200 bg-slate-100 text-slate-400 opacity-45 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500'
                    } disabled:cursor-not-allowed`}
                  >
                    <span className={`block text-xs uppercase ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      Stage {stage.stageNumber}{isSelected ? ' - Selected' : ''}
                    </span>
                    <span className="font-semibold">{stage.stageName}</span>
                    {Number(stage.stageNumber) > 1 && stage.availableCount !== undefined && (
                      <span className={`mt-1 block text-xs ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {Number(stage.availableCount || 0)} available
                      </span>
                    )}
                  </button>
                })}
              </div>
            </section>

            <InspectionResponseSection
              counts={counts}
              setCounts={setCounts}
              derivedTotals={{ accepted: totalAcceptedDerived, rejected: totalRejectedDerived, rework: totalReworkDerived }}
              availableCount={availableCount}
              unlimitedQuantity={isOpenIntakeStage}
              totalEntered={totalEntered}
              quantityError={quantityError}
              remarks={remarks}
              setRemarks={setRemarks}
              onSubmit={submit}
              submitting={submitting}
              selectedInspectionType={selectedInspectionType}
              setSelectedInspectionType={setSelectedInspectionType}
              inspectionForms={lookupData.forms || []}
              rejectionForms={lookupData.rejectionForms || []}
              reworkForms={lookupData.reworkForms || []}
              valuesWrapperInspection={inspectionValues}
              valuesWrapperRejection={rejectionValues}
              valuesWrapperRework={reworkValues}
              onChangeInspection={setInspectionValues}
              onChangeRejection={setRejectionValues}
              onChangeRework={setReworkValues}
              finalStage={true}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FinalInspectionPage;
