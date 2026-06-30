import { useEffect, useMemo, useState } from 'react';
import { Eye, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { inspectionAPI, productAPI } from '../../api/api';
import InspectionStatCard from '../../components/inspection/InspectionStatCard';

const RESULT_TABS = [
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'REWORK', label: 'Rework' }
];

const formatAnswerValue = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
};

const formatResponseValue = (item) => {
  if (item?.type === 'optionDetail') {
    const parts = [];
    if (item.selectedAnswer) parts.push(`Answer selection: ${item.selectedAnswer}`);
    if (item.optionKey && item.optionKey !== '__response__' && item.optionKey !== item.selectedAnswer) parts.push(`Option: ${item.optionKey}`);
    if (item.defectDetail) parts.push(`Defect type: ${item.defectDetail}`);
    parts.push(`Count: ${formatAnswerValue(item.count) || '0'}`);
    return parts.join(' | ');
  }
  if (item?.type === 'count') {
    const parts = [];
    if (item.optionKey && item.optionKey !== '__response__') parts.push(`Option: ${item.optionKey}`);
    if (item.defectDetail) parts.push(`Defect type: ${item.defectDetail}`);
    parts.push(`Count: ${formatAnswerValue(item.answer) || '0'}`);
    return parts.join(' | ');
  }
  return formatAnswerValue(item?.answer);
};

const getResponseDisplayFields = (item) => {
  const question = item?.questionText || item?.question || item?.questionId || '-';
  const isCountResponse = item?.type === 'optionDetail' || item?.type === 'count';
  const rowOption = item?.optionKey && item.optionKey !== '__response__' ? item.optionKey : '';
  const option =
    rowOption ||
    item?.selectedAnswer ||
    (isCountResponse ? '' : formatAnswerValue(item?.answer));
  const defectType = item?.defectDetail || item?.defectType || item?.defectName || item?.defect || '';
  const count = item?.type === 'optionDetail'
    ? item.count
    : item?.type === 'count'
      ? item.answer
      : '';

  return {
    question,
    option: option || '-',
    defectType: defectType || '-',
    count: formatAnswerValue(count) || (isCountResponse ? '0' : '-')
  };
};

const normalizeQuestionnaireReasonItems = (items = []) => {
  if (!Array.isArray(items)) return [];

  const selectedAnswerByQuestion = {};
  const globalDefectDetail = items.find((item) => item?.questionId === '__defect_detail__')?.answer || '';

  items.forEach((item) => {
    if (!item || item.type === 'count' || item.questionId === '__defect_detail__') return;
    const questionKey = String(item.questionId || item.question || '');
    if (!questionKey) return;
    const answers = Array.isArray(item.answer)
      ? item.answer.map(String).filter(Boolean)
      : String(item.answer || '').trim()
        ? [String(item.answer).trim()]
        : [];
    if (answers.length) selectedAnswerByQuestion[questionKey] = answers;
  });

  const fallbackOptionIndexByQuestion = {};
  const countItems = items
    .filter((item) => item?.type === 'count' && Number(item?.answer || 0) > 0)
    .map((item) => {
      const questionKey = String(item.questionId || item.question || '');
      const selectedAnswers = selectedAnswerByQuestion[questionKey] || [];
      const hasRowOption = item.optionKey && item.optionKey !== '__response__';
      const fallbackIndex = fallbackOptionIndexByQuestion[questionKey] || 0;
      const selectedAnswer = hasRowOption
        ? item.optionKey
        : selectedAnswers[fallbackIndex] || selectedAnswers.join(', ');

      if (!hasRowOption) fallbackOptionIndexByQuestion[questionKey] = fallbackIndex + 1;

      return {
        ...item,
        type: 'optionDetail',
        count: Number(item.answer || 0),
        selectedAnswer,
        defectDetail: item.defectDetail || globalDefectDetail,
        question: item.questionText || item.question || item.questionId || 'Questionnaire response'
      };
    });

  if (countItems.length) return countItems;

  return items.filter((item) => item?.answer !== undefined && item?.answer !== null && item?.answer !== '');
};

const computeReasonString = (items) => {
  const displayItems = normalizeQuestionnaireReasonItems(items);
  if (displayItems.length === 0) return '';

  return displayItems
    .map((it) => {
      const q = it?.questionText || it?.question || it?.questionId;
      const val = formatResponseValue(it);
      return q ? `${q}: ${val}` : val;
    })
    .filter(Boolean)
    .join(' | ');
};

const downloadCsv = (headers, rows, filename) => {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

const normalizeRows = (responses, productCategoryMap = {}) =>
  responses.map((item) => {
    const acceptedCount = Number(item.acceptedCount || 0);
    const rejectedCount = Number(item.rejectedCount || 0);
    const reworkCount = Number(item.reworkCount || 0);
    const rejectedReason = computeReasonString(item.rejectionFormResponses);
    const reworkReason = computeReasonString(item.reworkFormResponses);
    const productCategory =
      productCategoryMap[normalizeKey(item.code)] ||
      productCategoryMap[normalizeKey(item.productName)];
    const categoryId = item.categoryId || productCategory?.id || item.categoryName || item.productType || '';
    const categoryName = item.categoryName || productCategory?.name || item.productType || 'Uncategorized';

    return {
      code: item.code,
      partDescription: item.partDescription,
      productName: item.productName || item.code,
      employeeName: item.employeeName,
      stage: item.currentStageName || item.stageName,
      categoryId,
      categoryName,
      acceptedCount,
      rejectedCount,
      rejectedResponses: rejectedCount > 0 ? item.rejectionFormResponses || [] : [],
      rejectedReason: rejectedCount > 0 ? rejectedReason : '',
      reworkCount,
      reworkResponses: reworkCount > 0 ? item.reworkFormResponses || [] : [],
      reworkReason: reworkCount > 0 ? reworkReason : '',
      overallCount: acceptedCount + rejectedCount + reworkCount,
      submittedAt: item.submittedAt,
      raw: item
    };
  });

const getStatusCount = (row, status) => {
  if (status === 'ACCEPTED') return row.acceptedCount;
  if (status === 'REJECTED') return row.rejectedCount;
  return row.reworkCount;
};

const getStatusReason = (row, status) => {
  if (status === 'REJECTED') return row.rejectedReason;
  if (status === 'REWORK') return row.reworkReason;
  return '';
};

const getStatusResponses = (row, status) => {
  if (status === 'REJECTED') return row.rejectedResponses;
  if (status === 'REWORK') return row.reworkResponses;
  return [];
};

const TabButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg border px-4 py-2 text-sm font-medium ${
      active
        ? 'border-primary-500 bg-primary-50 text-primary-700'
        : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
    }`}
  >
    {children}
  </button>
);

const QuestionnaireResponseList = ({ items = [], emptyText = '-', tone = 'slate' }) => {
  const visibleItems = normalizeQuestionnaireReasonItems(items);
  const rowClass =
    tone === 'red'
      ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
      : tone === 'amber'
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
        : 'bg-slate-50 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300';

  if (!visibleItems.length) {
    return <span className="text-slate-500 dark:text-slate-400">{emptyText}</span>;
  }

  return (
    <div className="max-h-72 space-y-2 overflow-y-auto">
      {visibleItems.map((item, index) => {
        const fields = getResponseDisplayFields(item);
        return (
          <div key={`${fields.option}-${fields.defectType}-${index}`} className={`rounded-md px-3 py-2 text-xs ${rowClass}`}>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              <span><span className="font-semibold">Option:</span> {fields.option}</span>
              <span><span className="font-semibold">Defect Type:</span> {fields.defectType}</span>
              <span className="font-semibold">Count: {fields.count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const InspectionResponses = ({ analytics, rows, filters, setFilters, load, selected, setSelected }) => {
  const [tableView, setTableView] = useState('summary');
  const exportRows = () => {
    downloadCsv(
      [
        'Code',
        'Description',
        'Employee',
        'Stage',
        'Accepted Count',
        'Rejected Count',
        'Rejected Reason',
        'Rework Count',
        'Rework Reason',
        'Overall Count',
        'Submitted Date'
      ],
      rows.map((r) => [
        r.code,
        r.partDescription,
        r.employeeName,
        r.stage,
        r.acceptedCount,
        r.rejectedCount,
        r.rejectedReason,
        r.reworkCount,
        r.reworkReason,
        r.overallCount,
        r.submittedAt
      ]),
      'inspection-responses.csv'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inspection Responses</h1>
          <p className="text-slate-600 dark:text-slate-400">Review employee form submissions and quality outcomes.</p>
        </div>
        <button
          onClick={exportRows}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          <FileDown className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InspectionStatCard label="Total Responses" value={analytics.totalResponses} />
        <InspectionStatCard label="Accepted Items" value={analytics.acceptedItems} tone="emerald" />
        <InspectionStatCard label="Rejected Items" value={analytics.rejectedItems} tone="red" />
        <InspectionStatCard label="Rework Items" value={analytics.reworkItems} tone="amber" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search part, employee, product"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <select
            value={filters.result}
            onChange={(e) => setFilters({ ...filters, result: e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">All results</option>
            {RESULT_TABS.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
          <button onClick={load} className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white">
            Apply
          </button>
        </div>
        <div className="mb-4 flex gap-2">
          <TabButton active={tableView === 'summary'} onClick={() => setTableView('summary')}>Summary Table</TabButton>
          <TabButton active={tableView === 'details'} onClick={() => setTableView('details')}>Details Table</TabButton>
        </div>
        {tableView === 'summary' ? (
          <SummaryTable rows={rows} setSelected={setSelected} />
        ) : (
          <OptionDetailsTable rows={rows} setSelected={setSelected} />
        )}
      </section>

      <ResponseDetailsModal selected={selected} setSelected={setSelected} />
    </div>
  );
};

const ReportManagement = ({ rows, analytics, selected, setSelected }) => {
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('ACCEPTED');
  const [tableView, setTableView] = useState('summary');

  const categories = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => map.set(row.categoryId || '__uncategorized__', row.categoryName || 'Uncategorized'));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [rows]);

  const reportRows = useMemo(() => {
    const filteredRows = rows.filter((row) => {
      const rowCategory = row.categoryId || '__uncategorized__';
      const matchesCategory = !categoryId || rowCategory === categoryId;
      return matchesCategory && getStatusCount(row, status) > 0;
    });

    const runningTotals = new Map();
    const rowsWithOverall = [...filteredRows]
      .sort((a, b) => new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0))
      .map((row) => {
        const key = String(row.code || row.productName || '').trim().toLowerCase();
        const previousTotal = runningTotals.get(key);
        const nextTotal = Number(previousTotal || 0) + getStatusCount(row, status);
        runningTotals.set(key, nextTotal);
        return {
          ...row,
          reportOverallCount: previousTotal === undefined ? null : nextTotal
        };
      });

    return rowsWithOverall.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  }, [categoryId, rows, status]);

  const categoryTotals = useMemo(() => {
    return reportRows.reduce(
      (acc, row) => {
        acc.overall += getStatusCount(row, status);
        acc.accepted += row.acceptedCount;
        acc.rejected += row.rejectedCount;
        acc.rework += row.reworkCount;
        return acc;
      },
      { overall: 0, accepted: 0, rejected: 0, rework: 0 }
    );
  }, [reportRows]);

  const exportReport = () => {
    const categoryLabel = categories.find((item) => item.id === categoryId)?.name || 'all-categories';
    downloadCsv(
      ['Category', 'Code', 'Product name', 'Description', 'Employee', 'Stage', 'Reason', 'Status', 'Count', 'Overall Count', 'Submitted date and time'],
      reportRows.map((row) => [
        row.categoryName,
        row.code,
        row.productName,
        row.partDescription,
        row.employeeName,
        row.stage,
        getStatusReason(row, status),
        status,
        getStatusCount(row, status),
        row.reportOverallCount ?? '-',
        row.submittedAt
      ]),
      `report-management-${categoryLabel}-${status.toLowerCase()}.csv`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Filter category-level product results by inspection outcome.</p>
        </div>
        <button
          onClick={exportReport}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          <FileDown className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InspectionStatCard label="Total Responses" value={analytics.totalResponses} />
        <InspectionStatCard label="Accepted Items" value={analytics.acceptedItems} tone="emerald" />
        <InspectionStatCard label="Rejected Items" value={analytics.rejectedItems} tone="red" />
        <InspectionStatCard label="Rework Items" value={analytics.reworkItems} tone="amber" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 lg:max-w-xs"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {RESULT_TABS.map((tab) => (
              <TabButton key={tab.key} active={status === tab.key} onClick={() => setStatus(tab.key)}>
                {tab.label}
              </TabButton>
            ))}
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <InspectionStatCard label="Category Overall" value={categoryTotals.overall} />
          <InspectionStatCard label="Accepted" value={categoryTotals.accepted} tone="emerald" />
          <InspectionStatCard label="Rejected" value={categoryTotals.rejected} tone="red" />
          <InspectionStatCard label="Rework" value={categoryTotals.rework} tone="amber" />
        </div>

        <div className="mb-4 flex gap-2">
          <TabButton active={tableView === 'summary'} onClick={() => setTableView('summary')}>Summary Table</TabButton>
          <TabButton active={tableView === 'details'} onClick={() => setTableView('details')}>Details Table</TabButton>
        </div>
        {tableView === 'summary' ? (
          <DetailedStatusTable rows={reportRows} status={status} setSelected={setSelected} />
        ) : (
          <OptionDetailsTable rows={reportRows} status={status} setSelected={setSelected} useReportOverall />
        )}
      </section>

      <ResponseDetailsModal selected={selected} setSelected={setSelected} />
    </div>
  );
};

const SummaryTable = ({ rows, setSelected }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1450px] table-fixed">
      <colgroup>
        <col className="w-[130px]" />
        <col className="w-[150px]" />
        <col className="w-[190px]" />
        <col className="w-[160px]" />
        <col className="w-[150px]" />
        <col className="w-[110px]" />
        <col className="w-[110px]" />
        <col className="w-[280px]" />
        <col className="w-[110px]" />
        <col className="w-[280px]" />
        <col className="w-[110px]" />
        <col className="w-[180px]" />
        <col className="w-[130px]" />
      </colgroup>
      <thead className="bg-slate-50 dark:bg-slate-900/60">
        <tr>
          {[
            'Code',
            'Category',
            'Product Name',
            'Employee Name',
            'Current Stage',
            'Accepted Count',
            'Rejected Count',
            'Rejected Reason',
            'Rework Count',
            'Rework Reason',
            'Overall Count',
            'Submitted Date',
            'Actions'
          ].map((head) => (
            <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.raw?._id || `${r.code}-${r.submittedAt}`} className="border-t border-slate-200 dark:border-slate-700">
            <td className="px-4 py-3 text-sm font-semibold">{r.code}</td>
            <td className="px-4 py-3 text-sm">{r.categoryName}</td>
            <td className="px-4 py-3 text-sm">{r.productName
             || '-'}</td>
            <td className="px-4 py-3 text-sm">{r.employeeName || '-'}</td>
            <td className="px-4 py-3 text-sm">{r.stage || '-'}</td>
            <td className="px-4 py-3 text-sm">{r.acceptedCount}</td>
            <td className="px-4 py-3 text-sm text-red-700">{r.rejectedCount}</td>
            <td className="px-4 py-3 align-top text-sm">
              <QuestionnaireResponseList items={r.rejectedResponses} emptyText="-" tone="red" />
            </td>
            <td className="px-4 py-3 text-sm text-amber-700">{r.reworkCount}</td>
            <td className="px-4 py-3 align-top text-sm">
              <QuestionnaireResponseList items={r.reworkResponses} emptyText="-" tone="amber" />
            </td>
            <td className="px-4 py-3 text-sm font-semibold">{r.overallCount}</td>
            <td className="px-4 py-3 text-sm">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</td>
            <td className="px-4 py-3 text-sm">
              <button
                onClick={() => setSelected(r.raw)}
                className="inline-flex items-center gap-1 rounded-lg bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700"
              >
                <Eye className="h-3 w-3" />
                View Responses
              </button>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={13} className="px-4 py-8 text-center text-slate-500">
              No inspection responses found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const OptionDetailsTable = ({ rows, status, setSelected, useReportOverall = false }) => {
  const detailRows = rows.flatMap((row) => {
    const statuses = status ? [status] : ['REJECTED', 'REWORK'];
    return statuses.flatMap((resultStatus) => {
      const responseItems = normalizeQuestionnaireReasonItems(getStatusResponses(row, resultStatus));
      if (resultStatus === 'ACCEPTED' && responseItems.length === 0) {
        return [{
          row,
          resultStatus,
          fields: { option: '-', defectType: '-', count: getStatusCount(row, resultStatus) },
          index: 0
        }];
      }

      return responseItems.map((item, index) => ({
        row,
        resultStatus,
        fields: getResponseDisplayFields(item),
        index
      }));
    });
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1500px] table-fixed">
        <colgroup>
          <col className="w-[130px]" />
          <col className="w-[180px]" />
          <col className="w-[150px]" />
          <col className="w-[140px]" />
          <col className="w-[140px]" />
          <col className="w-[120px]" />
          <col className="w-[170px]" />
          <col className="w-[170px]" />
          <col className="w-[90px]" />
          <col className="w-[120px]" />
          <col className="w-[190px]" />
        </colgroup>
        <thead className="bg-slate-50 dark:bg-slate-900/60">
          <tr>
            {['Code', 'Category', 'Product Name', 'Employee', 'Stage', 'Result', 'Option Selected', 'Defect Type', 'Count', 'Overall Count', 'Submitted Date'].map((head) => (
              <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {detailRows.map(({ row, resultStatus, fields, index }) => (
            <tr
              key={`${resultStatus}-${row.raw?._id || row.code}-${fields.option}-${fields.defectType}-${index}`}
              className="cursor-pointer border-t border-slate-200 dark:border-slate-700"
              onClick={() => setSelected(row.raw)}
            >
              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">{row.code}</td>
              <td className="whitespace-normal break-normal px-4 py-3 text-sm leading-5">{row.categoryName}</td>
              <td className="whitespace-normal break-normal px-4 py-3 text-sm leading-5">{row.productName || '-'}</td>
              <td className="whitespace-normal break-normal px-4 py-3 text-sm leading-5">{row.employeeName || '-'}</td>
              <td className="whitespace-normal break-normal px-4 py-3 text-sm leading-5">{row.stage || '-'}</td>
              <td className={`whitespace-nowrap px-4 py-3 text-sm font-semibold ${resultStatus === 'ACCEPTED' ? 'text-emerald-700' : resultStatus === 'REJECTED' ? 'text-red-700' : 'text-amber-700'}`}>{resultStatus}</td>
              <td className="whitespace-normal break-normal px-4 py-3 text-sm leading-5">{fields.option}</td>
              <td className="whitespace-normal break-normal px-4 py-3 text-sm leading-5">{fields.defectType}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">{fields.count}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                {useReportOverall ? row.reportOverallCount ?? '-' : row.overallCount}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">{row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
          {detailRows.length === 0 && (
            <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">No option or defect details found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const DetailedStatusTable = ({ rows, status, setSelected }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1350px] table-fixed">
      <colgroup>
        <col className="w-[150px]" />
        <col className="w-[130px]" />
        <col className="w-[180px]" />
        <col className="w-[190px]" />
        <col className="w-[150px]" />
        <col className="w-[140px]" />
        <col className="w-[340px]" />
        <col className="w-[110px]" />
        <col className="w-[90px]" />
        <col className="w-[120px]" />
        <col className="w-[180px]" />
      </colgroup>
      <thead className="bg-slate-50 dark:bg-slate-900/60">
        <tr>
          {['Category', 'Code', 'Product name', 'Description', 'Employee', 'Stage', 'Reason', 'Status', 'Count', 'Overall Count', 'Submitted date and time'].map((head) => (
            <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={`${status}-${row.raw?._id || row.code}-${row.submittedAt}`}
            className="cursor-pointer border-t border-slate-200 dark:border-slate-700"
            onClick={() => setSelected(row.raw)}
            title="Click to view detailed responses"
          >
            <td className="px-4 py-3 text-sm">{row.categoryName}</td>
            <td className="px-4 py-3 text-sm font-semibold">{row.code}</td>
            <td className="px-4 py-3 text-sm">{row.productName || '-'}</td>
            <td className="px-4 py-3 text-sm">{row.partDescription || '-'}</td>
            <td className="px-4 py-3 text-sm">{row.employeeName || '-'}</td>
            <td className="px-4 py-3 text-sm">{row.stage || '-'}</td>
            <td className="px-4 py-3 align-top text-sm">
              <QuestionnaireResponseList
                items={getStatusResponses(row, status)}
                emptyText={status === 'ACCEPTED' ? 'Null' : 'No questionnaire responses'}
                tone={status === 'REJECTED' ? 'red' : status === 'REWORK' ? 'amber' : 'slate'}
              />
            </td>
            <td className="px-4 py-3 text-sm font-semibold">
              <span className={status === 'ACCEPTED' ? 'text-emerald-700' : status === 'REJECTED' ? 'text-red-700' : 'text-amber-700'}>
                {status}
              </span>
            </td>
            <td className="px-4 py-3 text-sm">{getStatusCount(row, status)}</td>
            <td className="px-4 py-3 text-sm">{row.reportOverallCount ?? '-'}</td>
            <td className="px-4 py-3 text-sm">{row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '-'}</td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
              No report data found for this filter.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const ResponseDetailsModal = ({ selected, setSelected }) => {
  if (!selected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-slate-800">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Response Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selected.code} - {selected.formName}
            </p>
          </div>
          <button onClick={() => setSelected(null)} className="rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-slate-700">
            Close
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
            <p className="text-xs uppercase text-slate-500">Employee</p>
            <p className="font-medium">{selected.employeeName}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
            <p className="text-xs uppercase text-slate-500">Stage</p>
            <p className="font-medium">{selected.currentStageName || selected.stageName}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
            <p className="text-xs uppercase text-slate-500">Product</p>
            <p className="font-medium">{selected.productName || selected.code}</p>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
            <p className="text-xs uppercase">Accepted Items</p>
            <p className="text-2xl font-bold">{selected.acceptedCount || 0}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <p className="text-xs uppercase">Rejected Items</p>
            <p className="text-2xl font-bold">{selected.rejectedCount || 0}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <p className="text-xs uppercase">Rework Items</p>
            <p className="text-2xl font-bold">{selected.reworkCount || 0}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">Inspection Form Responses</h3>
          {(selected.responses || []).map((answer) => (
            <AnswerBlock key={answer.questionId || answer.question} answer={answer} />
          ))}

          {(selected.rejectionFormResponses || []).length > 0 && (
            <h3 className="pt-3 font-semibold text-slate-900 dark:text-white">Rejection Analysis</h3>
          )}
          {(selected.rejectionFormResponses || []).map((answer) => (
            <AnswerBlock key={`rej-${answer.questionId || answer.question}`} answer={answer} tone="red" />
          ))}

          {(selected.reworkFormResponses || []).length > 0 && (
            <h3 className="pt-3 font-semibold text-slate-900 dark:text-white">Rework Analysis</h3>
          )}
          {(selected.reworkFormResponses || []).map((answer) => (
            <AnswerBlock key={`rw-${answer.questionId || answer.question}`} answer={answer} tone="amber" />
          ))}

          {selected.remarks && (
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/60">
              <p className="text-xs uppercase text-slate-500">Remarks</p>
              <p>{selected.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnswerBlock = ({ answer, tone = 'slate' }) => {
  const borderClass = tone === 'red' ? 'border-red-200 dark:border-red-900' : tone === 'amber' ? 'border-amber-200 dark:border-amber-900' : 'border-slate-200 dark:border-slate-700';
  if (answer?.type === 'count' || answer?.type === 'optionDetail') {
    const fields = getResponseDisplayFields(answer);
    return (
      <div className={`rounded-lg border p-4 ${borderClass}`}>
        <div className="grid gap-3 text-sm md:grid-cols-[1fr_140px_140px_80px]">
          <div>
            <p className="text-xs uppercase text-slate-500">Question</p>
            <p className="font-medium text-slate-900 dark:text-white">{fields.question}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Option</p>
            <p className="text-slate-700 dark:text-slate-300">{fields.option}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Defect Type</p>
            <p className="text-slate-700 dark:text-slate-300">{fields.defectType}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Count</p>
            <p className="font-semibold text-slate-900 dark:text-white">{fields.count}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${borderClass}`}>
      <p className="font-medium text-slate-900 dark:text-white">{answer.question}</p>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{formatResponseValue(answer) || '-'}</p>
    </div>
  );
};

const AdminResponsesPage = () => {
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [productCategoryMap, setProductCategoryMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', result: '' });
  const [activeTab, setActiveTab] = useState('inspection');

  const load = async () => {
    try {
      const [response, productsResponse] = await Promise.all([
        inspectionAPI.getAdminResponses(filters),
        productAPI.getAll()
      ]);
      setResponses(response.data.responses || []);
      setAnalytics(response.data.analytics || {});
      const nextCategoryMap = {};
      (productsResponse.data || []).forEach((product) => {
        const category = product.category;
        const categoryInfo = category?.name
          ? { id: category._id || category.name, name: category.name }
          : null;
        if (!categoryInfo) return;
        if (product.code) nextCategoryMap[normalizeKey(product.code)] = categoryInfo;
        if (product.productName) nextCategoryMap[normalizeKey(product.productName)] = categoryInfo;
      });
      setProductCategoryMap(nextCategoryMap);
    } catch (error) {
      toast.error('Failed to load inspection responses');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => normalizeRows(responses, productCategoryMap), [productCategoryMap, responses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
        <TabButton active={activeTab === 'inspection'} onClick={() => setActiveTab('inspection')}>
          Inspection Responses
        </TabButton>
        <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
          Report Management
        </TabButton>
      </div>

      {activeTab === 'inspection' ? (
        <InspectionResponses
          analytics={analytics}
          rows={rows}
          filters={filters}
          setFilters={setFilters}
          load={load}
          selected={selected}
          setSelected={setSelected}
        />
      ) : (
        <ReportManagement rows={rows} analytics={analytics} selected={selected} setSelected={setSelected} />
      )}
    </div>
  );
};

export default AdminResponsesPage;
