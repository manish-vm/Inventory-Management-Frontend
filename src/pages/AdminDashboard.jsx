import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { inspectionAPI, productAPI } from '../api/api';

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777'];
const colorForPieRow = (row, index) => {
  const name = String(row?.name || '').toLowerCase();
  if (name.includes('rework')) return '#f59e0b';
  if (name.includes('rejected') || name.includes('rejection')) return '#dc2626';
  if (name.includes('good') || name.includes('accepted')) return '#2563eb';
  return COLORS[index % COLORS.length];
};

const toCount = (value) => Math.max(0, Number(value) || 0);
const formatMonthValue = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const labelFromReportId = (reportId = '') => String(reportId)
  .replace(/-mis$/, '')
  .replace(/^product-category-/, 'Category ')
  .replace(/^product-subcategory-/, 'Subcategory ')
  .replace(/-all$/, '')
  .replace(/-/g, ' ');

const ChartCard = ({ title, subtitle, children }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const StatCard = ({ label, value, tone = 'slate' }) => {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white',
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300'
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
};

const EmptyChart = ({ text = 'No chart data available.' }) => (
  <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
    {text}
  </div>
);

const LegendDot = ({ color, label }) => (
  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
    {label}
  </span>
);

const HorizontalBarChart = ({ rows, mode }) => {
  const maxValue = Math.max(
    1,
    ...rows.map((row) => mode === 'mis'
      ? Math.max(row.production, row.rejection)
      : Math.max(row.production || 0, row.rejectionAndRework || row.rejection || 0, row.rejectionOnly || 0))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {(mode === 'mis' || mode === 'crs') && <LegendDot color="#2563eb" label="Production Qty" />}
        {mode === 'crs' && <LegendDot color="#f59e0b" label="Rejection & Rework Qty" />}
        <LegendDot color="#dc2626" label="Rejected Qty" />
      </div>
      <div className="max-h-80 overflow-y-auto pr-2">
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.name} className="grid gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60 md:grid-cols-[220px_1fr] md:items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={row.name}>{row.name}</p>
                {(mode === 'mis' || mode === 'crs') && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {mode === 'crs'
                      ? `${row.rejectionAndReworkPercent}% rejection & rework`
                      : `${row.rejectionPercent}% rejection`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {(mode === 'mis' || mode === 'crs') && (
                  <div className="grid grid-cols-[88px_1fr_54px] items-center gap-2">
                    <span className="text-xs text-slate-500">Production</span>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max((row.production / maxValue) * 100, 3)}%` }} />
                    </div>
                    <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-200">{row.production}</span>
                  </div>
                )}
                {mode === 'crs' && (
                  <div className="grid grid-cols-[88px_1fr_54px] items-center gap-2">
                    <span className="text-xs text-slate-500">Rej+Rew</span>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.max((row.rejectionAndRework / maxValue) * 100, 3)}%` }} />
                    </div>
                    <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-200">{row.rejectionAndRework}</span>
                  </div>
                )}
                <div className="grid grid-cols-[88px_1fr_54px] items-center gap-2">
                  <span className="text-xs text-slate-500">Rejected</span>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-red-600" style={{ width: `${Math.max(((mode === 'crs' ? row.rejectionOnly : row.rejection) / maxValue) * 100, 3)}%` }} />
                  </div>
                  <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-200">{mode === 'crs' ? row.rejectionOnly : row.rejection}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DonutChart = ({ rows }) => {
  const total = rows.reduce((sum, row) => sum + toCount(row.value), 0);
  let offset = 0;
  const gradientParts = rows.map((row, index) => {
    const start = offset;
    const end = total ? offset + (row.value / total) * 100 : offset;
    offset = end;
    return `${colorForPieRow(row, index)} ${start}% ${end}%`;
  });

  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
      <div className="relative mx-auto h-52 w-52 rounded-full" style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}>
        <div className="absolute inset-12 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner dark:bg-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-500">Total</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
        </div>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
        {rows.map((row, index) => (
          <div key={row.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60">
            <LegendDot color={colorForPieRow(row, index)} label={row.name} />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const collectMisRows = (reports) => {
  const sourceReports = Object.values(reports || {}).filter((report) =>
    String(report.reportId || '').endsWith('-mis')
  );
  const usableReports = sourceReports.length ? sourceReports : Object.values(reports || {});
  const map = new Map();

  usableReports.forEach((report) => {
    (report.processRows || []).forEach((row) => {
      const key = row.key || `${row.partName}|${row.processName}`;
      const current = map.get(key) || {
        name: `${row.partName || 'Part'} / ${row.processName || 'Process'}`,
        part: row.partName || 'Part',
        process: row.processName || 'Process',
        production: 0,
        rejection: 0
      };
      current.production += toCount(row.totalOutput);
      current.rejection += toCount(row.totalRejection);
      map.set(key, current);
    });
  });

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      rejectionPercent: row.production ? Number(((row.rejection / row.production) * 100).toFixed(2)) : 0
    }))
    .sort((a, b) => b.rejection - a.rejection || b.production - a.production);
};

const getMisSourceReports = (reports) => {
  const sourceReports = Object.values(reports || {}).filter((report) =>
    String(report.reportId || '').endsWith('-mis')
  );
  return sourceReports.length ? sourceReports : Object.values(reports || {});
};

const collectMisTotals = (reports) => getMisSourceReports(reports).reduce((acc, report) => ({
  production: acc.production + toCount(report?.totals?.output),
  rejection: acc.rejection + toCount(report?.totals?.rejectionAndRework ?? report?.totals?.rejection)
}), { production: 0, rejection: 0 });

const collectCanonicalMisTotals = (reports, selectedReportId = 'all') => {
  if (selectedReportId !== 'all') {
    return collectMisTotals(reports);
  }

  return collectMisTotals(getDefaultMisReports(reports));
};

const getDefaultMisReports = (reports) => {
  const allReports = Object.values(reports || {});
  const dynamicReports = allReports.filter((report) =>
    String(report.reportId || '').startsWith('product-')
    && String(report.reportId || '').endsWith('-mis')
  );
  const lineReports = allReports.filter((report) =>
    /^[a-z0-9]+-helmet-assembly-drr$/i.test(String(report.reportId || ''))
  );
  const sourceReports = dynamicReports.length ? dynamicReports : lineReports.length ? lineReports : getMisSourceReports(reports);
  return sourceReports.reduce((acc, report) => {
    acc[report.reportId || `report-${acc.length}`] = report;
    return acc;
  }, {});
};

const getDefaultCrsReports = (reports) => {
  const allReports = Object.values(reports || {});
  const dynamicReports = allReports.filter((report) =>
    String(report.reportId || '').startsWith('product-')
    && String(report.reportId || '').endsWith('-crs')
  );
  const lineReports = allReports.filter((report) =>
    /^d\d-helmet-assembly-drr$/i.test(String(report.reportId || ''))
  );
  const sourceReports = dynamicReports.length ? dynamicReports : lineReports.length ? lineReports : allReports.filter((report) =>
    String(report.reportId || '').endsWith('-crs')
  );
  return sourceReports.reduce((acc, report) => {
    acc[report.reportId || `report-${acc.length}`] = report;
    return acc;
  }, {});
};

const buildReportOptions = (reports, productCategories, productSubcategories, suffix) => {
  const reportIds = new Set(Object.keys(reports || {}).filter((id) => id.endsWith(suffix)));
  const options = [];

  productCategories.forEach((category) => {
    const categoryId = String(category._id || '');
    const subcategories = productSubcategories.filter((subcategory) =>
      String(subcategory.category?._id || subcategory.category || '') === categoryId
    );
    if (subcategories.length) {
      subcategories.forEach((subcategory) => {
        const reportId = `product-subcategory-${String(subcategory._id)}${suffix}`;
        if (reportIds.has(reportId)) {
          options.push({
            value: reportId,
            label: `${category.name} / ${subcategory.name}`
          });
        }
      });
    } else {
      const reportId = `product-category-${categoryId}-all${suffix}`;
      if (reportIds.has(reportId)) {
        options.push({
          value: reportId,
          label: category.name
        });
      }
    }
  });

  reportIds.forEach((reportId) => {
    if (!options.some((option) => option.value === reportId)) {
      options.push({ value: reportId, label: labelFromReportId(reportId) });
    }
  });

  return [
    { value: 'all', label: 'All categories / subcategories' },
    ...options.sort((a, b) => a.label.localeCompare(b.label))
  ];
};

const labelFromCrsReport = (reportId = '', report = {}, labelLookup = {}) => {
  if (labelLookup[reportId]) return labelLookup[reportId];
  const line = String(report.productionLine || '').toUpperCase();
  const process = String(report.processName || report.reportType || '').trim();
  if (line && process) return `${line} / ${process}`;
  if (/^d\d-helmet-assembly-drr$/i.test(reportId)) {
    return `${String(reportId).slice(0, 2).toUpperCase()} / Helmet Assembly`;
  }
  return labelFromReportId(reportId);
};

const collectCrsRows = (reports, labelLookup = {}) => {
  const allReports = Object.values(reports || {});
  const dynamicCrsReports = allReports.filter((report) =>
    String(report.reportId || '').startsWith('product-')
    && String(report.reportId || '').endsWith('-crs')
  );
  const lineReports = allReports.filter((report) =>
    /^d\d-helmet-assembly-drr$/i.test(String(report.reportId || ''))
  );
  const sourceReports = dynamicCrsReports.length ? dynamicCrsReports : lineReports.length ? lineReports : allReports.filter((report) =>
    String(report.reportId || '').endsWith('-crs')
  );

  return sourceReports
    .map((report) => {
      const totals = report?.totals || {};
      const production = toCount(totals.output);
      const rejectionAndRework = toCount(totals.rejectionAndRework ?? (toCount(totals.rejection) + toCount(totals.rework)));
      const rejectionOnly = toCount(totals.rejection);
      return {
        name: labelFromCrsReport(report.reportId, report, labelLookup),
        production,
        rejection: rejectionAndRework,
        rejectionAndRework,
        rejectionOnly,
        rejectionAndReworkPercent: production ? Number(((rejectionAndRework / production) * 100).toFixed(2)) : 0,
        rejectionPercent: production ? Number(((rejectionOnly / production) * 100).toFixed(2)) : 0
      };
    })
    .filter((row) => row.production || row.rejectionAndRework || row.rejectionOnly)
    .sort((a, b) => b.rejectionAndRework - a.rejectionAndRework || b.production - a.production || a.name.localeCompare(b.name))
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('mis');
  const [monthValue, setMonthValue] = useState(formatMonthValue());
  const [reports, setReports] = useState({});
  const [productCategories, setProductCategories] = useState([]);
  const [productSubcategories, setProductSubcategories] = useState([]);
  const [misReportFilter, setMisReportFilter] = useState('all');
  const [crsReportFilter, setCrsReportFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [year, month] = monthValue.split('-').map(Number);
    setLoading(true);
    try {
      const response = await inspectionAPI.getMisDashboard({ year, month });
      setReports(response.data.reports || {});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard charts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthValue]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      productAPI.getCategories(),
      productAPI.getSubcategories({})
    ])
      .then(([categoryResponse, subcategoryResponse]) => {
        if (!isMounted) return;
        setProductCategories(categoryResponse.data || []);
        setProductSubcategories(subcategoryResponse.data || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setProductCategories([]);
        setProductSubcategories([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const misReportOptions = useMemo(() => {
    return buildReportOptions(reports, productCategories, productSubcategories, '-mis');
  }, [productCategories, productSubcategories, reports]);

  const crsReportOptions = useMemo(() => {
    return buildReportOptions(reports, productCategories, productSubcategories, '-crs');
  }, [productCategories, productSubcategories, reports]);

  useEffect(() => {
    if (misReportFilter === 'all') return;
    if (!misReportOptions.some((option) => option.value === misReportFilter)) {
      setMisReportFilter('all');
    }
  }, [misReportFilter, misReportOptions]);

  useEffect(() => {
    if (crsReportFilter === 'all') return;
    if (!crsReportOptions.some((option) => option.value === crsReportFilter)) {
      setCrsReportFilter('all');
    }
  }, [crsReportFilter, crsReportOptions]);

  const filteredMisReports = useMemo(() => {
    if (misReportFilter === 'all') return getDefaultMisReports(reports);
    return reports[misReportFilter] ? { [misReportFilter]: reports[misReportFilter] } : {};
  }, [misReportFilter, reports]);

  const filteredCrsReports = useMemo(() => {
    if (crsReportFilter === 'all') return getDefaultCrsReports(reports);
    return reports[crsReportFilter] ? { [crsReportFilter]: reports[crsReportFilter] } : {};
  }, [crsReportFilter, reports]);

  const crsLabelLookup = useMemo(() => {
    const categoryById = new Map(productCategories.map((category) => [String(category._id || ''), category]));
    const labels = {};

    productCategories.forEach((category) => {
      const categoryId = String(category._id || '');
      if (categoryId) labels[`product-category-${categoryId}-all-crs`] = category.name;
    });

    productSubcategories.forEach((subcategory) => {
      const subcategoryId = String(subcategory._id || '');
      const categoryId = String(subcategory.category?._id || subcategory.category || '');
      const categoryName = subcategory.category?.name || categoryById.get(categoryId)?.name || '';
      const label = [categoryName, subcategory.name].filter(Boolean).join(' / ');
      if (subcategoryId && label) labels[`product-subcategory-${subcategoryId}-crs`] = label;
    });

    return labels;
  }, [productCategories, productSubcategories]);

  const misRows = useMemo(() => collectMisRows(filteredMisReports), [filteredMisReports]);
  const crsRows = useMemo(() => collectCrsRows(filteredCrsReports, crsLabelLookup), [crsLabelLookup, filteredCrsReports]);
  const currentRows = activeTab === 'mis' ? misRows : crsRows;

  const misTotals = useMemo(() => collectCanonicalMisTotals(filteredMisReports, misReportFilter), [filteredMisReports, misReportFilter]);

  const crsTotals = useMemo(() => crsRows.reduce((acc, row) => ({
    production: acc.production + toCount(row.production),
    rejectionAndRework: acc.rejectionAndRework + toCount(row.rejectionAndRework),
    rejectionOnly: acc.rejectionOnly + toCount(row.rejectionOnly)
  }), { production: 0, rejectionAndRework: 0, rejectionOnly: 0 }), [crsRows]);
  const pieRows = activeTab === 'mis'
    ? [
        { name: 'Total Production', value: Math.max(misTotals.production - misTotals.rejection, 0) },
        { name: 'Rejected', value: misTotals.rejection }
      ].filter((row) => row.value > 0)
    : [
        { name: 'Total Production', value: Math.max(crsTotals.production - crsTotals.rejectionAndRework, 0) },
        { name: 'Rejection & Rework', value: crsTotals.rejectionAndRework },
        { name: 'Rejected Only', value: crsTotals.rejectionOnly }
      ].filter((row) => row.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Visual MIS and CRS summaries from Report Management data.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {(activeTab === 'mis' || activeTab === 'crs') && (
            <select
              value={activeTab === 'mis' ? misReportFilter : crsReportFilter}
              onChange={(event) => {
                if (activeTab === 'mis') {
                  setMisReportFilter(event.target.value);
                } else {
                  setCrsReportFilter(event.target.value);
                }
              }}
              className="min-w-[260px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              {(activeTab === 'mis' ? misReportOptions : crsReportOptions).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
          <input
            type="month"
            value={monthValue}
            onChange={(event) => setMonthValue(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
          <button
            onClick={load}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('mis')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'mis' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'}`}
        >
          <BarChart3 className="h-4 w-4" />
          MIS
        </button>
        <button
          onClick={() => setActiveTab('crs')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'crs' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'}`}
        >
          <PieChartIcon className="h-4 w-4" />
          CRS
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {activeTab === 'mis' ? (
              <>
                <StatCard label="Production Qty" value={misTotals.production} tone="blue" />
                <StatCard label="Rejected Qty" value={misTotals.rejection} tone="red" />
                <StatCard
                  label="Rejection %"
                  value={`${misTotals.production ? ((misTotals.rejection / misTotals.production) * 100).toFixed(2) : '0.00'}%`}
                  tone="amber"
                />
              </>
            ) : (
              <>
                <StatCard label="Production Qty" value={crsTotals.production} tone="blue" />
                <StatCard label="Rejection & Rework Qty" value={crsTotals.rejectionAndRework} tone="red" />
                <StatCard
                  label="Rejection & Rework %"
                  value={`${crsTotals.production ? ((crsTotals.rejectionAndRework / crsTotals.production) * 100).toFixed(2) : '0.00'}%`}
                  tone="amber"
                />
              </>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <ChartCard
              title={activeTab === 'mis' ? 'MIS Part / Process Rejections' : 'CRS Rejection Details'}
              subtitle={activeTab === 'mis' ? 'Production and rejection quantities by part and process.' : 'Production, rejection, and rework quantities by CRS report.'}
            >
              {currentRows.length ? <HorizontalBarChart rows={currentRows} mode={activeTab} /> : <EmptyChart />}
            </ChartCard>

            <ChartCard
              title={activeTab === 'mis' ? 'MIS Acceptance Mix' : 'CRS Rejection Share'}
              subtitle={activeTab === 'mis' ? 'Accepted output versus rejected quantity.' : 'Good output versus rejection and rework.'}
            >
              {pieRows.length ? <DonutChart rows={pieRows} /> : <EmptyChart />}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
