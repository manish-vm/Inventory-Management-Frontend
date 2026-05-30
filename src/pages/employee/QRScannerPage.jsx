import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, PackageSearch } from 'lucide-react';
import { defectDetailAPI, inspectionAPI } from '../../api/api';
import QRScanner from '../../components/employeeScanner/QRScanner';
import InspectionResponseSection from '../../components/employeeScanner/InspectionResponseSection';
import QuestionCountGrid from '../../components/employeeScanner/QuestionCountGrid';
import ProductInfoCard from '../../components/employeeScanner/ProductInfoCard';

const DEFECT_DETAIL_KEY = '__defect_detail__';

const valuesWrapperHasDefect = (values = {}) => Boolean(values?.[DEFECT_DETAIL_KEY]?.answer);

const QRScannerPage = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lookupData, setLookupData] = useState(null);
  const [selectedStageNumber, setSelectedStageNumber] = useState('');
  const [inspectionValues, setInspectionValues] = useState({});
  const [rejectionValues, setRejectionValues] = useState({});
  const [reworkValues, setReworkValues] = useState({});
  const [counts, setCounts] = useState({ accepted: 0, rejected: 0, rework: 0 });
  const [activeQuantityMode, setActiveQuantityMode] = useState(null);
  const [selectedInspectionType, setSelectedInspectionType] = useState(null); // 'rejected' | 'rework' | null
  const [defectDetails, setDefectDetails] = useState({ reject: [], rework: [] });


  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const product = lookupData?.product;
  const availableCount = Number(product?.availableCount || 0);

  const selectedStage = useMemo(
    () =>
      lookupData?.stages?.find(
        (stage) => Number(stage.stageNumber) === Number(selectedStageNumber)
      ),
    [lookupData, selectedStageNumber]
  );

  const totalRejectedDerived = useMemo(() => {
    // Sum all per-option count inputs created by QuestionCountGrid
    const keys = Object.keys(rejectionValues || {});
    let sum = 0;
    for (const k of keys) {
      if (k.includes('::__count__::')) {
        const ans = Number(rejectionValues?.[k]?.answer);
        if (Number.isFinite(ans)) sum += ans;
      }
    }
    return sum;
  }, [rejectionValues]);

  const totalReworkDerived = useMemo(() => {
    const keys = Object.keys(reworkValues || {});
    let sum = 0;
    for (const k of keys) {
      if (k.includes('::__count__::')) {
        const ans = Number(reworkValues?.[k]?.answer);
        if (Number.isFinite(ans)) sum += ans;
      }
    }
    return sum;
  }, [reworkValues]);

  const totalEntered =
    Number(counts.accepted || 0) +
    Number(totalRejectedDerived || 0) +
    Number(totalReworkDerived || 0);


  const quantityError =
    totalEntered > availableCount
      ? `Accepted + Rejected + Rework counts must equal the available quantity.`
      : totalEntered < availableCount
        ? `Accepted + Rejected + Rework counts must equal the available quantity.`
        : '';

  useEffect(() => {
    const fetchDefectDetails = async () => {
      try {
        const [rejectRes, reworkRes] = await Promise.all([
          defectDetailAPI.getAll({ type: 'reject', isActive: true }),
          defectDetailAPI.getAll({ type: 'rework', isActive: true })
        ]);
        setDefectDetails({
          reject: rejectRes.data || [],
          rework: reworkRes.data || []
        });
      } catch {
        setDefectDetails({ reject: [], rework: [] });
      }
    };

    fetchDefectDetails();
  }, []);


  useEffect(() => {
    const q = search.trim();

    // Stage mode: after product is loaded, search/filter stages locally.
    if (product) {
      if (!q && !dropdownOpen) {
        setSuggestions([]);
        return;
      }

      const stageSuggestions = (lookupData?.stages || [])
        .filter((s) => {
          const stageNumber = String(s.stageNumber ?? '');
          const stageName = String(s.stageName ?? '');
          return (
            stageNumber.toLowerCase().includes(q.toLowerCase()) ||
            stageName.toLowerCase().includes(q.toLowerCase())
          );
        })
        .map((s) => ({
          _type: 'stage',
          stageNumber: s.stageNumber,
          stageName: s.stageName
        }));

      setSuggestions(stageSuggestions);
      return;
    }

    // Product mode: before product is loaded, API-backed product suggestions.
    const handle = setTimeout(async () => {
      if (!q && !dropdownOpen) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await inspectionAPI.searchProducts({ q });
        setSuggestions(response.data || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [search, product, lookupData, dropdownOpen]);

  const loadProduct = async (key) => {
    if (!key) return;
    setLoading(true);
    try {
      const response = await inspectionAPI.lookupBatchProduct(key);
      setLookupData(response.data);

      const firstSelectable = response.data.stages?.find((stage) => stage.selectable);
      setSelectedStageNumber(
        firstSelectable?.stageNumber || response.data.stage?.stageNumber || ''
      );

      setInspectionValues({});
      setRejectionValues({});
      setReworkValues({});
      setCounts({ accepted: 0, rejected: 0, rework: 0 });
      setRemarks('');
      setSuggestions([]);
      setDropdownOpen(false);
      toast.success('Product batch loaded');
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

    if (!product || !stageNumber) return;

    const stageForUi = (lookupData?.stages || []).find(
      (s) => Number(s.stageNumber) === Number(stageNumber)
    );

    if (stageForUi) {
      setLookupData((current) => ({
        ...current,
        product: {
          ...current?.product,
          currentStage: stageForUi.stageName,
          currentStageNumber: stageForUi.stageNumber
        }
      }));
    }

    try {
      const [inspectionRes, rejectionRes, reworkRes] = await Promise.all([
        inspectionAPI.getFormsByStage(stageNumber, {
          partNo: product.partNo,
          productName: product.productName,
          formType: 'inspection'
        }),
        inspectionAPI.getFormsByStage(stageNumber, {
          partNo: product.partNo,
          productName: product.productName,
          formType: 'rejection'
        }),
        inspectionAPI.getFormsByStage(stageNumber, {
          partNo: product.partNo,
          productName: product.productName,
          formType: 'rework'
        })
      ]);

      setLookupData((current) => {
        const next = {
          ...current,
          forms: inspectionRes.data || [],
          rejectionForms: rejectionRes.data || current?.rejectionForms || [],
          reworkForms: reworkRes.data || current?.reworkForms || []
        };

        // Debugging requirements
        console.log('Stage Data', {
          stageNumber,
          rejectionForms: next.rejectionForms,
          reworkForms: next.reworkForms
        });
        console.log('Rejection Form', next.rejectionForms);
        console.log('Rework Form', next.reworkForms);


        return next;
      });

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

    // Enforce strict equality for submission
    if (totalEntered !== availableCount) {
      toast.error('Accepted + Rejected + Rework counts must equal the available quantity.');
      return;
    }


    if ((totalRejectedDerived > 0 || totalReworkDerived > 0) && !remarks.trim()) {
      toast.error('Remarks are required for rejected or rework items');
      return;
    }

    if (totalRejectedDerived > 0 && !valuesWrapperHasDefect(rejectionValues)) {
      toast.error('Select a reject defect detail');
      return;
    }

    if (totalReworkDerived > 0 && !valuesWrapperHasDefect(reworkValues)) {
      toast.error('Select a rework defect detail');
      return;
    }


    setSubmitting(true);
    try {
      await inspectionAPI.submitEmployeeResponse({
        productId: product.productId,
        partNo: product.partNo,
        batchNo: product.batchNo,
        productName: product.productName,
        stageId: selectedStage.stageNumber,
        stageName: selectedStage.stageName,
        acceptedCount: Number(counts.accepted || 0),
        // Rejected/Rework counts are derived from questionnaire selections.
        // Provide placeholders; backend will overwrite based on rejectionFormResponses/reworkFormResponses.
        rejectedCount: Number(totalRejectedDerived || 0),
        reworkCount: Number(totalReworkDerived || 0),

        inspectionFormResponses: Object.values(inspectionValues),
        rejectionFormResponses: Object.values(rejectionValues),
        reworkFormResponses: Object.values(reworkValues),

        remarks,
        submittedAt: new Date().toISOString()
      });

      toast.success('Batch inspection submitted');
      setLookupData(null);
      setSearch('');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to submit inspection');
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

  // Arrow click: show dropdown immediately.
  // - Product mode: if search is empty, trigger an API search for current text (empty won't return anything)
  //   so we set a light default to force suggestions.
  // - Stage mode: show stage dropdown by using current search text; if empty, show all stages.
  const handleDropdownOpen = () => {
    setDropdownOpen(true);
    if (!product) {
      return;
    }

    // Stage mode: if empty, show all stages.
    if (!search.trim()) {
      setSuggestions(
        (lookupData?.stages || []).map((s) => ({
          _type: 'stage',
          stageNumber: s.stageNumber,
          stageName: s.stageName
        }))
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-lg bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
            Manufacturing Execution System
          </p>
          <h1 className="mt-2 text-2xl font-bold">Product-Based Inspection</h1>
          <p className="mt-1 max-w-3xl text-slate-200">
            Enter the product name, choose your working stage, and submit accepted, rejected, and rework quantities after external inspection.
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
                setSearch(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => {
                handleDropdownOpen();
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;


                const q = search.trim();
                if (!q) return;

                // Product mode
                if (!product) {
                  loadProduct(q);
                  return;
                }

                // Stage mode
                const match = (lookupData?.stages || []).find((s) => {
                  const stageNumber = String(s.stageNumber ?? '');
                  const stageName = String(s.stageName ?? '');
                  return (
                    stageNumber.toLowerCase() === q.toLowerCase() ||
                    stageNumber.toLowerCase().includes(q.toLowerCase()) ||
                    stageName.toLowerCase().includes(q.toLowerCase())
                  );
                });

                if (match) loadStageForms(match.stageNumber);
              }}
              placeholder={product ? 'Search stage (number / name)' : 'Search or select product'}
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

            {dropdownOpen && suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {suggestions.map((item) => {
                  if (item?._type === 'stage') {
                    return (
                      <button
                        key={`stage-${item.stageNumber}-${item.stageName}`}
                        type="button"
                        onClick={() => {
                          setSearch(`${item.stageName} ${item.stageNumber}`.trim());
                          setDropdownOpen(false);
                          loadStageForms(item.stageNumber);
                        }}
                        className="block w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="block font-semibold text-slate-900 dark:text-white">
                          Stage {item.stageNumber}
                        </span>
                        <span className="text-sm text-slate-500">{item.stageName}</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={`${item.partNo}-${item.batchNo}`}
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
                        {item.partNo ? `Part ${item.partNo}` : 'Product'}
                        {item.availableCount ? ` | ${item.availableCount} items` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const q = search.trim();
              if (!q) return;

              if (!product) {
                loadProduct(q);
                return;
              }

              // Stage mode: also driven by same search bar
              const match = (lookupData?.stages || []).find((s) => {
                const stageNumber = String(s.stageNumber ?? '');
                const stageName = String(s.stageName ?? '');
                return (
                  stageNumber.toLowerCase() === q.toLowerCase() ||
                  stageNumber.toLowerCase().includes(q.toLowerCase()) ||
                  stageName.toLowerCase().includes(q.toLowerCase())
                );
              });

              if (match) loadStageForms(match.stageNumber);
            }}
            disabled={loading}
            className="mt-3 rounded-lg bg-sky-700 px-5 py-2 font-medium text-white hover:bg-sky-800 disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Proceed'}
          </button>
        </section>

        {product && (
          <>
            <ProductInfoCard product={{ ...product, totalIdealItems: availableCount, currentStage: product.currentStage }} />

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Current Working Stage
              </h2>
              <div className="grid gap-3 md:grid-cols-5">
                {(lookupData.stages || []).map((stage) => (
                  <button
                    key={stage.stageNumber}
                    type="button"
                    disabled={!stage.selectable}
                    onClick={() => loadStageForms(stage.stageNumber)}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      Number(selectedStageNumber) === Number(stage.stageNumber)
                        ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    } disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    <span className="block text-xs uppercase text-slate-500">Stage {stage.stageNumber}</span>
                    <span className="font-semibold">{stage.stageName}</span>
                  </button>
                ))}
              </div>
            </section>

            <InspectionResponseSection
              counts={counts}
              setCounts={setCounts}
              derivedTotals={{ rejected: totalRejectedDerived, rework: totalReworkDerived }}
              availableCount={availableCount}
              totalEntered={totalEntered}
              quantityError={quantityError}
              remarks={remarks}
              setRemarks={setRemarks}
              onSubmit={submit}
              submitting={submitting}
              selectedInspectionType={selectedInspectionType}
              setSelectedInspectionType={setSelectedInspectionType}
              rejectionForms={lookupData.rejectionForms || []}
              reworkForms={lookupData.reworkForms || []}
              rejectDefectDetails={defectDetails.reject}
              reworkDefectDetails={defectDetails.rework}
              valuesWrapperRejection={rejectionValues}
              valuesWrapperRework={reworkValues}
              onChangeRejection={setRejectionValues}
              onChangeRework={setReworkValues}
            />

            {/** Dynamic rejection/rework forms are managed via derived totals.
             * Clicking the Rejected/Rework quantity tiles inside InspectionResponseSection will activate the mode.
             * This page renders the grids when there is at least one selection/count OR derived totals are non-zero.
             */}


          </>
        )}
      </div>
    </div>
  );
};

export default QRScannerPage;
