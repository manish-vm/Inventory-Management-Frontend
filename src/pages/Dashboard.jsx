import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, FileSpreadsheet, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import {
  helmetD1DrrReport,
  helmetD1RejectionReport,
  helmetD2RejectionReport,
  helmetD3RejectionReport,
  helmetD4RejectionReport
} from '../data/helmetWorkbookReportData';
import {
  helmetD2DrrReport,
  helmetD3DrrReport,
  helmetD4DrrReport
} from '../data/correctedHelmetDrrData';
import { visorMouldingReports } from '../data/visorMouldingReportData';
import {
  shellMouldingReports,
  visorCoatingReports,
  visorMechanismTopMouldingReports
} from '../data/additionalMouldingReportData';
import {
  bopReports,
  chinCoverReports,
  spoilerReports,
  stagewiseReports,
  supplierRejectionReport
} from '../data/latestWorkbookReportData';

const drrSummaryRows = [
  {
    label: 'Day wise Total Production',
    metric: 'output',
    getValue: (column, report) => report?.daysById?.[column.id]?.output ?? 0,
    total: (report) => report?.totals?.output ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Total Rejection & Rework',
    getValue: (column, report) => report?.daysById?.[column.id]?.rejection ?? 0,
    total: (report) => report?.totals?.rejection ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Total Rejection & Rework %',
    getValue: (column, report) => formatPercent(report?.daysById?.[column.id]?.rejectionPercent ?? 0),
    total: (report) => formatPercent(report?.totals?.rejectionPercent ?? 0),
    totalPercent: (report) => formatPercent(report?.totals?.rejectionPercent ?? 0),
    isPercent: true,
  },
  {
    label: 'Day Wise Rejection Qty',
    getValue: (column, report) => getRejectionDayValue(report, column, 'rejection'),
    total: (report) => report?.totals?.rejection ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Rejection %',
    getValue: (column, report) => formatPercent(getRejectionDayValue(report, column, 'rejectionPercent')),
    total: (report) => formatPercent(report?.totals?.rejectionPercent ?? 0),
    totalPercent: '',
    isPercent: true,
  },
];

const visorDrrSummaryRows = [
  {
    label: 'Day wise Total Production',
    metric: 'output',
    getValue: (column, report) => report?.daysById?.[column.id]?.output ?? 0,
    total: (report) => report?.totals?.output ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Total Rejection',
    getValue: (column, report) => report?.daysById?.[column.id]?.rejection ?? 0,
    total: (report) => report?.totals?.rejection ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Total Rejection %',
    getValue: (column, report) => formatPercent(report?.daysById?.[column.id]?.rejectionPercent ?? 0),
    total: (report) => formatPercent(report?.totals?.rejectionPercent ?? 0),
    totalPercent: '',
    isPercent: true,
  },
];

const fillMergedDrrValues = (rows) => {
  let assemblyProcess = '';
  let partDetails = '';

  return rows.map((row) => {
    const nextAssemblyProcess = String(row.assemblyProcess || '').trim();
    const nextPartDetails = String(row.partDetails || '').trim();

    if (nextAssemblyProcess) assemblyProcess = nextAssemblyProcess;
    if (nextPartDetails) partDetails = nextPartDetails;

    return {
      ...row,
      assemblyProcess,
      partDetails
    };
  });
};

const rejectionSummaryRows = [
  {
    label: 'TOTAL OUTPUT',
    metric: 'output',
    getValue: (column, report) => report?.daysById?.[column.id]?.output ?? 0,
    total: (report) => report?.totals?.output ?? 0,
    totalPercent: '',
  },
  {
    label: 'TOTAL REJECTION',
    metric: 'rejection',
    getValue: (column, report) => report?.daysById?.[column.id]?.rejection ?? 0,
    total: (report) => report?.totals?.rejection ?? 0,
    totalPercent: '',
  },
  {
    label: 'PERCENTAGE OF REJECTION',
    metric: 'rejectionPercent',
    getValue: (column, report) => formatPercent(report?.daysById?.[column.id]?.rejectionPercent ?? 0),
    total: (report) => formatPercent(report?.totals?.rejectionPercent ?? 0),
    totalPercent: (report) => formatPercent(report?.totals?.rejectionPercent ?? 0),
    isPercent: true,
  },
];

const reportTabs = [
  {
    id: 'mis-quality-performance',
    name: 'MIS',
    subReports: [{
      id: 'mis-summary',
      type: 'mis',
      name: 'Helmet - Partwise Quality Performance Report',
      sourceFileName: 'MIS',
      descriptorColumns: [],
      summaryRows: [],
      totalColumns: [],
      dayColumns: [],
      rows: []
    }]
  },
  {
    id: 'consolidated-rejection-status',
    name: 'CRS',
    subReports: [{
      id: 'crs-summary',
      type: 'crs',
      name: 'Helmet - Consolidated Rejection Status',
      sourceFileName: 'CRS',
      descriptorColumns: [],
      summaryRows: [],
      totalColumns: [],
      dayColumns: [],
      rows: []
    }]
  },
  {
    id: 'helmet-quality-performance',
    name: 'Helmet Assembly',
    subReports: [
      ...[
        [1, helmetD1DrrReport, helmetD1RejectionReport],
        [2, helmetD2DrrReport, helmetD2RejectionReport],
        [3, helmetD3DrrReport, helmetD3RejectionReport],
        [4, helmetD4DrrReport, helmetD4RejectionReport]
      ].flatMap(([line, drrReport, rejectionReport]) => [
        {
          id: `d${line}-helmet-assembly-drr`,
          line,
          type: 'drr',
          name: drrReport.subReportName,
          sourceFileName: drrReport.sourceFileName,
          descriptorColumns: [
            { key: 'assemblyProcess', label: 'Assembly Process', width: 160 },
            { key: 'partDetails', label: 'Part details', width: 120 },
            { key: 'defectDetails', label: 'Defect Details', width: 180 },
          ],
          summaryRows: drrSummaryRows,
          totalColumns: [
            { id: 'total', label: 'Total' },
            { id: 'totalPercent', label: 'Total %' },
          ],
          rows: fillMergedDrrValues(drrReport.rows),
        },
        {
          id: `d${line}-helmet-assembly-rejection`,
          line,
          type: 'rejection',
          name: rejectionReport.subReportName,
          sourceFileName: rejectionReport.sourceFileName,
          descriptorColumns: line >= 3
            ? [{ key: 'rejectionDetails', label: 'Defects', width: 640 }]
            : [
                { key: 'defectGroup', label: 'Defects', width: 220 },
                { key: 'rejectionDetails', label: 'Rejection Details', width: 420 },
              ],
          summaryRows: rejectionSummaryRows,
          totalColumns: [
            { id: 'total', label: 'G.Total' },
            { id: 'totalPercent', label: '%' },
          ],
          rows: rejectionReport.rows,
        }
      ]),
    ],
  },
  {
    id: 'visor-moulding-quality-performance',
    name: 'Visor Moulding Quality Performance',
    subReports: visorMouldingReports.map((report) => ({
      id: `d${report.line}-visor-moulding-drr`,
      line: report.line,
      type: 'visor-drr',
      name: report.subReportName,
      sourceFileName: report.sourceFileName,
      descriptorColumns: [
        { key: 'assemblyProcess', label: 'Visor moulding Process', width: 220 },
        { key: 'partDetails', label: 'Part details', width: 180 },
        { key: 'defectDetails', label: 'Defect Details', width: 260 },
      ],
      summaryRows: visorDrrSummaryRows,
      totalColumns: [
        { id: 'total', label: 'Total' },
        { id: 'totalPercent', label: 'Total %' },
      ],
      rows: report.rows,
    })),
  },
  ...[
    {
      id: 'visor-mechanism-top-moulding',
      name: 'Visor Mechanism Top Moulding',
      reports: visorMechanismTopMouldingReports,
      processLabel: 'Visor Top moulding Process'
    },
    {
      id: 'visor-coating-quality-performance',
      name: 'Visor Coating Quality Performance',
      reports: visorCoatingReports,
      processLabel: 'Visor Coating Process'
    },
    {
      id: 'shell-moulding-quality-performance',
      name: 'Shell Moulding Quality Performance',
      reports: shellMouldingReports,
      processLabel: 'Shell moulding Process'
    }
  ].map((group) => ({
    id: group.id,
    name: group.name,
    subReports: group.reports.map((report) => ({
      id: `${group.id}-d${report.line}`,
      line: report.line,
      type: 'visor-drr',
      name: report.subReportName,
      sourceFileName: report.sourceFileName,
      descriptorColumns: [
        { key: 'assemblyProcess', label: group.processLabel, width: 220 },
        { key: 'partDetails', label: 'Part details', width: 180 },
        { key: 'defectDetails', label: 'Defect Details', width: 260 },
      ],
      summaryRows: visorDrrSummaryRows,
      totalColumns: [
        { id: 'total', label: 'Total' },
        { id: 'totalPercent', label: 'Total %' },
      ],
      rows: report.rows,
    }))
  })),
  ...[
    {
      id: 'stagewise-rejection-performance',
      name: 'Stagewise Rejection',
      reports: stagewiseReports.map((report) => ({
        ...report,
        rows: report.rows.map((row) => ({
          assemblyProcess: '',
          partDetails: row.assemblyProcess,
          defectDetails: row.partDetails
        }))
      })),
      processLabel: 'Helmet assembly'
    },
    {
      id: 'chin-cover-moulding-performance',
      name: 'Chin Cover Moulding',
      reports: chinCoverReports,
      processLabel: 'Chin Cover moulding Process'
    },
    {
      id: 'spoiler-moulding-performance',
      name: 'Spoiler Moulding',
      reports: spoilerReports,
      processLabel: 'Spoiler moulding Process'
    }
  ].map((group) => ({
    id: group.id,
    name: group.name,
    subReports: group.reports.map((report) => ({
      id: `${group.id}-d${report.line}`,
      line: report.line,
      type: 'visor-drr',
      name: report.subReportName,
      sourceFileName: report.sourceFileName,
      descriptorColumns: [
        { key: 'assemblyProcess', label: group.processLabel, width: 220 },
        { key: 'partDetails', label: 'Part details', width: 180 },
        { key: 'defectDetails', label: 'Defect Details', width: 260 },
      ],
      summaryRows: visorDrrSummaryRows,
      totalColumns: [
        { id: 'total', label: 'Total' },
        { id: 'totalPercent', label: 'Total %' },
      ],
      rows: fillMergedDrrValues(report.rows),
    }))
  })),
  {
    id: 'bop-parts-receipt',
    name: 'BOP Parts Receipt',
    subReports: bopReports.map((report) => ({
      id: `d${report.line}-bop-parts-receipt`,
      line: report.line,
      type: 'visor-drr',
      name: report.subReportName,
      sourceFileName: report.sourceFileName,
      descriptorColumns: [{ key: 'defectDetails', label: 'Description', width: 660 }],
      summaryRows: [],
      totalColumns: [{ id: 'total', label: 'Total' }],
      rows: report.metrics.map((metric) => ({
        assemblyProcess: '',
        partDetails: '',
        defectDetails: metric
      }))
    }))
  },
  {
    id: 'supplier-rejection-inward',
    name: 'Supplier Rejection',
    subReports: [{
      id: 'supplier-rejection-inward-inspection',
      type: 'static-table',
      name: supplierRejectionReport.subReportName,
      sourceFileName: supplierRejectionReport.sourceFileName,
      descriptorColumns: supplierRejectionReport.headers.map((header) => ({
        key: header,
        label: header,
        width: ['Reason for rejection', 'Action taken'].includes(header) ? 300 : 150
      })),
      summaryRows: [],
      totalColumns: [],
      dayColumns: [],
      rows: supplierRejectionReport.rows
    }]
  },
];

const D1_REJECTION_REPORT_ID = 'd1-helmet-assembly-rejection';
const REJECTION_REPORT_IDS = [1, 2, 3, 4].map((line) => `d${line}-helmet-assembly-rejection`);
const emptyRejectionOverrides = () => ({ output: {}, rows: {} });

const dayColumns = Array.from({ length: 31 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0');
  return {
    id: `may-${day}`,
    label: `${day}/05`,
  };
});

const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;
const getCellValue = (value, report) => (typeof value === 'function' ? value(report) : value);
const normalizeReportKey = (value) => String(value || '').trim().toLowerCase();
const toNumber = (value) => Math.max(0, Number(value) || 0);
const getDayNumberFromColumn = (column) => Number(String(column?.id || '').match(/(\d+)$/)?.[1] || 0);
const getRejectionDayValue = (report, column, metric) => {
  const dayNumber = getDayNumberFromColumn(column);
  const dayKey = `day-${String(dayNumber).padStart(2, '0')}`;
  return report?.daysById?.[dayKey]?.[metric] ?? 0;
};

const buildEditableDrrReport = (rows, overrides, columns, backendReport = null) => {
  const outputOverrides = overrides.output || {};
  const rowOverrides = overrides.rows || {};
  const backendRows = new Map(
    (backendReport?.rows || []).map((row) => [normalizeReportKey(row.defectName), row])
  );
  const hasRowOverrides = Object.keys(rowOverrides).length > 0;
  const editableRows = rows.map((row, rowIndex) => {
    const rowKey = `${rowIndex}-${normalizeReportKey(row.defectDetails)}`;
    const dayOverrides = rowOverrides[rowKey] || {};
    const backendRow = backendRows.get(normalizeReportKey(row.defectDetails));
    const days = columns.map((column, dayIndex) =>
      toNumber(dayOverrides[column.id] ?? backendRow?.days?.[dayIndex] ?? 0)
    );
    return {
      ...row,
      drrRowKey: rowKey,
      days,
      total: days.reduce((sum, value) => sum + value, 0)
    };
  });
  const days = columns.map((column, dayIndex) => {
    const output = toNumber(outputOverrides[column.id] ?? backendReport?.days?.[dayIndex]?.output ?? 0);
    const rowRejection = editableRows.reduce((sum, row) => sum + toNumber(row.days[dayIndex]), 0);
    const backendDay = backendReport?.days?.[dayIndex];
    const backendRejection = backendReport?.reportType === 'helmet-assembly'
      ? backendDay?.rejectionAndRework
      : backendDay?.rejection;
    const rejection = hasRowOverrides ? rowRejection : toNumber(backendRejection ?? rowRejection);
    return {
      output,
      rejection,
      rejectionPercent: output ? Number(((rejection / output) * 100).toFixed(2)) : 0
    };
  });
  const totals = days.reduce(
    (acc, day) => ({ output: acc.output + day.output, rejection: acc.rejection + day.rejection }),
    { output: 0, rejection: 0 }
  );
  totals.rejectionPercent = totals.output
    ? Number(((totals.rejection / totals.output) * 100).toFixed(2))
    : 0;
  return {
    rows: editableRows,
    days,
    daysById: days.reduce((acc, day, index) => {
      acc[columns[index].id] = day;
      return acc;
    }, {}),
    totals
  };
};

const mergeRejectionRows = (templateRows, reportRows) => {
  const rowsByDetail = new Map(
    (reportRows || []).map((row) => [normalizeReportKey(row.rejectionDetails), row])
  );
  const usedDetails = new Set();

  const mergedRows = templateRows.map((row) => {
    const detailKey = normalizeReportKey(row.rejectionDetails);
    const reportRow = rowsByDetail.get(detailKey);
    if (reportRow) usedDetails.add(detailKey);
    return {
      ...row,
      days: reportRow?.days || [],
      total: reportRow?.total || 0,
      totalPercent: reportRow?.totalPercent || 0
    };
  });

  for (const row of reportRows || []) {
    const detailKey = normalizeReportKey(row.rejectionDetails);
    if (!usedDetails.has(detailKey)) mergedRows.push(row);
  }

  return mergedRows;
};

const buildEditableRejectionReport = (report, overrides, dayColumnsForReport) => {
  const baseReport = report || {};
  const baseDaysById = baseReport.daysById || {};
  const outputOverrides = overrides.output || {};
  const rowOverrides = overrides.rows || {};

  const rows = (baseReport.rows || []).map((row) => {
    const rowKey = normalizeReportKey(row.rejectionDetails);
    const rowDayOverrides = rowOverrides[rowKey] || {};
    const rowDays = dayColumnsForReport.map((column, index) => {
      const baseDay = row.days?.[index] || {};
      return {
        day: Number(column.id.slice(-2)) || index + 1,
        rejection: toNumber(rowDayOverrides[column.id] ?? baseDay.rejection ?? 0)
      };
    });
    const total = rowDays.reduce((sum, day) => sum + day.rejection, 0);

    return {
      ...row,
      days: rowDays,
      total,
      totalPercent: 0
    };
  });

  const days = dayColumnsForReport.map((column, index) => {
    const baseDay = baseDaysById[column.id] || baseReport.days?.[index] || {};
    const output = toNumber(outputOverrides[column.id] ?? baseDay.output);
    const rejection = rows.reduce((sum, row) => sum + toNumber(row.days?.[index]?.rejection), 0);

    return {
      day: Number(column.id.slice(-2)) || index + 1,
      output,
      rejection,
      rejectionPercent: output ? Number(((rejection / output) * 100).toFixed(2)) : 0
    };
  });

  const totals = days.reduce(
    (acc, day) => ({
      output: acc.output + day.output,
      rejection: acc.rejection + day.rejection,
      rejectionPercent: 0
    }),
    { output: 0, rejection: 0, rejectionPercent: 0 }
  );
  totals.rejectionPercent = totals.output ? Number(((totals.rejection / totals.output) * 100).toFixed(2)) : 0;

  const rowsWithPercent = rows.map((row) => ({
    ...row,
    totalPercent: totals.rejection ? Number(((row.total / totals.rejection) * 100).toFixed(2)) : 0
  }));

  return {
    ...baseReport,
    days,
    daysById: days.reduce((acc, day, index) => {
      acc[dayColumnsForReport[index].id] = day;
      return acc;
    }, {}),
    totals,
    rows: rowsWithPercent
  };
};

const gridBorderClass = 'border-r border-b border-slate-300 dark:border-slate-700';
const cellHeightClass = 'h-12 max-h-12 overflow-hidden whitespace-nowrap';
const dayCellClass = `w-16 min-w-16 max-w-16 ${cellHeightClass} ${gridBorderClass} px-1 py-2 text-center`;
const totalCellClass = `w-16 min-w-16 max-w-16 ${cellHeightClass} ${gridBorderClass} bg-blue-100 px-1 py-2 text-center dark:bg-blue-900/40`;
const totalPercentCellClass = `w-20 min-w-20 max-w-20 ${cellHeightClass} ${gridBorderClass} bg-blue-100 px-1 py-2 text-center dark:bg-blue-900/40`;
const reportRowClass = 'h-12';

const misLineRows = {
  1: [
    ['Shell', 'BOP', 'd1-bop-parts-receipt', 'Shell inward qty'],
    ['EPS', 'BOP', 'd1-bop-parts-receipt', 'EPS Inward Qty'],
    ['Harness', 'BOP', 'd1-bop-parts-receipt', 'Harness Inward Qty'],
    ['Visor', 'BOP', 'd1-bop-parts-receipt', 'Visor Inward Qty'],
    ['Shell', 'Moulding', 'shell-moulding-quality-performance-d1'],
    ['Visor', 'Moulding', 'd1-visor-moulding-drr'],
    ['Visor top', 'Moulding', 'visor-mechanism-top-moulding-d1'],
    ['Visor', 'Coating', 'visor-coating-quality-performance-d1'],
    ['Stagewise Rej-Shell', 'Assy', 'stagewise-rejection-performance-d1', 'Shell'],
    ['Stagewise Rej-EPS', 'Assy', 'stagewise-rejection-performance-d1', 'EPS'],
    ['Stagewise Rej-Helmet', 'Assy', 'stagewise-rejection-performance-d1', 'Assy'],
    ['Helmet -Rej', 'Assy', 'd1-helmet-assembly-rejection']
  ],
  2: [
    ['Shell', 'BOP', 'd2-bop-parts-receipt', 'Shell inward qty'],
    ['EPS', 'BOP', 'd2-bop-parts-receipt', 'EPS Inward Qty'],
    ['Harness', 'BOP', 'd2-bop-parts-receipt', 'Harness Inward Qty'],
    ['Visor', 'BOP', 'd2-bop-parts-receipt', 'Visor Inward Qty'],
    ['Shell', 'Moulding', 'shell-moulding-quality-performance-d2'],
    ['Visor', 'Moulding', 'd2-visor-moulding-drr'],
    ['Visor top', 'Moulding', 'visor-mechanism-top-moulding-d2'],
    ['Visor', 'Coating', 'visor-coating-quality-performance-d2'],
    ['Stagewise Rej-Shell', 'Assy', 'stagewise-rejection-performance-d2', 'Shell'],
    ['Stagewise Rej-EPS', 'Assy', 'stagewise-rejection-performance-d2', 'EPS'],
    ['Stagewise Rej-Helmet', 'Assy', 'stagewise-rejection-performance-d2', 'Assy'],
    ['Helmet -Rej', 'Assy', 'd2-helmet-assembly-rejection']
  ],
  3: [
    ['Shell', 'BOP', 'd3-bop-parts-receipt', 'Shell inward qty'],
    ['EPS', 'BOP', 'd3-bop-parts-receipt', 'EPS Inward Qty'],
    ['Harness', 'BOP', 'd3-bop-parts-receipt', 'Harness Inward Qty'],
    ['Visor', 'BOP', 'd3-bop-parts-receipt', 'Visor Inward Qty'],
    ['Visor', 'Moulding', 'd3-visor-moulding-drr'],
    ['Visor', 'Coating', 'visor-coating-quality-performance-d3'],
    ['Chin cover', 'Moulding', 'chin-cover-moulding-performance-d3'],
    ['Shell', 'Moulding', 'shell-moulding-quality-performance-d3'],
    ['Stagewise Rej-Shell', 'Assy', 'stagewise-rejection-performance-d3', 'Shell'],
    ['Stagewise Rej-EPS', 'Assy', 'stagewise-rejection-performance-d3', 'EPS'],
    ['Stagewise Rej-Helmet', 'Assy', 'stagewise-rejection-performance-d3', 'Assy'],
    ['Helmet -Rej', 'Assy', 'd3-helmet-assembly-rejection']
  ],
  4: [
    ['Shell', 'BOP', 'd4-bop-parts-receipt', 'Shell inward qty'],
    ['EPS', 'BOP', 'd4-bop-parts-receipt', 'EPS Inward Qty'],
    ['Harness', 'BOP', 'd4-bop-parts-receipt', 'Harness Inward Qty'],
    ['Visor', 'BOP', 'd4-bop-parts-receipt', 'Visor Inward Qty'],
    ['Shell', 'Moulding', 'shell-moulding-quality-performance-d4'],
    ['Spoiler', 'Moulding', 'spoiler-moulding-performance-d4'],
    ['Chin cover', 'Moulding', 'chin-cover-moulding-performance-d4'],
    ['Visor', 'Moulding', 'd4-visor-moulding-drr'],
    ['Visor', 'Coating', 'visor-coating-quality-performance-d4'],
    ['Stagewise Rej-Shell', 'Assy', 'stagewise-rejection-performance-d4', 'Shell'],
    ['Stagewise Rej-EPS', 'Assy', 'stagewise-rejection-performance-d4', 'EPS'],
    ['Stagewise Rej-Helmet', 'Assy', 'stagewise-rejection-performance-d4', 'Assy'],
    ['Helmet -Rej', 'Assy', 'd4-helmet-assembly-rejection']
  ]
};

const crsLayout = [
  [
    { title: 'D1 - Helmet Assy', reportId: 'd1-helmet-assembly-drr', rejectionId: 'd1-helmet-assembly-rejection', helmet: true },
    { title: 'D1 - Visor Molding', reportId: 'd1-visor-moulding-drr' },
    { title: 'D2 - Visor Moulding', reportId: 'd2-visor-moulding-drr' },
    { title: 'D4 - Shell Moulding', reportId: 'shell-moulding-quality-performance-d4' }
  ],
  [
    { title: 'D2 - Helmet Assy', reportId: 'd2-helmet-assembly-drr', rejectionId: 'd2-helmet-assembly-rejection', helmet: true },
    { title: 'D1 - VM Top Moulding', reportId: 'visor-mechanism-top-moulding-d1' },
    { title: 'D2 - VM Top Moulding', reportId: 'visor-mechanism-top-moulding-d2' },
    { title: 'D4 - Spoiler Moulding', reportId: 'spoiler-moulding-performance-d4' }
  ],
  [
    { title: 'D4 - Helmet Assy', reportId: 'd4-helmet-assembly-drr', rejectionId: 'd4-helmet-assembly-rejection', helmet: true },
    { title: 'D1 - Visor Coating', reportId: 'visor-coating-quality-performance-d1' },
    { title: 'D2 - Visor Coating', reportId: 'visor-coating-quality-performance-d2' },
    { title: 'D4 - Visor Coating', reportId: 'visor-coating-quality-performance-d4' }
  ],
  [
    { title: 'D4 - Visor Moulding', reportId: 'd4-visor-moulding-drr' },
    { title: 'D1 - Shell Moulding', reportId: 'shell-moulding-quality-performance-d1' },
    { title: 'D2 - Shell Moulding', reportId: 'shell-moulding-quality-performance-d2' },
    { title: 'D4 - Chin Cover Moulding', reportId: 'chin-cover-moulding-performance-d4' }
  ],
  [
    { title: 'D3 - Shell Moulding', reportId: 'shell-moulding-quality-performance-d3' },
    { title: 'D3 - Chin Cover Moulding', reportId: 'chin-cover-moulding-performance-d3' },
    { title: 'D3 - Visor Moulding', reportId: 'd3-visor-moulding-drr' },
    { title: 'D3 - Visor Coating', reportId: 'visor-coating-quality-performance-d3' }
  ],
  [
    { title: 'D3 - Helmet Assy', reportId: 'd3-helmet-assembly-drr', rejectionId: 'd3-helmet-assembly-rejection', helmet: true },
    { title: 'D1 - BOP Parts Receipt', reportId: 'd1-bop-parts-receipt', bop: true },
    { title: 'D2 - BOP Parts Receipt', reportId: 'd2-bop-parts-receipt', bop: true },
    { title: 'D3 - BOP Parts Receipt', reportId: 'd3-bop-parts-receipt', bop: true }
  ],
  [
    { title: 'D4 - BOP Parts Receipt', reportId: 'd4-bop-parts-receipt', bop: true }
  ]
];

const CumulativeBlock = ({ item, reports, monthLabel }) => {
  const report = reports[item.reportId];
  const rejectionReportForLine = reports[item.rejectionId];
  const totals = report?.totals || { output: 0, rejection: 0, rejectionPercent: 0 };

  if (item.bop) {
    const rows = report?.rows || [];
    return (
      <div className="overflow-hidden border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
        <h3 className="border-b border-slate-300 bg-blue-100 px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          {item.title}
        </h3>
        {rows.map((row) => (
          <div key={row.defectDetails} className="grid grid-cols-[1fr_90px] border-b border-slate-200 text-sm last:border-b-0 dark:border-slate-700">
            <span className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{row.defectDetails}</span>
            <span className="border-l border-slate-200 px-3 py-2 text-right font-semibold dark:border-slate-700">{row.total || 0}</span>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    ['TOTAL PRODUCTION QTY', totals.output || 0],
    [item.helmet ? 'TOTAL REJECTION & REWORK QTY' : 'TOTAL REJECTION QTY', totals.rejection || 0],
    [item.helmet ? 'TOTAL REJECTION & REWORK QTY %' : 'TOTAL REJECTION %', formatPercent(totals.rejectionPercent)]
  ];
  if (item.helmet) {
    metrics.push(
      ['TOTAL REJECTION QTY', rejectionReportForLine?.totals?.rejection || 0],
      ['TOTAL REJECTION %', formatPercent(rejectionReportForLine?.totals?.rejectionPercent)]
    );
  }

  return (
    <div className="overflow-hidden border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
      <h3 className="border-b border-slate-300 bg-blue-100 px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        {item.title}
      </h3>
      <p className="border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Month Cumulative - {monthLabel}
      </p>
      {metrics.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[1fr_90px] border-b border-slate-200 text-xs last:border-b-0 dark:border-slate-700">
          <span className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">{label}</span>
          <span className="border-l border-slate-200 px-3 py-2 text-right font-bold text-slate-900 dark:border-slate-700 dark:text-white">{value}</span>
        </div>
      ))}
    </div>
  );
};

const getMisMetric = (reports, rowConfig, dayIndex, dayId) => {
  const [, , reportId, detailFilter] = rowConfig;
  const report = reports[reportId];
  if (!report) return { dayOutput: 0, dayRejection: 0, monthOutput: 0, monthRejection: 0 };
  const selectedDay = report.daysById?.[dayId] || report.days?.[dayIndex] || {};

  if (reportId.includes('bop-parts-receipt')) {
    const matchedRow = report.rows?.find((row) =>
      normalizeReportKey(row.defectDetails) === normalizeReportKey(detailFilter)
    );
    return {
      dayOutput: matchedRow?.days?.[dayIndex] || 0,
      dayRejection: 0,
      monthOutput: matchedRow?.total || 0,
      monthRejection: 0
    };
  }

  if (reportId.includes('stagewise-rejection') && detailFilter) {
    const matchingRows = (report.rows || []).filter((row) =>
      normalizeReportKey(row.partDetails).includes(normalizeReportKey(detailFilter))
    );
    const dayRejection = matchingRows.reduce((sum, row) => sum + toNumber(row.days?.[dayIndex]), 0);
    return {
      dayOutput: selectedDay.output || 0,
      dayRejection,
      monthOutput: report.totals?.output || 0,
      monthRejection: matchingRows.reduce((sum, row) => sum + toNumber(row.total), 0)
    };
  }

  return {
    dayOutput: selectedDay.output || 0,
    dayRejection: selectedDay.rejection || 0,
    monthOutput: report.totals?.output || 0,
    monthRejection: report.totals?.rejection || 0
  };
};

const MisLineTable = ({ line, reports, dayIndex, dayId, dayLabel, monthLabel }) => (
  <section className="overflow-hidden border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
    <div className="grid gap-0 xl:grid-cols-2">
      {[
        { label: `For the day - ${dayLabel}`, period: 'day' },
        { label: `For the month - ${monthLabel}`, period: 'month' }
      ].map(({ label, period }) => (
        <div key={period} className="min-w-0 border-slate-300 xl:border-r last:xl:border-r-0 dark:border-slate-700">
          <div className="relative z-10 flex items-center justify-between border-b border-slate-300 bg-blue-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white">D{line} - {['ACE', 'FIT', 'NEO', 'ARC'][line - 1]}</h3>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/70">
                {['Part', 'Process', 'Prodn.Qty', 'Rej.Qty', 'Rej%', 'Part Value (Rs)', 'Rej. Value / Helmet (Rs)'].map((header) => (
                  <th key={header} className="border-b border-r border-slate-300 px-3 py-2 text-left font-semibold dark:border-slate-700">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {misLineRows[line].map((rowConfig) => {
                const [part, process] = rowConfig;
                const metric = getMisMetric(reports, rowConfig, dayIndex, dayId);
                const output = period === 'day' ? metric.dayOutput : metric.monthOutput;
                const rejection = period === 'day' ? metric.dayRejection : metric.monthRejection;
                const percent = output ? (rejection / output) * 100 : 0;
                return (
                  <tr key={`${period}-${part}-${process}`}>
                    <td className="border-b border-r border-slate-200 px-3 py-2 dark:border-slate-700">{part}</td>
                    <td className="border-b border-r border-slate-200 px-3 py-2 dark:border-slate-700">{process}</td>
                    <td className="border-b border-r border-slate-200 px-3 py-2 text-right dark:border-slate-700">{output}</td>
                    <td className="border-b border-r border-slate-200 px-3 py-2 text-right dark:border-slate-700">{rejection}</td>
                    <td className="border-b border-r border-slate-200 px-3 py-2 text-right dark:border-slate-700">{formatPercent(percent)}</td>
                    <td className="border-b border-r border-slate-200 px-3 py-2 text-right dark:border-slate-700">0</td>
                    <td className="border-b border-slate-200 px-3 py-2 text-right dark:border-slate-700">0</td>
                  </tr>
                );
              })}
              <tr className="bg-blue-50 font-bold dark:bg-blue-900/20">
                <td colSpan="6" className="border-r border-slate-300 px-3 py-2 text-right dark:border-slate-700">Total rejection Cost</td>
                <td className="px-3 py-2 text-right">0</td>
              </tr>
            </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const UserDashboard = ({ user }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
      <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.username || 'User'}.</p>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{user?.username || '-'}</h2>
          <p className="text-sm capitalize text-slate-500 dark:text-slate-400">{user?.role || 'user'}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{user?.email || 'No email provided'}</p>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const now = new Date();
  const [activeReportId, setActiveReportId] = useState(reportTabs[0].id);
  const [activeSubReportId, setActiveSubReportId] = useState(reportTabs[0].subReports[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportDay, setReportDay] = useState(Math.min(now.getDate(), new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()));
  const [rejectionReport, setRejectionReport] = useState(null);
  const [backendMisReports, setBackendMisReports] = useState({});
  const [supplierRows, setSupplierRows] = useState([]);
  const [rejectionOverrides, setRejectionOverrides] = useState({});
  const [drrOverrides, setDrrOverrides] = useState({});
  const periodKey = `${reportYear}-${String(reportMonth).padStart(2, '0')}`;

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get('/inspection/admin/rejection-report', { params: { month: reportMonth, year: reportYear } }),
      api.get('/inspection/admin/mis-dashboard', { params: { month: reportMonth, year: reportYear } }),
      api.get('/mis-operations/bop-receipts', { params: { month: reportMonth, year: reportYear } }),
      api.get('/mis-operations/supplier-rejections', { params: { month: reportMonth, year: reportYear } })
    ])
      .then(([rejectionResponse, misResponse, bopResponse, supplierResponse]) => {
        if (!isMounted) return;
        const report = rejectionResponse.data || {};
        const days = Array.isArray(report.days) ? report.days : [];
        setRejectionReport({
          ...report,
          daysById: days.reduce((acc, day) => {
            acc[`day-${String(day.day).padStart(2, '0')}`] = day;
            return acc;
          }, {})
        });
        const reports = { ...(misResponse.data?.reports || {}) };
        for (const line of ['D1', 'D2', 'D3', 'D4']) {
          const reportId = `${line.toLowerCase()}-bop-parts-receipt`;
          const rows = ['shell', 'eps', 'harness', 'visor'].map((partType) => {
            const values = Array.from({ length: new Date(reportYear, reportMonth, 0).getDate() }, () => 0);
            (bopResponse.data || [])
              .filter((item) => item.productionLine === line && item.partType === partType)
              .forEach((item) => {
                const dayIndex = new Date(item.receivedAt).getDate() - 1;
                values[dayIndex] += Number(item.quantity || 0);
              });
            return {
              defectName: `${partType === 'eps' ? 'EPS' : partType[0].toUpperCase() + partType.slice(1)} Inward Qty`
                .replace('Shell Inward', 'Shell inward'),
              days: values,
              total: values.reduce((sum, value) => sum + value, 0)
            };
          });
          reports[reportId] = {
            productionLine: line,
            reportType: 'bop-parts-receipt',
            days: rows[0].days.map((_, index) => ({
              day: index + 1,
              output: rows.reduce((sum, row) => sum + row.days[index], 0),
              rejection: 0,
              rejectionPercent: 0
            })),
            totals: { output: rows.reduce((sum, row) => sum + row.total, 0), rejection: 0, rejectionPercent: 0 },
            rows
          };
        }
        setBackendMisReports(reports);
        setSupplierRows((supplierResponse.data || []).map((item, index) => ({
          'S.No': index + 1,
          Source: 'Inward',
          Date: new Date(item.inspectedAt).toLocaleDateString('en-GB'),
          'Part no': item.partNumber,
          'Part name': item.partName,
          Supplier: item.supplier,
          'Document Number': item.documentNumber,
          'Rejection Qty': item.rejectionQuantity,
          'Reason for rejection': item.rejectionReason,
          'Action taken': item.actionTaken,
          When: item.actionDate ? new Date(item.actionDate).toLocaleDateString('en-GB') : ''
        })));
      })
      .catch(() => {
        if (isMounted) {
          setRejectionReport({ daysById: {}, totals: { output: 0, rejection: 0, rejectionPercent: 0 }, rows: [] });
          setBackendMisReports({});
          setSupplierRows([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reportMonth, reportYear]);

  const currentDayColumns = useMemo(() => {
    const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return { id: `day-${day}`, label: `${day}/${String(reportMonth).padStart(2, '0')}` };
    });
  }, [reportMonth, reportYear]);

  useEffect(() => {
    const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();
    if (reportDay > daysInMonth) setReportDay(daysInMonth);
  }, [reportDay, reportMonth, reportYear]);

  const activeReport = reportTabs.find((report) => report.id === activeReportId) || reportTabs[0];
  const activeSubReportBase = activeReport.subReports.find((report) => report.id === activeSubReportId) || activeReport.subReports[0];
  const isRejectionReport = activeSubReportBase.type === 'rejection';
  const isDrrReport = activeSubReportBase.type === 'drr';
  const rejectionDayColumns = useMemo(() => {
    const month = rejectionReport?.month || 5;
    const days = Array.isArray(rejectionReport?.days) && rejectionReport.days.length
      ? rejectionReport.days
      : currentDayColumns.map((column, index) => ({ day: index + 1, id: column.id }));

    return days.map((day) => ({
      id: `day-${String(day.day).padStart(2, '0')}`,
      label: `${String(day.day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
    }));
  }, [currentDayColumns, rejectionReport]);
  const editableRejectionReports = useMemo(() => {
    return REJECTION_REPORT_IDS.reduce((reports, reportId) => {
      const rejectionSubReport = reportTabs
        .flatMap((reportGroup) => reportGroup.subReports)
        .find((report) => report.id === reportId);
      const backendReport = backendMisReports[reportId];
      const fallbackReport = reportId === D1_REJECTION_REPORT_ID ? rejectionReport : null;
      const backendRows = backendReport
        ? backendReport.rows.map((row) => ({
            defectGroup: 'Rejection',
            rejectionDetails: row.defectName,
            days: row.days.map((rejection, index) => ({ day: index + 1, rejection })),
            total: row.total
          }))
        : fallbackReport?.rows || [];
      const reportWithTemplateRows = {
        ...(fallbackReport || {}),
        ...(backendReport ? {
          days: backendReport.days.map((day) => ({
            day: day.day,
            output: day.output,
            rejection: day.rejection,
            rejectionPercent: day.rejectionPercent
          })),
          daysById: backendReport.days.reduce((acc, day) => {
            acc[`day-${String(day.day).padStart(2, '0')}`] = {
              output: day.output,
              rejection: day.rejection,
              rejectionPercent: day.rejectionPercent
            };
            return acc;
          }, {}),
          totals: {
            output: backendReport.totals.output,
            rejection: backendReport.totals.rejection,
            rejectionPercent: backendReport.totals.rejectionPercent
          }
        } : {}),
        rows: mergeRejectionRows(rejectionSubReport?.rows || [], backendRows)
      };
      reports[reportId] = buildEditableRejectionReport(
        reportWithTemplateRows,
        rejectionOverrides[`${periodKey}:${reportId}`] || emptyRejectionOverrides(),
        rejectionDayColumns
      );
      return reports;
    }, {});
  }, [backendMisReports, periodKey, rejectionReport, rejectionOverrides, rejectionDayColumns]);
  const activeEditableRejectionReport = isRejectionReport
    ? editableRejectionReports[activeSubReportBase.id]
    : editableRejectionReports[D1_REJECTION_REPORT_ID];
  const editableDrrReports = useMemo(() => {
    const reports = {};
    for (const reportGroup of reportTabs) {
      for (const subReport of reportGroup.subReports) {
        if (!['drr', 'visor-drr'].includes(subReport.type)) continue;
        reports[subReport.id] = buildEditableDrrReport(
          subReport.rows,
          drrOverrides[`${periodKey}:${subReport.id}`] || emptyRejectionOverrides(),
          currentDayColumns,
          backendMisReports[subReport.id]
        );
      }
    }
    return reports;
  }, [backendMisReports, currentDayColumns, drrOverrides, periodKey]);
  const activeEditableDrrReport = editableDrrReports[activeSubReportBase.id] || null;
  const activeSubReport = useMemo(() => {
    if (isDrrReport || activeSubReportBase.type === 'visor-drr') {
      return {
        ...activeSubReportBase,
        rows: activeEditableDrrReport?.rows || []
      };
    }
    if (activeSubReportBase.id === 'supplier-rejection-inward-inspection') {
      return { ...activeSubReportBase, rows: supplierRows };
    }
    if (!isRejectionReport) return activeSubReportBase;
    return {
      ...activeSubReportBase,
      rows: activeEditableRejectionReport?.rows || [],
      dayColumns: rejectionDayColumns
    };
  }, [activeEditableDrrReport?.rows, activeEditableRejectionReport?.rows, activeSubReportBase, isDrrReport, isRejectionReport, rejectionDayColumns, supplierRows]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return activeSubReport.rows;

    return activeSubReport.rows.filter((row) =>
      activeSubReport.descriptorColumns.map((column) => row[column.key])
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [activeSubReport.rows, searchTerm]);

  const primaryDescriptorKey = activeSubReport.descriptorColumns[0]?.key;
  const detailDescriptorKey = activeSubReport.descriptorColumns[activeSubReport.descriptorColumns.length - 1]?.key;
  const primaryGroups = primaryDescriptorKey
    ? new Set(activeSubReport.rows.map((row) => row[primaryDescriptorKey]).filter(Boolean)).size
    : 0;
  const reportRows = activeSubReport.rows.length;
  const detailCount = detailDescriptorKey ? new Set(
    activeSubReport.rows
      .map((row) => row[detailDescriptorKey])
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
  ).size : 0;
  const reportDayColumns = activeSubReport.dayColumns || currentDayColumns;
  const calendarColumns = [...reportDayColumns, ...activeSubReport.totalColumns];
  const hasSummaryRows = activeSubReport.summaryRows.length > 0;
  const calculatedRejectionSummary = isRejectionReport
    ? activeEditableRejectionReport
    : isDrrReport
      ? activeEditableDrrReport
      : activeSubReportBase.type === 'visor-drr'
        ? activeEditableDrrReport
      : null;
  const linkedHelmetRejectionReport = isDrrReport
    ? editableRejectionReports[`d${activeSubReportBase.line}-helmet-assembly-rejection`]
    : null;
  const getSummaryReport = (row) => {
    if (isDrrReport && ['Day Wise Rejection Qty', 'Day Wise Rejection %'].includes(row.label)) {
      return linkedHelmetRejectionReport;
    }
    return calculatedRejectionSummary;
  };
  const isCrsReport = activeSubReportBase.type === 'crs';
  const isMisReport = activeSubReportBase.type === 'mis';
  const crsReports = useMemo(
    () => ({ ...editableDrrReports, ...editableRejectionReports }),
    [editableDrrReports, editableRejectionReports]
  );
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' })
    .format(new Date(reportYear, reportMonth - 1, 1));
  const selectedDayIndex = Math.max(0, Math.min(currentDayColumns.length - 1, reportDay - 1));
  const selectedDayId = currentDayColumns[selectedDayIndex]?.id || `day-${String(reportDay).padStart(2, '0')}`;
  const selectedDayLabel = currentDayColumns[selectedDayIndex]?.label || '';

  const getColumnClass = (column) => {
    if (column.id === 'totalPercent') return totalPercentCellClass;
    if (column.id === 'total') return totalCellClass;
    return dayCellClass;
  };
  const updateRowOverride = (row, dayId, value) => {
    if (!isRejectionReport) return;
    const rowKey = normalizeReportKey(row.rejectionDetails);
    const overrideKey = `${periodKey}:${activeSubReportBase.id}`;
    setRejectionOverrides((current) => ({
      ...current,
      [overrideKey]: {
        ...(current[overrideKey] || emptyRejectionOverrides()),
        rows: {
          ...(current[overrideKey]?.rows || {}),
          [rowKey]: {
            ...(current[overrideKey]?.rows?.[rowKey] || {}),
            [dayId]: value
          }
        }
      }
    }));
  };
  const updateOutputOverride = (dayId, value) => {
    if (!isRejectionReport) return;
    const overrideKey = `${periodKey}:${activeSubReportBase.id}`;
    setRejectionOverrides((current) => ({
      ...current,
      [overrideKey]: {
        ...(current[overrideKey] || emptyRejectionOverrides()),
        output: {
          ...(current[overrideKey]?.output || {}),
          [dayId]: value
        }
      }
    }));
  };
  const updateDrrOverride = (row, dayId, value) => {
    const rowKey = row.drrRowKey;
    const overrideKey = `${periodKey}:${activeSubReportBase.id}`;
    setDrrOverrides((current) => ({
      ...current,
      [overrideKey]: {
        ...(current[overrideKey] || emptyRejectionOverrides()),
        rows: {
          ...(current[overrideKey]?.rows || {}),
          [rowKey]: {
            ...(current[overrideKey]?.rows?.[rowKey] || {}),
            [dayId]: value
          }
        }
      }
    }));
  };
  const saveBopValue = async (row, column, value) => {
    if (activeReportId !== 'bop-parts-receipt') return;
    const partType = String(row.defectDetails || '').split(' ')[0].toLowerCase();
    const day = getDayNumberFromColumn(column);
    await api.post('/mis-operations/bop-receipts', {
      productionLine: `D${activeSubReportBase.line}`,
      partType,
      quantity: toNumber(value),
      receivedAt: new Date(reportYear, reportMonth - 1, day, 12).toISOString()
    });
  };
  const updateDrrOutputOverride = (dayId, value) => {
    const overrideKey = `${periodKey}:${activeSubReportBase.id}`;
    setDrrOverrides((current) => ({
      ...current,
      [overrideKey]: {
        ...(current[overrideKey] || emptyRejectionOverrides()),
        output: {
          ...(current[overrideKey]?.output || {}),
          [dayId]: value
        }
      }
    }));
  };
  const editableCellClass = 'h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-1 text-center text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Inventory Pro MIS reports for production quality performance.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-slate-500 dark:text-slate-400">Groups</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{primaryGroups}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-slate-500 dark:text-slate-400">Rows</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{reportRows}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-slate-500 dark:text-slate-400">Details</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{detailCount}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex overflow-x-auto">
          <div className="inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-primary-600 px-4 py-3 text-sm font-semibold text-primary-700 dark:border-primary-400 dark:text-primary-300">
            <ClipboardList className="h-4 w-4" />
            MIS Helmet Quality Performance Report
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 overflow-x-auto">
          {reportTabs.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => {
                setActiveReportId(report.id);
                setActiveSubReportId(report.subReports[0].id);
              }}
              className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeReportId === report.id
                  ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              {report.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {activeReport.subReports.map((subReport) => (
            <button
              key={subReport.id}
              type="button"
              onClick={() => setActiveSubReportId(subReport.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition ${
                activeSubReportId === subReport.id
                  ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {subReport.name}
            </button>
          ))}
        </div>

        {isMisReport ? (
          <label className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
            Date
            <input
              type="date"
              value={`${reportYear}-${String(reportMonth).padStart(2, '0')}-${String(reportDay).padStart(2, '0')}`}
              onChange={(event) => {
                const [year, month, day] = event.target.value.split('-').map(Number);
                if (year && month && day) {
                  setReportYear(year);
                  setReportMonth(month);
                  setReportDay(day);
                }
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>
        ) : isCrsReport ? (
          <label className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
            Month
            <input
              type="month"
              value={`${reportYear}-${String(reportMonth).padStart(2, '0')}`}
              onChange={(event) => {
                const [year, month] = event.target.value.split('-').map(Number);
                if (year && month) {
                  setReportYear(year);
                  setReportMonth(month);
                }
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>
        ) : (
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search this report"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {isMisReport ? (
        <div className="space-y-4">
          <div className="border border-slate-200 bg-white px-5 py-4 text-center dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">HELMET - PARTWISE QUALITY PERFORMANCE REPORT</h2>
          </div>
          {[1, 2, 3, 4].map((line) => (
            <MisLineTable
              key={line}
              line={line}
              reports={crsReports}
              dayIndex={selectedDayIndex}
              dayId={selectedDayId}
              dayLabel={selectedDayLabel}
              monthLabel={monthLabel}
            />
          ))}
        </div>
      ) : isCrsReport ? (
        <section className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Helmet - Consolidated Rejection Status - {monthLabel}
            </h2>
          </div>
          <div className="space-y-4 p-4">
            {crsLayout.map((row, rowIndex) => (
              <div key={`crs-row-${rowIndex}`} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {row.map((item) => (
                  <CumulativeBlock key={item.title} item={item} reports={crsReports} monthLabel={monthLabel} />
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{activeSubReport.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Source: {activeSubReport.sourceFileName}</p>
        </div>

        <div className="flex overflow-hidden">
          <div className={activeSubReport.type === 'static-table' ? 'min-w-0 flex-1 overflow-x-auto' : 'shrink-0'}>
            <table className="border-separate border-spacing-0 text-sm">
              <thead className="bg-blue-100 dark:bg-slate-900">
                <tr className={reportRowClass}>
                  {hasSummaryRows ? (
                    <th
                      colSpan={activeSubReport.descriptorColumns.length}
                      style={{
                        minWidth: activeSubReport.descriptorColumns.reduce((sum, column) => sum + column.width, 0)
                      }}
                      className={`${cellHeightClass} ${gridBorderClass} bg-blue-100 px-4 py-3 text-center font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                    >
                      Description
                    </th>
                  ) : activeSubReport.descriptorColumns.map((column) => (
                    <th
                      key={column.key}
                      style={{ minWidth: column.width, width: column.width }}
                      className={`${cellHeightClass} ${gridBorderClass} bg-blue-100 px-4 py-3 text-left font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeSubReport.summaryRows.map((row) => (
                  <tr key={row.label} className={reportRowClass}>
                    <td
                      colSpan={activeSubReport.descriptorColumns.length}
                      style={{
                        minWidth: activeSubReport.descriptorColumns.reduce((sum, column) => sum + column.width, 0)
                      }}
                      className={`${cellHeightClass} ${gridBorderClass} bg-white px-4 py-2 text-right font-semibold text-slate-900 dark:bg-slate-800 dark:text-white`}
                    >
                      {row.label}
                    </td>
                  </tr>
                ))}
                <tr className="h-3">
                  <td
                    colSpan={activeSubReport.descriptorColumns.length}
                    className={`${gridBorderClass} bg-white dark:bg-slate-800`}
                  />
                </tr>
                {hasSummaryRows && (
                  <tr className={reportRowClass}>
                    {isRejectionReport ? (
                      <th
                        colSpan={activeSubReport.descriptorColumns.length}
                        style={{
                          minWidth: activeSubReport.descriptorColumns.reduce((sum, column) => sum + column.width, 0)
                        }}
                        className={`${cellHeightClass} ${gridBorderClass} bg-blue-100 px-4 py-3 text-left font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                      >
                        DEFECTS
                      </th>
                    ) : activeSubReport.descriptorColumns.map((column) => (
                      <th
                        key={`detail-header-${column.key}`}
                        style={{ minWidth: column.width, width: column.width }}
                        className={`${cellHeightClass} ${gridBorderClass} bg-blue-100 px-4 py-3 text-left font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                )}
                {filteredRows.map((row, index) => (
                  <tr key={`${activeSubReport.id}-descriptors-${index}`} className={`${reportRowClass} hover:bg-slate-50 dark:hover:bg-slate-700/40`}>
                    {activeSubReport.descriptorColumns.map((column, columnIndex) => (
                      <td
                        key={`${activeSubReport.id}-${column.key}-${index}`}
                        style={{ minWidth: column.width, width: column.width }}
                        className={`${cellHeightClass} ${gridBorderClass} bg-white px-4 py-2 dark:bg-slate-800 ${
                          columnIndex === 0
                            ? 'truncate font-medium text-slate-900 dark:text-white'
                            : 'truncate text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {calendarColumns.length > 0 && (
          <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
            <table className="min-w-max border-separate border-spacing-0 text-sm">
              <thead className="bg-blue-100 dark:bg-slate-900">
                <tr className={reportRowClass}>
                  {calendarColumns.map((column) => (
                    <th
                      key={column.id}
                      className={`${getColumnClass(column)} font-semibold text-slate-900 dark:text-slate-100`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeSubReport.summaryRows.map((row) => (
                  <tr key={`${row.label}-calendar`} className={reportRowClass}>
                    {reportDayColumns.map((column) => (
                      <td
                        key={`${row.label}-${column.id}`}
                        className={`${dayCellClass} bg-white ${
                          row.isPercent ? 'text-amber-900 dark:text-amber-200' : 'text-slate-900 dark:text-slate-100'
                        } dark:bg-slate-800`}
                      >
                        {isRejectionReport && row.metric === 'output' ? (
                          <input
                            type="number"
                            min="0"
                            value={row.getValue(column, activeEditableRejectionReport)}
                            onChange={(event) => updateOutputOverride(column.id, event.target.value)}
                            className={editableCellClass}
                          />
                        ) : ((isDrrReport || activeSubReportBase.type === 'visor-drr') && row.metric === 'output') ? (
                          <input
                            type="number"
                            min="0"
                            value={row.getValue(column, getSummaryReport(row))}
                            onChange={(event) => updateDrrOutputOverride(column.id, event.target.value)}
                            className={editableCellClass}
                          />
                        ) : (
                          row.getValue(column, getSummaryReport(row))
                        )}
                      </td>
                    ))}
                    <td className={`${totalCellClass} font-semibold text-slate-900 dark:text-slate-100`}>
                      {getCellValue(row.total, getSummaryReport(row))}
                    </td>
                    <td
                      className={`${totalPercentCellClass} font-semibold ${
                        getCellValue(row.totalPercent, getSummaryReport(row)) ? 'bg-orange-100 text-slate-900 dark:bg-orange-900/40 dark:text-orange-100' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {getCellValue(row.totalPercent, getSummaryReport(row))}
                    </td>
                  </tr>
                ))}
                <tr className="h-3">
                  <td colSpan={calendarColumns.length} className={`${gridBorderClass} bg-white dark:bg-slate-800`} />
                </tr>
                {hasSummaryRows && (
                  <tr className={reportRowClass}>
                    {calendarColumns.map((column) => (
                      <th
                        key={`detail-date-header-${column.id}`}
                        className={`${getColumnClass(column)} font-semibold text-slate-900 dark:text-slate-100`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                )}
                {filteredRows.map((row, index) => (
                  <tr key={`${activeSubReport.id}-calendar-${index}`} className={reportRowClass}>
                    {reportDayColumns.map((column, dayIndex) => (
                      <td key={`${activeSubReport.id}-${column.id}-${index}`} className={`${dayCellClass} text-slate-700 dark:text-slate-300`}>
                        {isRejectionReport ? (
                          <input
                            type="number"
                            min="0"
                            value={row.days?.[dayIndex]?.rejection || ''}
                            onChange={(event) => updateRowOverride(row, column.id, event.target.value)}
                            className={editableCellClass}
                          />
                        ) : (isDrrReport || activeSubReportBase.type === 'visor-drr') ? (
                          <input
                            type="number"
                            min="0"
                            value={row.days?.[dayIndex] || ''}
                            onChange={(event) => updateDrrOverride(row, column.id, event.target.value)}
                            onBlur={(event) => saveBopValue(row, column, event.target.value)}
                            className={editableCellClass}
                          />
                        ) : ''}
                      </td>
                    ))}
                    <td className={`${totalCellClass} text-slate-900 dark:text-slate-100`}>
                      {isRejectionReport || isDrrReport || activeSubReportBase.type === 'visor-drr' ? row.total || 0 : 0}
                    </td>
                    <td className={`${totalPercentCellClass} text-slate-900 dark:text-slate-100`}>
                      {isRejectionReport ? formatPercent(row.totalPercent) : '0.00%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {filteredRows.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No report rows match your search.
          </div>
        )}
      </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <UserDashboard user={user} />;
};

export default Dashboard;
