import { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardList, Download, FileSpreadsheet, Search, User } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api, misOperationsAPI, productAPI } from '../api/api';
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
import { shellMouldingInspectionReports } from '../data/shellMouldingInspectionData';
import { visorPdiirInspectionReports } from '../data/visorPdiirInspectionData';
import { d1VmBaseInspectionReports } from '../data/d1VmBaseInspectionData';

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
    label: 'Day Wise Total Rework',
    getValue: (column, report) => report?.daysById?.[column.id]?.rework ?? 0,
    total: (report) => report?.totals?.rework ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Total Rework %',
    getValue: (column, report) => formatPercent(report?.daysById?.[column.id]?.reworkPercent ?? 0),
    total: (report) => formatPercent(report?.totals?.reworkPercent ?? 0),
    totalPercent: '',
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

const dynamicRejectionSummaryRows = [
  {
    label: 'Day wise Total Production',
    metric: 'output',
    getValue: (column, report) => report?.daysById?.[column.id]?.output ?? 0,
    total: (report) => report?.totals?.output ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Rejection Qty',
    getValue: (column, report) => report?.daysById?.[column.id]?.rejection ?? 0,
    total: (report) => report?.totals?.rejection ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Rejection %',
    getValue: (column, report) => formatPercent(report?.daysById?.[column.id]?.rejectionPercent ?? 0),
    total: (report) => formatPercent(report?.totals?.rejectionPercent ?? 0),
    totalPercent: '',
    isPercent: true,
  },
];

const dynamicReworkSummaryRows = [
  {
    label: 'Day wise Total Production',
    metric: 'output',
    getValue: (column, report) => report?.daysById?.[column.id]?.output ?? 0,
    total: (report) => report?.totals?.output ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Rework Qty',
    getValue: (column, report) => report?.daysById?.[column.id]?.rejection ?? 0,
    total: (report) => report?.totals?.rejection ?? 0,
    totalPercent: '',
  },
  {
    label: 'Day Wise Rework %',
    getValue: (column, report) => formatPercent(report?.daysById?.[column.id]?.rejectionPercent ?? 0),
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

const reworkSummaryRows = rejectionSummaryRows.map((row) => ({
  ...row,
  label: row.label
    .replace('TOTAL REJECTION', 'TOTAL REWORK')
    .replace('PERCENTAGE OF REJECTION', 'PERCENTAGE OF REWORK')
}));

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
          defectMode: 'reject',
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
        },
        {
          id: `d${line}-helmet-assembly-rework`,
          line,
          type: 'rejection',
          defectMode: 'rework',
          name: `D${line} - Helmet Assembly Rework`,
          sourceFileName: `${rejectionReport.sourceFileName} / Rework`,
          descriptorColumns: line >= 3
            ? [{ key: 'rejectionDetails', label: 'Defects', width: 640 }]
            : [
                { key: 'defectGroup', label: 'Defects', width: 220 },
                { key: 'rejectionDetails', label: 'Rework Details', width: 420 },
              ],
          summaryRows: reworkSummaryRows,
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

const visibleDashboardReportIds = new Set([
  'mis-quality-performance',
  'consolidated-rejection-status',
  'helmet-quality-performance',
  'visor-moulding-quality-performance'
]);
const visibleStaticReportTabs = reportTabs.filter((report) => visibleDashboardReportIds.has(report.id));
const productCategoryColumns = [
  { key: 'productName', label: 'Product', width: 220 },
  { key: 'code', label: 'Code', width: 140 },
  { key: 'categoryName', label: 'Category', width: 160 },
  { key: 'subcategoryName', label: 'Sub Category', width: 180 },
  { key: 'stockQuantity', label: 'Stock', width: 90 },
  { key: 'numberOfItems', label: 'Items', width: 90 },
  { key: 'brandName', label: 'Brand', width: 140 },
  { key: 'model', label: 'Model', width: 140 }
];

const D1_REJECTION_REPORT_ID = 'd1-helmet-assembly-rejection';
const REJECTION_REPORT_IDS = [1, 2, 3, 4].map((line) => `d${line}-helmet-assembly-rejection`);
const REWORK_REPORT_IDS = [1, 2, 3, 4].map((line) => `d${line}-helmet-assembly-rework`);
const DEFECT_COUNT_REPORT_IDS = [...REJECTION_REPORT_IDS, ...REWORK_REPORT_IDS];
const emptyRejectionOverrides = () => ({ output: {}, rows: {} });
const dashboardReportFamilies = [
  { id: 'helmet-mis', name: 'MIS Helmet Quality Performance Report' },
  { id: 'inspection', name: 'Inspection' },
];
const visibleDashboardFamilies = dashboardReportFamilies.filter((family) => family.id === 'helmet-mis');
const inspectionReportFamilies = [
  { id: 'shell-moulding-inspection', name: 'Shell Moulding Inspection Report' },
  { id: 'visor-pdiir-inspection', name: 'VISOR PDIIR Report' },
  { id: 'd1-vm-base-rh-lh-inspection', name: 'D1 VM BASE RH/LH Report' },
];
const shellInspectionGroups = shellMouldingInspectionReports.reduce((groups, report) => {
  if (!groups.some((group) => group.id === report.groupId)) {
    groups.push({ id: report.groupId, name: report.groupName });
  }
  return groups;
}, []);
const visorPdiirGroups = visorPdiirInspectionReports.reduce((groups, report) => {
  if (!groups.some((group) => group.id === report.groupId)) {
    groups.push({ id: report.groupId, name: report.groupName });
  }
  return groups;
}, []);
const d1VmBaseGroups = d1VmBaseInspectionReports.reduce((groups, report) => {
  if (!groups.some((group) => group.id === report.groupId)) {
    groups.push({ id: report.groupId, name: report.groupName });
  }
  return groups;
}, []);

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
const subQuestionColumnKey = (value) => `subQuestion:${normalizeReportKey(value)}`;
const getRejectionRowKey = (row) => normalizeReportKey([
  row?.questionHeader,
  row?.questionAnswer,
  row?.partDetails,
  row?.subQuestion,
  row?.subOption,
  row?.rejectionDetails
].filter(Boolean).join(' | ') || row?.rejectionDetails);
const hasQuestionnaireSubDetail = (row) => {
  const detail = String(row?.defectName || row?.defectDetails || row?.rejectionDetails || '').trim();
  const question = String(row?.questionHeader || '').trim();
  const answer = String(row?.questionAnswer || '').trim();
  const normalizedDetail = normalizeReportKey(detail);
  return Boolean(
    row?.hasSubQuestion ||
    (question && answer && detail && normalizedDetail !== normalizeReportKey(question) && normalizedDetail !== normalizeReportKey(answer))
  );
};
const sanitizeSheetName = (name, usedNames = new Set()) => {
  const baseName = String(name || 'Sheet')
    .replace(/[:\\/?*[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 31) || 'Sheet';
  let sheetName = baseName;
  let index = 2;
  while (usedNames.has(sheetName)) {
    const suffix = ` ${index}`;
    sheetName = `${baseName.slice(0, 31 - suffix.length)}${suffix}`;
    index += 1;
  }
  usedNames.add(sheetName);
  return sheetName;
};
const excelColumn = (index) => XLSX.utils.encode_col(index);
const numericCell = (value) => Number(value || 0);
const exportBorder = {
  top: { style: 'thin', color: { rgb: 'CBD5E1' } },
  right: { style: 'thin', color: { rgb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
  left: { style: 'thin', color: { rgb: 'CBD5E1' } }
};
const exportStyles = {
  title: {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 },
    fill: { fgColor: { rgb: '1E3A8A' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: exportBorder
  },
  meta: {
    font: { bold: true, color: { rgb: '334155' } },
    fill: { fgColor: { rgb: 'E2E8F0' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: exportBorder
  },
  header: {
    font: { bold: true, color: { rgb: '0F172A' } },
    fill: { fgColor: { rgb: 'BFDBFE' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: exportBorder
  },
  subHeader: {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '2563EB' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: exportBorder
  },
  summary: {
    font: { bold: true, color: { rgb: '7C2D12' } },
    fill: { fgColor: { rgb: 'FED7AA' } },
    alignment: { vertical: 'center', wrapText: true },
    border: exportBorder
  },
  total: {
    font: { bold: true, color: { rgb: '0F172A' } },
    fill: { fgColor: { rgb: 'DBEAFE' } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: exportBorder
  },
  section: {
    font: { bold: true, color: { rgb: '1E3A8A' } },
    fill: { fgColor: { rgb: 'EFF6FF' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: exportBorder
  },
  data: {
    fill: { fgColor: { rgb: 'FFFFFF' } },
    alignment: { vertical: 'center', wrapText: true },
    border: exportBorder
  },
  number: {
    fill: { fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: exportBorder
  }
};
const mergeStyles = (...styles) => styles.reduce((merged, style) => ({
  ...merged,
  ...style,
  font: { ...(merged.font || {}), ...(style.font || {}) },
  fill: { ...(merged.fill || {}), ...(style.fill || {}) },
  alignment: { ...(merged.alignment || {}), ...(style.alignment || {}) },
  border: style.border || merged.border
}), {});
const styleWorksheet = (worksheet, rows, options = {}) => {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
  const headerRows = new Set(options.headerRows || []);
  const subHeaderRows = new Set(options.subHeaderRows || []);
  const summaryRows = new Set(options.summaryRows || []);
  const totalRows = new Set(options.totalRows || []);
  const sectionRows = new Set(options.sectionRows || []);
  const metaRows = new Set(options.metaRows || []);
  const numericColumns = new Set(options.numericColumns || []);
  const percentColumns = new Set(options.percentColumns || []);
  const percentCells = new Set(options.percentCells || []);

  for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
    const isBlankRow = (rows[rowIndex] || []).every((value) => value === '' || value == null);
    if (isBlankRow) continue;

    for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex += 1) {
      const address = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      if (!worksheet[address]) worksheet[address] = { t: 's', v: '' };
      const cell = worksheet[address];
      const isPercentCell = percentColumns.has(colIndex) || percentCells.has(address);
      const isNumber = cell.t === 'n' || numericColumns.has(colIndex) || isPercentCell;
      let style = isNumber ? exportStyles.number : exportStyles.data;
      if (rowIndex === 0) style = exportStyles.title;
      else if (metaRows.has(rowIndex)) style = exportStyles.meta;
      else if (subHeaderRows.has(rowIndex)) style = exportStyles.subHeader;
      else if (headerRows.has(rowIndex)) style = exportStyles.header;
      else if (summaryRows.has(rowIndex)) style = exportStyles.summary;
      else if (totalRows.has(rowIndex)) style = exportStyles.total;
      else if (sectionRows.has(rowIndex)) style = exportStyles.section;
      cell.s = mergeStyles(style, cell.s || {});
      if (isPercentCell || String(cell.z || '').includes('%')) cell.z = '0.00%';
    }
  }

  worksheet['!rows'] = rows.map((row, index) => ({
    hpt: index === 0 ? 26 : (row || []).some((value) => String(value || '').length > 35) ? 32 : 22
  }));
};
const getShellInspectionRowKey = (row, index) => `${index}-${normalizeReportKey(row.characteristic)}-${normalizeReportKey(row.inspectionMethod)}`;
const toNumber = (value) => Math.max(0, Number(value) || 0);
const normalizeInspectionDecision = (value) => {
  const normalized = normalizeReportKey(value).replace(/[\s_-]+/g, '');
  if (['a', 'acc', 'accept', 'accepted', 'ok', 'pass', 'passed'].includes(normalized)) return 'accepted';
  if (['r', 'rej', 'reject', 'rejected', 'ng', 'fail', 'failed'].includes(normalized)) return 'rejected';
  if (['rw', 'rework', 'reworked'].includes(normalized)) return 'rework';
  return '';
};
const emptyShellStageCounts = () => Array.from({ length: 5 }, (_, index) => ({
  stage: index + 1,
  accepted: 0,
  rejected: 0,
  rework: 0
}));
const getShellStageCounts = (rows) => rows.reduce((counts, row) => {
  if (row.type === 'section') return counts;
  (row.samples || []).slice(0, 5).forEach((sample, index) => {
    const decision = normalizeInspectionDecision(sample);
    if (decision) counts[index][decision] += 1;
  });
  return counts;
}, emptyShellStageCounts());
const getDayNumberFromColumn = (column) => Number(String(column?.id || '').match(/(\d+)$/)?.[1] || 0);
const getRejectionDayValue = (report, column, metric) => {
  const dayNumber = getDayNumberFromColumn(column);
  const dayKey = `day-${String(dayNumber).padStart(2, '0')}`;
  return report?.daysById?.[dayKey]?.[metric] ?? 0;
};

const buildEditableDrrReport = (rows, overrides, columns, backendReport = null, metric = 'rejection') => {
  const outputOverrides = overrides.output || {};
  const rowOverrides = overrides.rows || {};
  const backendRows = backendReport?.rows || [];
  const hasRowOverrides = Object.keys(rowOverrides).length > 0;
  const editableRows = backendRows.map((backendRow) => {
    const rowKey = `backend-${normalizeReportKey(backendRow.defectCode || backendRow.defectName)}`;
    const dayOverrides = rowOverrides[rowKey] || {};
    const days = columns.map((column, dayIndex) =>
      toNumber(dayOverrides[column.id] ?? backendRow.days?.[dayIndex] ?? 0)
    );
    const subQuestion = String(backendRow.subQuestion || '').trim();
    const subOption = String(backendRow.subOption || '').trim();
    return {
      questionHeader: backendRow.questionHeader || '',
      questionAnswer: backendRow.questionAnswer || '',
      subQuestion,
      subOption,
      ...(subQuestion && subOption ? { [subQuestionColumnKey(subQuestion)]: subOption } : {}),
      hasSubQuestion: hasQuestionnaireSubDetail(backendRow),
      assemblyProcess: backendRow.questionAnswer || backendRow.assemblyProcess || backendReport.processName || '',
      partDetails: backendRow.partName || backendReport.partName || '',
      defectDetails: hasQuestionnaireSubDetail(backendRow) && !subOption ? (backendRow.defectName || 'Unspecified') : '',
      drrRowKey: rowKey,
      days,
      total: days.reduce((sum, value) => sum + value, 0)
    };
  });

  const days = columns.map((column, dayIndex) => {
    const output = toNumber(outputOverrides[column.id] ?? backendReport?.days?.[dayIndex]?.output ?? 0);
    const rowRejection = editableRows.reduce((sum, row) => sum + toNumber(row.days[dayIndex]), 0);
    const backendDay = backendReport?.days?.[dayIndex];
    const rejected = toNumber(backendDay?.rejected ?? backendDay?.rejection ?? 0);
    const backendRejection = metric === 'rework'
      ? backendDay?.rework
      : metric === 'rejectionAndRework' || backendReport?.reportType === 'helmet-assembly'
        ? backendDay?.rejectionAndRework ?? rejected + toNumber(backendDay?.rework)
        : backendDay?.rejection;
    const rework = toNumber(backendDay?.rework ?? 0);
    const rejection = hasRowOverrides ? rowRejection : toNumber(backendRejection ?? rowRejection);
    return {
      output,
      rejected,
      rejection,
      rejectionPercent: output ? Number(((rejection / output) * 100).toFixed(2)) : 0,
      rework,
      reworkPercent: output ? Number(((rework / output) * 100).toFixed(2)) : 0
    };
  });
  const totals = days.reduce(
    (acc, day) => ({ output: acc.output + day.output, rejection: acc.rejection + day.rejection, rework: acc.rework + day.rework }),
    { output: 0, rejection: 0, rework: 0 }
  );
  totals.rejectionPercent = totals.output
    ? Number(((totals.rejection / totals.output) * 100).toFixed(2))
    : 0;
  totals.reworkPercent = totals.output
    ? Number(((totals.rework / totals.output) * 100).toFixed(2))
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

const applyEmployeeSheetAggregateToDrrReport = (report, aggregateRows = [], metric = 'rejection') => {
  if (!report) return report;
  const rowsByKey = new Map((aggregateRows || []).map((row) => [
    `${row._id?.rowKey}:${row._id?.day}`,
    Number(row.value || 0)
  ]));

  const rows = (report.rows || []).map((row) => {
    const days = (row.days || []).map((value, index) => value + (rowsByKey.get(`${row.drrRowKey}:${index + 1}`) || 0));
    return {
      ...row,
      days,
      total: days.reduce((sum, value) => sum + value, 0)
    };
  });

  const days = (report.days || []).map((day, index) => {
    const rowTotal = rows.reduce((sum, row) => sum + toNumber(row.days?.[index]), 0);
    const rejection = metric === 'rejectionAndRework'
      ? toNumber(day.rejected) + toNumber(day.rework)
      : rowTotal;
    return {
      ...day,
      rejection,
      rejectionPercent: day.output ? Number(((rejection / day.output) * 100).toFixed(2)) : 0
    };
  });
  const totals = days.reduce(
    (acc, day) => ({
      output: acc.output + day.output,
      rejection: acc.rejection + day.rejection,
      rework: acc.rework + toNumber(day.rework)
    }),
    { output: 0, rejection: 0, rework: 0 }
  );
  totals.rejectionPercent = totals.output ? Number(((totals.rejection / totals.output) * 100).toFixed(2)) : 0;
  totals.reworkPercent = totals.output ? Number(((totals.rework / totals.output) * 100).toFixed(2)) : 0;

  return {
    ...report,
    rows,
    days,
    daysById: days.reduce((acc, day, index) => {
      acc[Object.keys(report.daysById || {})[index] || `day-${String(index + 1).padStart(2, '0')}`] = day;
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
    const rowKey = getRejectionRowKey(row);
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

const applyEmployeeSheetAggregateToRejectionReport = (report, aggregateRows = [], dayColumnsForReport = []) => {
  if (!report) return report;
  const rowsByKey = new Map((aggregateRows || []).map((row) => [
    `${row._id?.rowKey}:${row._id?.day}`,
    Number(row.value || 0)
  ]));

  const rows = (report.rows || []).map((row) => {
    const rowKey = getRejectionRowKey(row);
    const days = dayColumnsForReport.map((column, index) => {
      const baseDay = row.days?.[index] || {};
      return {
        ...baseDay,
        rejection: toNumber(baseDay.rejection) + (rowsByKey.get(`${rowKey}:${index + 1}`) || 0)
      };
    });
    const total = days.reduce((sum, day) => sum + toNumber(day.rejection), 0);
    return { ...row, days, total };
  });

  const days = dayColumnsForReport.map((column, index) => {
    const baseDay = report.daysById?.[column.id] || report.days?.[index] || {};
    const rejection = rows.reduce((sum, row) => sum + toNumber(row.days?.[index]?.rejection), 0);
    return {
      ...baseDay,
      rejection,
      rejectionPercent: baseDay.output ? Number(((rejection / baseDay.output) * 100).toFixed(2)) : 0
    };
  });
  const totals = days.reduce(
    (acc, day) => ({ output: acc.output + toNumber(day.output), rejection: acc.rejection + toNumber(day.rejection), rejectionPercent: 0 }),
    { output: 0, rejection: 0, rejectionPercent: 0 }
  );
  totals.rejectionPercent = totals.output ? Number(((totals.rejection / totals.output) * 100).toFixed(2)) : 0;

  return {
    ...report,
    rows: rows.map((row) => ({
      ...row,
      totalPercent: totals.rejection ? Number(((row.total / totals.rejection) * 100).toFixed(2)) : 0
    })),
    days,
    daysById: days.reduce((acc, day, index) => {
      acc[dayColumnsForReport[index].id] = day;
      return acc;
    }, {}),
    totals
  };
};

const gridBorderClass = 'border-r border-b border-slate-300 dark:border-slate-700';
const cellHeightClass = 'h-12 max-h-12 overflow-hidden whitespace-nowrap';
const dayCellClass = `w-16 min-w-16 max-w-16 ${cellHeightClass} ${gridBorderClass} px-1 py-2 text-center`;
const totalCellClass = `w-16 min-w-16 max-w-16 ${cellHeightClass} ${gridBorderClass} bg-blue-100 px-1 py-2 text-center dark:bg-blue-950`;
const totalPercentCellClass = `w-20 min-w-20 max-w-20 ${cellHeightClass} ${gridBorderClass} bg-blue-100 px-1 py-2 text-center dark:bg-blue-950`;
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

const ShellMouldingInspectionTable = ({ report, rows, stageCounts = [], onSampleChange, onRemarksChange, onSaveRow }) => (
  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{report.reportTitle}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">Source: {report.sourceFileName}</p>
    </div>

    {stageCounts.length > 0 && (
    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
      <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Stage totals from inspection rows</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stageCounts.map((stage) => (
          <div key={stage.stage} className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Stage {stage.stage}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">{stage.accepted}</p>
                <p className="text-slate-500 dark:text-slate-400">Accepted</p>
              </div>
              <div>
                <p className="font-semibold text-rose-700 dark:text-rose-300">{stage.rejected}</p>
                <p className="text-slate-500 dark:text-slate-400">Rejected</p>
              </div>
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-300">{stage.rework}</p>
                <p className="text-slate-500 dark:text-slate-400">Rework</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    )}

    <div className="max-h-[70vh] overflow-auto">
      <table className="min-w-[1100px] w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-blue-100 dark:bg-slate-900">
          <tr className={reportRowClass}>
            {['SI. No', 'Characteristics Description', 'Specification', 'Inspection Method', '1', '2', '3', '4', '5', 'Remarks'].map((header) => (
              <th
                key={header}
                className={`${cellHeightClass} ${gridBorderClass} sticky top-0 z-20 bg-blue-100 px-3 py-3 text-left font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100 ${
                  ['1', '2', '3', '4', '5'].includes(header) ? 'w-20 text-center' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const samples = Array.from({ length: 5 }, (_, index) => row.samples?.[index] || '');

            return row.type === 'section' ? (
            <tr key={`${row.title}-${rowIndex}`} className={reportRowClass}>
              <td
                colSpan={10}
                className={`${cellHeightClass} border-b border-slate-300 bg-blue-50 px-3 py-2 text-left text-sm font-bold uppercase tracking-wide text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100`}
              >
                {row.title}
              </td>
            </tr>
          ) : (
            <tr key={`${row.characteristic}-${rowIndex}`} className={reportRowClass}>
              <td className={`${cellHeightClass} ${gridBorderClass} w-20 px-3 py-2 text-center text-slate-700 dark:text-slate-200`}>{row.sno}</td>
              <td className={`${cellHeightClass} ${gridBorderClass} min-w-[280px] px-3 py-2 font-medium text-slate-900 dark:text-white`}>{row.characteristic}</td>
              <td className={`${cellHeightClass} ${gridBorderClass} min-w-[220px] px-3 py-2 text-slate-700 dark:text-slate-200`}>{row.specification}</td>
              <td className={`${cellHeightClass} ${gridBorderClass} min-w-[190px] px-3 py-2 text-slate-700 dark:text-slate-200`}>{row.inspectionMethod}</td>
              {samples.map((sample, sampleIndex) => (
                <td key={`${rowIndex}-${sampleIndex}`} className={`${cellHeightClass} ${gridBorderClass} w-20 px-2 py-2 text-center text-slate-700 dark:text-slate-200`}>
                  <input
                    type="text"
                    value={sample}
                    onChange={(event) => onSampleChange(row, sampleIndex, event.target.value)}
                    onBlur={() => onSaveRow(row)}
                    className="h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-1 text-center text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  />
                </td>
              ))}
              <td className={`${cellHeightClass} border-b border-slate-200 px-3 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200`}>
                <input
                  type="text"
                  value={row.remarks}
                  onChange={(event) => onRemarksChange(row, event.target.value)}
                  onBlur={() => onSaveRow(row)}
                  className="h-8 w-full min-w-[180px] rounded border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminDashboard = ({
  title = 'Dashboard',
  subtitle = 'Inventory Pro MIS reports for production quality performance.',
  allowedReportIds = null,
  showInspectionReports = true,
}) => {
  const now = new Date();
  const [activeDashboardFamilyId, setActiveDashboardFamilyId] = useState(dashboardReportFamilies[0].id);
  const [activeInspectionFamilyId, setActiveInspectionFamilyId] = useState(inspectionReportFamilies[0].id);
  const [activeShellInspectionGroupId, setActiveShellInspectionGroupId] = useState(shellInspectionGroups[0].id);
  const [activeShellInspectionId, setActiveShellInspectionId] = useState(shellMouldingInspectionReports[0].id);
  const [activeVisorPdiirGroupId, setActiveVisorPdiirGroupId] = useState(visorPdiirGroups[0].id);
  const [activeVisorPdiirId, setActiveVisorPdiirId] = useState(visorPdiirInspectionReports[0].id);
  const [activeD1VmBaseGroupId, setActiveD1VmBaseGroupId] = useState(d1VmBaseGroups[0].id);
  const [activeD1VmBaseId, setActiveD1VmBaseId] = useState(d1VmBaseInspectionReports[0].id);
  const [activeReportId, setActiveReportId] = useState(reportTabs[0].id);
  const [activeSubReportId, setActiveSubReportId] = useState(reportTabs[0].subReports[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportScrollMode, setReportScrollMode] = useState('calendar');
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportDay, setReportDay] = useState(Math.min(now.getDate(), new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()));
  const [rejectionReport, setRejectionReport] = useState(null);
  const [backendMisReports, setBackendMisReports] = useState({});
  const [employeeSheetAggregates, setEmployeeSheetAggregates] = useState({});
  const [productCategories, setProductCategories] = useState([]);
  const [productSubcategories, setProductSubcategories] = useState([]);
  const [dashboardProducts, setDashboardProducts] = useState([]);
  const [supplierRows, setSupplierRows] = useState([]);
  const [quickReportMenu, setQuickReportMenu] = useState(null);
  const quickReportMenuCloseTimer = useRef(null);
  const [shellInspectionEntries, setShellInspectionEntries] = useState({});
  const [visorPdiirEntries, setVisorPdiirEntries] = useState({});
  const [d1VmBaseEntries, setD1VmBaseEntries] = useState({});
  const [rejectionOverrides, setRejectionOverrides] = useState({});
  const [drrOverrides, setDrrOverrides] = useState({});
  const periodKey = `${reportYear}-${String(reportMonth).padStart(2, '0')}`;
  const inspectionDateValue = `${reportYear}-${String(reportMonth).padStart(2, '0')}-${String(reportDay).padStart(2, '0')}`;

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      productAPI.getCategories(),
      productAPI.getSubcategories(),
      productAPI.getAll()
    ])
      .then(([categoryResponse, subcategoryResponse, productResponse]) => {
        if (!isMounted) return;
        setProductCategories(categoryResponse.data || []);
        setProductSubcategories(subcategoryResponse.data || []);
        setDashboardProducts(productResponse.data || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setProductCategories([]);
        setProductSubcategories([]);
        setDashboardProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get('/inspection/admin/rejection-report', { params: { month: reportMonth, year: reportYear } }),
      api.get('/inspection/admin/mis-dashboard', { params: { month: reportMonth, year: reportYear } }),
      api.get('/mis-operations/bop-receipts', { params: { month: reportMonth, year: reportYear } }),
      api.get('/mis-operations/supplier-rejections', { params: { month: reportMonth, year: reportYear } }),
      misOperationsAPI.getEmployeeSheetEntries({ month: reportMonth, year: reportYear })
    ])
      .then(([rejectionResponse, misResponse, bopResponse, supplierResponse, employeeSheetResponse]) => {
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
        setEmployeeSheetAggregates((employeeSheetResponse.data?.aggregate || []).reduce((acc, row) => {
          const sheetId = row._id?.sheetId;
          if (!sheetId) return acc;
          if (!acc[sheetId]) acc[sheetId] = [];
          acc[sheetId].push(row);
          return acc;
        }, {}));
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
          setEmployeeSheetAggregates({});
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

  useEffect(() => {
    if (!quickReportMenu?.anchor) return undefined;
    const updateMenuPosition = () => {
      const rect = quickReportMenu.anchor.getBoundingClientRect();
      setQuickReportMenu((current) => current?.anchor
        ? { ...current, left: rect.left, top: rect.bottom + 8 }
        : current);
    };

    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [quickReportMenu?.anchor]);

  const allowedReportIdSet = useMemo(
    () => (Array.isArray(allowedReportIds) ? new Set(allowedReportIds) : null),
    [allowedReportIds]
  );
  const availableStaticReportTabs = useMemo(
    () => (allowedReportIdSet
      ? visibleStaticReportTabs.filter((report) => allowedReportIdSet.has(report.id))
      : visibleStaticReportTabs),
    [allowedReportIdSet]
  );
  const availableDashboardFamilies = useMemo(
    () => (showInspectionReports ? dashboardReportFamilies : dashboardReportFamilies.filter((family) => family.id !== 'inspection')),
    [showInspectionReports]
  );
  const isInspectionFamily = showInspectionReports && activeDashboardFamilyId === 'inspection';
  const isShellInspectionFamily = isInspectionFamily && activeInspectionFamilyId === 'shell-moulding-inspection';
  const isVisorPdiirFamily = isInspectionFamily && activeInspectionFamilyId === 'visor-pdiir-inspection';
  const isD1VmBaseFamily = isInspectionFamily && activeInspectionFamilyId === 'd1-vm-base-rh-lh-inspection';
  const dynamicProductReportTabs = useMemo(() => {
    const fixedReportNames = new Set(visibleStaticReportTabs.map((report) => normalizeReportKey(report.name)));
    const createDynamicReports = ({ baseId, baseName, sourceFileName }) => ([
      { suffix: '', label: 'DRR', metric: 'rejectionAndRework', summaryRows: drrSummaryRows },
      { suffix: '-rejection', label: 'Rejection', metric: 'rejection', summaryRows: dynamicRejectionSummaryRows },
      { suffix: '-rework', label: 'Rework', metric: 'rework', summaryRows: dynamicReworkSummaryRows }
    ].map((item) => ({
      id: `${baseId}${item.suffix}`,
      type: 'drr',
      metric: item.metric,
      name: `${baseName} ${item.label}`,
      sourceFileName,
      descriptorColumns: [
        { key: 'assemblyProcess', label: 'Assembly Process', width: 160 },
        { key: 'partDetails', label: 'Part details', width: 120 },
        { key: 'defectDetails', label: 'Defect Details', width: 180 },
      ],
      summaryRows: item.summaryRows,
      totalColumns: [
        { id: 'total', label: 'Total' },
        { id: 'totalPercent', label: 'Total %' },
      ],
      rows: []
    })));

    return productCategories
      .filter((category) => !fixedReportNames.has(normalizeReportKey(category.name)))
      .map((category) => {
        const categoryId = String(category._id);
        const subReports = productSubcategories
          .filter((subcategory) => String(subcategory.category?._id || subcategory.category || '') === categoryId)
          .flatMap((subcategory) => {
            const subcategoryId = String(subcategory._id);
            return createDynamicReports({
              baseId: `product-subcategory-${subcategoryId}`,
              baseName: `${category.name} - ${subcategory.name}`,
              sourceFileName: `${category.name} / ${subcategory.name}`
            });
          });

        return {
          id: `product-category-${categoryId}`,
          name: category.name,
          dynamic: true,
          subReports: subReports.length ? subReports : createDynamicReports({
            baseId: `product-category-${categoryId}-all`,
            baseName: category.name,
            sourceFileName: category.name
          })
        };
      });
  }, [productCategories, productSubcategories]);
  const dynamicMisCrsSubReports = useMemo(() => {
    const fixedReportNames = new Set(visibleStaticReportTabs.map((report) => normalizeReportKey(report.name)));
    const reports = [];
    productCategories
      .filter((category) => !fixedReportNames.has(normalizeReportKey(category.name)))
      .forEach((category) => {
        const categoryId = String(category._id);
        const subcategories = productSubcategories.filter((subcategory) =>
          String(subcategory.category?._id || subcategory.category || '') === categoryId
        );
        const targets = subcategories.length
          ? subcategories.map((subcategory) => ({
              baseId: `product-subcategory-${String(subcategory._id)}`,
              name: `${category.name} - ${subcategory.name}`,
              sourceFileName: `${category.name} / ${subcategory.name}`
            }))
          : [{
              baseId: `product-category-${categoryId}-all`,
              name: category.name,
              sourceFileName: category.name
            }];

        targets.forEach((target) => {
          reports.push({
            ...target,
            mis: {
              id: `${target.baseId}-mis`,
              sourceReportId: `${target.baseId}-mis`,
              type: 'mis',
              metric: 'rejectionAndRework',
              name: `${target.name} MIS`,
              sourceFileName: target.sourceFileName,
              descriptorColumns: [],
              summaryRows: [],
              totalColumns: [],
              dayColumns: [],
              rows: []
            },
            crs: {
              id: `${target.baseId}-crs`,
              sourceReportId: target.baseId,
              rejectionReportId: `${target.baseId}-rejection`,
              type: 'crs',
              metric: 'rejectionAndRework',
              name: `${target.name} CRS`,
              sourceFileName: target.sourceFileName,
              descriptorColumns: [],
              summaryRows: [],
              totalColumns: [],
              dayColumns: [],
              rows: []
            }
          });
        });
      });
    return reports;
  }, [productCategories, productSubcategories]);
  const staticReportTabsWithDynamicSheets = useMemo(() => availableStaticReportTabs.map((report) => {
    if (report.id === 'mis-quality-performance') {
      return {
        ...report,
        subReports: [
          ...report.subReports,
          ...dynamicMisCrsSubReports.map((item) => item.mis)
        ]
      };
    }
    if (report.id === 'consolidated-rejection-status') {
      return {
        ...report,
        subReports: [
          ...report.subReports,
          ...dynamicMisCrsSubReports.map((item) => item.crs)
        ]
      };
    }
    return report;
  }), [availableStaticReportTabs, dynamicMisCrsSubReports]);
  const dashboardReportTabs = useMemo(
    () => [...staticReportTabsWithDynamicSheets, ...dynamicProductReportTabs],
    [staticReportTabsWithDynamicSheets, dynamicProductReportTabs]
  );
  const activeShellInspectionReport = shellMouldingInspectionReports.find((report) => report.id === activeShellInspectionId)
    || shellMouldingInspectionReports[0];
  const activeShellInspectionSheets = shellMouldingInspectionReports.filter((report) => report.groupId === activeShellInspectionGroupId);
  const activeVisorPdiirReport = visorPdiirInspectionReports.find((report) => report.id === activeVisorPdiirId)
    || visorPdiirInspectionReports[0];
  const activeVisorPdiirSheets = visorPdiirInspectionReports.filter((report) => report.groupId === activeVisorPdiirGroupId);
  const activeD1VmBaseReport = d1VmBaseInspectionReports.find((report) => report.id === activeD1VmBaseId)
    || d1VmBaseInspectionReports[0];
  const activeD1VmBaseSheets = d1VmBaseInspectionReports.filter((report) => report.groupId === activeD1VmBaseGroupId);

  useEffect(() => {
    if (!availableDashboardFamilies.some((family) => family.id === activeDashboardFamilyId)) {
      setActiveDashboardFamilyId(availableDashboardFamilies[0]?.id || 'dashboard');
    }
  }, [activeDashboardFamilyId, availableDashboardFamilies]);

  useEffect(() => {
    const nextReport = dashboardReportTabs.find((report) => report.id === activeReportId) || dashboardReportTabs[0];
    if (!nextReport) return;
    if (nextReport.id !== activeReportId) {
      setActiveReportId(nextReport.id);
      setActiveSubReportId(nextReport.subReports[0]?.id || '');
      return;
    }
    if (!nextReport.subReports.some((report) => report.id === activeSubReportId)) {
      setActiveSubReportId(nextReport.subReports[0]?.id || '');
    }
  }, [activeReportId, activeSubReportId, dashboardReportTabs]);

  useEffect(() => {
    if (!activeShellInspectionSheets.some((report) => report.id === activeShellInspectionId)) {
      setActiveShellInspectionId(activeShellInspectionSheets[0]?.id || shellMouldingInspectionReports[0].id);
    }
  }, [activeShellInspectionGroupId, activeShellInspectionId, activeShellInspectionSheets]);

  useEffect(() => {
    if (!activeVisorPdiirSheets.some((report) => report.id === activeVisorPdiirId)) {
      setActiveVisorPdiirId(activeVisorPdiirSheets[0]?.id || visorPdiirInspectionReports[0].id);
    }
  }, [activeVisorPdiirGroupId, activeVisorPdiirId, activeVisorPdiirSheets]);

  useEffect(() => {
    if (!activeD1VmBaseSheets.some((report) => report.id === activeD1VmBaseId)) {
      setActiveD1VmBaseId(activeD1VmBaseSheets[0]?.id || d1VmBaseInspectionReports[0].id);
    }
  }, [activeD1VmBaseGroupId, activeD1VmBaseId, activeD1VmBaseSheets]);

  useEffect(() => {
    if (!isShellInspectionFamily) return;
    let isMounted = true;

    misOperationsAPI.getShellMouldingInspections({
      sheetId: activeShellInspectionId,
      inspectedAt: inspectionDateValue
    })
      .then((response) => {
        if (!isMounted) return;
        setShellInspectionEntries((current) => ({
          ...current,
          [`${inspectionDateValue}:${activeShellInspectionId}`]: (response.data || []).reduce((entries, row) => {
            entries[row.rowKey] = {
              samples: Array.from({ length: 5 }, (_, index) => row.samples?.[index] || ''),
              remarks: row.remarks || ''
            };
            return entries;
          }, {})
        }));
      })
      .catch(() => {
        if (!isMounted) return;
        setShellInspectionEntries((current) => ({
          ...current,
          [`${inspectionDateValue}:${activeShellInspectionId}`]: {}
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [activeShellInspectionId, inspectionDateValue, isShellInspectionFamily]);

  useEffect(() => {
    if (!isVisorPdiirFamily) return;
    let isMounted = true;

    misOperationsAPI.getVisorPdiirInspections({
      sheetId: activeVisorPdiirId,
      inspectedAt: inspectionDateValue
    })
      .then((response) => {
        if (!isMounted) return;
        setVisorPdiirEntries((current) => ({
          ...current,
          [`${inspectionDateValue}:${activeVisorPdiirId}`]: (response.data || []).reduce((entries, row) => {
            entries[row.rowKey] = {
              samples: Array.from({ length: 5 }, (_, index) => row.samples?.[index] || ''),
              remarks: row.remarks || ''
            };
            return entries;
          }, {})
        }));
      })
      .catch(() => {
        if (!isMounted) return;
        setVisorPdiirEntries((current) => ({
          ...current,
          [`${inspectionDateValue}:${activeVisorPdiirId}`]: {}
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [activeVisorPdiirId, inspectionDateValue, isVisorPdiirFamily]);

  useEffect(() => {
    if (!isD1VmBaseFamily) return;
    let isMounted = true;

    misOperationsAPI.getVisorPdiirInspections({
      sheetId: activeD1VmBaseId,
      inspectedAt: inspectionDateValue
    })
      .then((response) => {
        if (!isMounted) return;
        setD1VmBaseEntries((current) => ({
          ...current,
          [`${inspectionDateValue}:${activeD1VmBaseId}`]: (response.data || []).reduce((entries, row) => {
            entries[row.rowKey] = {
              samples: Array.from({ length: 5 }, (_, index) => row.samples?.[index] || ''),
              remarks: row.remarks || ''
            };
            return entries;
          }, {})
        }));
      })
      .catch(() => {
        if (!isMounted) return;
        setD1VmBaseEntries((current) => ({
          ...current,
          [`${inspectionDateValue}:${activeD1VmBaseId}`]: {}
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [activeD1VmBaseId, inspectionDateValue, isD1VmBaseFamily]);

  const activeShellInspectionRows = useMemo(() => {
    const savedRows = shellInspectionEntries[`${inspectionDateValue}:${activeShellInspectionId}`] || {};
    return activeShellInspectionReport.rows.map((row, index) => {
      if (row.type === 'section') return row;
      const rowKey = getShellInspectionRowKey(row, index);
      const savedRow = savedRows[rowKey] || {};
      return {
        ...row,
        shellRowKey: rowKey,
        samples: Array.from({ length: 5 }, (_, sampleIndex) => savedRow.samples?.[sampleIndex] ?? row.samples?.[sampleIndex] ?? ''),
        remarks: savedRow.remarks ?? row.remarks ?? ''
      };
    });
  }, [activeShellInspectionId, activeShellInspectionReport.rows, inspectionDateValue, shellInspectionEntries]);
  const activeVisorPdiirRows = useMemo(() => {
    const savedRows = visorPdiirEntries[`${inspectionDateValue}:${activeVisorPdiirId}`] || {};
    return activeVisorPdiirReport.rows.map((row, index) => {
      if (row.type === 'section') return row;
      const rowKey = getShellInspectionRowKey(row, index);
      const savedRow = savedRows[rowKey] || {};
      return {
        ...row,
        shellRowKey: rowKey,
        samples: Array.from({ length: 5 }, (_, sampleIndex) => savedRow.samples?.[sampleIndex] ?? row.samples?.[sampleIndex] ?? ''),
        remarks: savedRow.remarks ?? row.remarks ?? ''
      };
    });
  }, [activeVisorPdiirId, activeVisorPdiirReport.rows, inspectionDateValue, visorPdiirEntries]);
  const activeD1VmBaseRows = useMemo(() => {
    const savedRows = d1VmBaseEntries[`${inspectionDateValue}:${activeD1VmBaseId}`] || {};
    return activeD1VmBaseReport.rows.map((row, index) => {
      if (row.type === 'section') return row;
      const rowKey = getShellInspectionRowKey(row, index);
      const savedRow = savedRows[rowKey] || {};
      return {
        ...row,
        shellRowKey: rowKey,
        samples: Array.from({ length: 5 }, (_, sampleIndex) => savedRow.samples?.[sampleIndex] ?? row.samples?.[sampleIndex] ?? ''),
        remarks: savedRow.remarks ?? row.remarks ?? ''
      };
    });
  }, [activeD1VmBaseId, activeD1VmBaseReport.rows, d1VmBaseEntries, inspectionDateValue]);
  const shellStageCounts = useMemo(
    () => getShellStageCounts(activeShellInspectionRows),
    [activeShellInspectionRows]
  );
  const activeReport = dashboardReportTabs.find((report) => report.id === activeReportId) || dashboardReportTabs[0] || availableStaticReportTabs[0];
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
    return DEFECT_COUNT_REPORT_IDS.reduce((reports, reportId) => {
      const rejectionSubReport = reportTabs
        .flatMap((reportGroup) => reportGroup.subReports)
        .find((report) => report.id === reportId);
      const metricKey = rejectionSubReport?.defectMode === 'rework' ? 'rework' : 'rejection';
      const backendReport = backendMisReports[reportId];
      const fallbackReport = reportId === D1_REJECTION_REPORT_ID ? rejectionReport : null;
      const backendRows = backendReport
        ? backendReport.rows.map((row) => {
            const subQuestion = String(row.subQuestion || '').trim();
            const subOption = String(row.subOption || '').trim();
            return {
              defectGroup: metricKey === 'rework' ? 'Rework' : 'Rejection',
              questionHeader: row.questionHeader || (metricKey === 'rework' ? 'Rework Reason' : 'Rejection Reason'),
              questionAnswer: row.questionAnswer || row.defectName,
              subQuestion,
              subOption,
              ...(subQuestion && subOption ? { [subQuestionColumnKey(subQuestion)]: subOption } : {}),
              hasSubQuestion: hasQuestionnaireSubDetail(row),
              partDetails: row.partName || backendReport.partName || '',
              rejectionDetails: hasQuestionnaireSubDetail(row) && !subOption ? row.defectName : '',
              days: row.days.map((value, index) => ({ day: index + 1, rejection: value })),
              total: row.total
            };
          })
        : fallbackReport?.rows || [];
      const reportWithTemplateRows = {
        ...(fallbackReport || {}),
        ...(backendReport ? {
          days: backendReport.days.map((day) => ({
            day: day.day,
            output: day.output,
            rejection: day[metricKey],
            rejectionPercent: day.output ? Number(((day[metricKey] || 0) / day.output * 100).toFixed(2)) : 0
          })),
          daysById: backendReport.days.reduce((acc, day) => {
            acc[`day-${String(day.day).padStart(2, '0')}`] = {
              output: day.output,
              rejection: day[metricKey],
              rejectionPercent: day.output ? Number(((day[metricKey] || 0) / day.output * 100).toFixed(2)) : 0
            };
            return acc;
          }, {}),
          totals: {
            output: backendReport.totals.output,
            rejection: backendReport.totals[metricKey],
            rejectionPercent: backendReport.totals.output ? Number(((backendReport.totals[metricKey] || 0) / backendReport.totals.output * 100).toFixed(2)) : 0
          }
        } : {}),
        rows: backendRows
      };
      reports[reportId] = applyEmployeeSheetAggregateToRejectionReport(buildEditableRejectionReport(
        reportWithTemplateRows,
        rejectionOverrides[`${periodKey}:${reportId}`] || emptyRejectionOverrides(),
        rejectionDayColumns
      ), employeeSheetAggregates[reportId] || [], rejectionDayColumns);
      return reports;
    }, {});
  }, [backendMisReports, employeeSheetAggregates, periodKey, rejectionReport, rejectionOverrides, rejectionDayColumns]);
  const activeEditableRejectionReport = isRejectionReport
    ? editableRejectionReports[activeSubReportBase.id]
    : editableRejectionReports[D1_REJECTION_REPORT_ID];
  const editableDrrReports = useMemo(() => {
    const reports = {};
    for (const reportGroup of dashboardReportTabs) {
      for (const subReport of reportGroup.subReports) {
        const reportId = subReport.sourceReportId || subReport.id;
        if (!['drr', 'visor-drr'].includes(subReport.type) && !subReport.sourceReportId) continue;
        reports[reportId] = applyEmployeeSheetAggregateToDrrReport(buildEditableDrrReport(
          subReport.rows,
          drrOverrides[`${periodKey}:${reportId}`] || emptyRejectionOverrides(),
          currentDayColumns,
          backendMisReports[reportId],
          subReport.metric || 'rejection'
        ), employeeSheetAggregates[reportId] || [], subReport.metric || 'rejection');
      }
    }
    return reports;
  }, [backendMisReports, currentDayColumns, dashboardReportTabs, drrOverrides, employeeSheetAggregates, periodKey]);
  const activeEditableDrrReport = editableDrrReports[activeSubReportBase.id] || null;
  const activeSubReport = useMemo(() => {
    if (isDrrReport || activeSubReportBase.type === 'visor-drr') {
      const firstQuestionHeader = (activeEditableDrrReport?.rows || [])
        .map((row) => String(row.questionHeader || '').trim())
        .find(Boolean);
      const hasSubQuestionRows = (activeEditableDrrReport?.rows || []).some((row) => row.hasSubQuestion && !row.subOption);
      const subQuestionColumns = Array.from(new Set((activeEditableDrrReport?.rows || [])
        .filter((row) => String(row.subOption || '').trim())
        .map((row) => String(row.subQuestion || '').trim())
        .filter(Boolean)))
        .map((header) => ({ key: subQuestionColumnKey(header), label: header, width: 180 }));
      const dynamicDescriptorColumns = firstQuestionHeader
        ? [
            activeSubReportBase.descriptorColumns[1],
            { ...activeSubReportBase.descriptorColumns[0], label: firstQuestionHeader },
            ...(hasSubQuestionRows || subQuestionColumns.length ? [activeSubReportBase.descriptorColumns[2]] : []),
            ...subQuestionColumns
          ].filter(Boolean)
        : activeSubReportBase.descriptorColumns;
      return {
        ...activeSubReportBase,
        descriptorColumns: dynamicDescriptorColumns,
        rows: activeEditableDrrReport?.rows || []
      };
    }
    if (activeSubReportBase.id === 'supplier-rejection-inward-inspection') {
      return { ...activeSubReportBase, rows: supplierRows };
    }
    if (!isRejectionReport) return activeSubReportBase;
    const firstQuestionHeader = (activeEditableRejectionReport?.rows || [])
      .map((row) => String(row.questionHeader || '').trim())
      .find(Boolean);
    const hasSubQuestionRows = (activeEditableRejectionReport?.rows || []).some((row) => row.hasSubQuestion && !row.subOption);
    const subQuestionColumns = Array.from(new Set((activeEditableRejectionReport?.rows || [])
      .filter((row) => String(row.subOption || '').trim())
      .map((row) => String(row.subQuestion || '').trim())
      .filter(Boolean)))
      .map((header) => ({ key: subQuestionColumnKey(header), label: header, width: 180 }));
    const dynamicDescriptorColumns = firstQuestionHeader
      ? [
          { key: 'partDetails', label: 'Part details', width: 180 },
          { key: 'questionAnswer', label: firstQuestionHeader, width: 220 },
          ...(hasSubQuestionRows || subQuestionColumns.length ? [{ key: 'rejectionDetails', label: 'Defect Details', width: 260 }] : []),
          ...subQuestionColumns
        ]
      : activeSubReportBase.descriptorColumns;
    return {
      ...activeSubReportBase,
      descriptorColumns: dynamicDescriptorColumns,
      rows: activeEditableRejectionReport?.rows || [],
      dayColumns: rejectionDayColumns
    };
  }, [activeEditableDrrReport?.rows, activeEditableRejectionReport?.rows, activeSubReportBase, isDrrReport, isRejectionReport, rejectionDayColumns, supplierRows]);

  const filteredRows = useMemo(() => {
    if (isShellInspectionFamily || isVisorPdiirFamily || isD1VmBaseFamily) {
      const inspectionRows = isD1VmBaseFamily ? activeD1VmBaseRows : isVisorPdiirFamily ? activeVisorPdiirRows : activeShellInspectionRows;
      const query = searchTerm.trim().toLowerCase();
      if (!query) return inspectionRows;

      return inspectionRows.filter((row) =>
        [row.title, row.characteristic, row.specification, row.inspectionMethod, row.remarks]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      );
    }

    const query = searchTerm.trim().toLowerCase();
    if (!query) return activeSubReport.rows;

    return activeSubReport.rows.filter((row) =>
      activeSubReport.descriptorColumns.map((column) => row[column.key])
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [activeD1VmBaseRows, activeShellInspectionRows, activeSubReport.descriptorColumns, activeSubReport.rows, activeVisorPdiirRows, isD1VmBaseFamily, isShellInspectionFamily, isVisorPdiirFamily, searchTerm]);

  const activeInspectionRowsForCounts = isD1VmBaseFamily ? activeD1VmBaseRows : isVisorPdiirFamily ? activeVisorPdiirRows : activeShellInspectionRows;
  const primaryDescriptorKey = isInspectionFamily ? 'inspectionMethod' : activeSubReport.descriptorColumns[0]?.key;
  const detailDescriptorKey = isInspectionFamily ? 'characteristic' : activeSubReport.descriptorColumns[activeSubReport.descriptorColumns.length - 1]?.key;
  const primaryGroups = isInspectionFamily
    ? new Set(activeInspectionRowsForCounts.filter((row) => row.type !== 'section').map((row) => row.inspectionMethod).filter(Boolean)).size
    : primaryDescriptorKey
    ? new Set(activeSubReport.rows.map((row) => row[primaryDescriptorKey]).filter(Boolean)).size
    : 0;
  const reportRows = isInspectionFamily ? activeInspectionRowsForCounts.filter((row) => row.type !== 'section').length : activeSubReport.rows.length;
  const detailCount = isInspectionFamily ? new Set(
    activeInspectionRowsForCounts
      .filter((row) => row.type !== 'section')
      .map((row) => row.characteristic)
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
  ).size : detailDescriptorKey ? new Set(
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
    if (isDrrReport && activeSubReportBase.line && ['Day Wise Rejection Qty', 'Day Wise Rejection %'].includes(row.label)) {
      return linkedHelmetRejectionReport;
    }
    if (
      isDrrReport &&
      activeSubReportBase.metric === 'rejectionAndRework' &&
      ['Day Wise Rejection Qty', 'Day Wise Rejection %'].includes(row.label)
    ) {
      return editableDrrReports[`${activeSubReportBase.id}-rejection`] || calculatedRejectionSummary;
    }
    return calculatedRejectionSummary;
  };
  const isCrsReport = activeSubReportBase.type === 'crs';
  const isMisReport = activeSubReportBase.type === 'mis';
  const isProductCategoryReport = activeSubReportBase.type === 'product-category';
  const crsReports = useMemo(
    () => ({ ...editableDrrReports, ...editableRejectionReports }),
    [editableDrrReports, editableRejectionReports]
  );
  const activeDynamicSummaryReport = activeSubReportBase.sourceReportId
    ? editableDrrReports[activeSubReportBase.sourceReportId]
    : null;
  const activeDynamicRejectionReport = activeSubReportBase.rejectionReportId
    ? editableDrrReports[activeSubReportBase.rejectionReportId]
    : null;
  const activeDynamicSummaryRows = activeDynamicSummaryReport?.rows || [];
  const activeDynamicSummaryTotals = activeDynamicSummaryReport?.totals || { output: 0, rejection: 0, rejectionPercent: 0 };
  const activeDynamicRejectionTotals = activeDynamicRejectionReport?.totals || { rejection: 0, rejectionPercent: 0 };
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' })
    .format(new Date(reportYear, reportMonth - 1, 1));
  const selectedDayIndex = Math.max(0, Math.min(currentDayColumns.length - 1, reportDay - 1));
  const selectedDayId = currentDayColumns[selectedDayIndex]?.id || `day-${String(reportDay).padStart(2, '0')}`;
  const selectedDayLabel = currentDayColumns[selectedDayIndex]?.label || '';

  const appendAoASheet = (workbook, usedSheetNames, sheetName, rows, columnWidths = [], styleOptions = {}) => {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = columnWidths.map((width) => ({ wch: width }));
    styleWorksheet(worksheet, rows, styleOptions);
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(sheetName, usedSheetNames));
  };

  const addSheet = (workbook, usedSheetNames, sheetName, worksheet) => {
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(sheetName, usedSheetNames));
  };

  const buildExportReport = (subReport) => {
    if (['drr', 'visor-drr'].includes(subReport.type)) {
      return {
        ...subReport,
        rows: editableDrrReports[subReport.id]?.rows || [],
        dayColumns: currentDayColumns
      };
    }
    if (subReport.type === 'rejection') {
      return {
        ...subReport,
        rows: editableRejectionReports[subReport.id]?.rows || [],
        dayColumns: rejectionDayColumns
      };
    }
    if (subReport.id === 'supplier-rejection-inward-inspection') {
      return { ...subReport, rows: supplierRows };
    }
    return subReport;
  };

  const appendMisSheet = (workbook, usedSheetNames, subReport) => {
    if (subReport.sourceReportId) {
      const report = editableDrrReports[subReport.sourceReportId];
      const reportRows = report?.rows || [];
      const reportTotals = report?.totals || {};
      const rows = [
        [`${subReport.name} - PARTWISE QUALITY PERFORMANCE REPORT`],
        [`Date: ${selectedDayLabel}`],
        [`Month: ${monthLabel}`],
        [],
        [subReport.sourceFileName, `For the day - ${selectedDayLabel}`, '', '', '', '', '', subReport.sourceFileName, `For the month - ${monthLabel}`, '', '', '', '', ''],
        [
          'Part', 'Process', 'Prodn.Qty', 'Rej.Qty', 'Rej%', 'Part Value (Rs)', 'Rej. Value / Helmet (Rs)',
          'Part', 'Process', 'Prodn.Qty', 'Rej.Qty', 'Rej%', 'Part Value (Rs)', 'Rej. Value / Helmet (Rs)'
        ]
      ];
      const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
        { s: { r: 4, c: 1 }, e: { r: 4, c: 6 } },
        { s: { r: 4, c: 8 }, e: { r: 4, c: 13 } }
      ];
      reportRows.forEach((row) => {
        const dayOutput = toNumber(report?.days?.[selectedDayIndex]?.output);
        const dayRejection = toNumber(row.days?.[selectedDayIndex]);
        const monthOutput = toNumber(reportTotals.output);
        const monthRejection = toNumber(row.total);
        const processName = [row.questionAnswer, row.hasSubQuestion ? row.defectDetails : ''].filter(Boolean).join(' - ');
        rows.push([
          row.partDetails || '',
          processName || row.defectDetails || '',
          dayOutput,
          dayRejection,
          { t: 'n', f: `IFERROR(D${rows.length + 1}/C${rows.length + 1},0)`, z: '0.00%' },
          0,
          0,
          row.partDetails || '',
          processName || row.defectDetails || '',
          monthOutput,
          monthRejection,
          { t: 'n', f: `IFERROR(K${rows.length + 1}/J${rows.length + 1},0)`, z: '0.00%' },
          0,
          0
        ]);
      });
      rows.push(['', '', '', '', '', 'Total rejection Cost', 0, '', '', '', '', '', 'Total rejection Cost', 0]);
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      worksheet['!cols'] = Array.from({ length: 14 }, (_, index) => ({ wch: index % 7 < 2 ? 18 : 13 }));
      worksheet['!merges'] = merges;
      styleWorksheet(worksheet, rows, {
        metaRows: [1, 2],
        subHeaderRows: [4],
        headerRows: [5],
        totalRows: [rows.length - 1],
        numericColumns: [2, 3, 5, 6, 9, 10, 12, 13],
        percentColumns: [4, 11]
      });
      addSheet(workbook, usedSheetNames, subReport.name, worksheet);
      return;
    }

    const rows = [
      ['HELMET - PARTWISE QUALITY PERFORMANCE REPORT'],
      [`Date: ${selectedDayLabel}`],
      [`Month: ${monthLabel}`],
      []
    ];
    const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }];
    const widths = Array.from({ length: 14 }, (_, index) => ({ wch: index % 7 < 2 ? 18 : 13 }));
    const subHeaderRows = [];
    const headerRows = [];
    const totalRows = [];

    [1, 2, 3, 4].forEach((line) => {
      const lineStart = rows.length;
      subHeaderRows.push(lineStart);
      rows.push([
        `D${line} - ${['ACE', 'FIT', 'NEO', 'ARC'][line - 1]}`,
        `For the day - ${selectedDayLabel}`,
        '', '', '', '', '',
        `D${line} - ${['ACE', 'FIT', 'NEO', 'ARC'][line - 1]}`,
        `For the month - ${monthLabel}`,
        '', '', '', '', ''
      ]);
      headerRows.push(rows.length);
      rows.push([
        'Part', 'Process', 'Prodn.Qty', 'Rej.Qty', 'Rej%', 'Part Value (Rs)', 'Rej. Value / Helmet (Rs)',
        'Part', 'Process', 'Prodn.Qty', 'Rej.Qty', 'Rej%', 'Part Value (Rs)', 'Rej. Value / Helmet (Rs)'
      ]);
      merges.push(
        { s: { r: lineStart, c: 1 }, e: { r: lineStart, c: 6 } },
        { s: { r: lineStart, c: 8 }, e: { r: lineStart, c: 13 } }
      );

      misLineRows[line].forEach((rowConfig) => {
        const [part, process] = rowConfig;
        const metric = getMisMetric(crsReports, rowConfig, selectedDayIndex, selectedDayId);
        rows.push([
          part,
          process,
          metric.dayOutput,
          metric.dayRejection,
          { t: 'n', f: `IFERROR(D${rows.length + 1}/C${rows.length + 1},0)`, z: '0.00%' },
          0,
          0,
          part,
          process,
          metric.monthOutput,
          metric.monthRejection,
          { t: 'n', f: `IFERROR(K${rows.length + 1}/J${rows.length + 1},0)`, z: '0.00%' },
          0,
          0
        ]);
      });
      totalRows.push(rows.length);
      rows.push(['', '', '', '', '', 'Total rejection Cost', 0, '', '', '', '', '', 'Total rejection Cost', 0]);
      rows.push([]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = widths;
    worksheet['!merges'] = merges;
    styleWorksheet(worksheet, rows, {
      metaRows: [1, 2],
      subHeaderRows,
      headerRows,
      totalRows,
      numericColumns: [2, 3, 5, 6, 9, 10, 12, 13],
      percentColumns: [4, 11]
    });
    addSheet(workbook, usedSheetNames, subReport.name, worksheet);
  };

  const appendCrsSheet = (workbook, usedSheetNames, subReport) => {
    if (subReport.sourceReportId) {
      const report = editableDrrReports[subReport.sourceReportId];
      const rejectionReport = subReport.rejectionReportId ? editableDrrReports[subReport.rejectionReportId] : null;
      const totals = report?.totals || {};
      const rejectionTotals = rejectionReport?.totals || {};
      const rows = [
        [`${subReport.name} - ${monthLabel}`],
        [],
        [subReport.sourceFileName, ''],
        ['Month Cumulative', monthLabel],
        ['TOTAL PRODUCTION QTY', totals.output || 0],
        ['TOTAL REJECTION & REWORK QTY', totals.rejection || 0],
        ['TOTAL REJECTION & REWORK QTY %', { t: 'n', f: 'IFERROR(B6/B5,0)', z: '0.00%' }],
        ['TOTAL REJECTION QTY', rejectionTotals.rejection || 0],
        ['TOTAL REJECTION %', { t: 'n', f: 'IFERROR(B8/B5,0)', z: '0.00%' }]
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      worksheet['!cols'] = [{ wch: 34 }, { wch: 16 }];
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }
      ];
      styleWorksheet(worksheet, rows, {
        subHeaderRows: [0, 2],
        totalRows: [4, 5, 7],
        numericColumns: [1],
        percentCells: ['B7', 'B9']
      });
      addSheet(workbook, usedSheetNames, subReport.name, worksheet);
      return;
    }

    const rows = [
      [`Helmet - Consolidated Rejection Status - ${monthLabel}`],
      []
    ];
    const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
    const widths = Array.from({ length: 8 }, (_, index) => ({ wch: index % 2 === 0 ? 28 : 14 }));
    const subHeaderRows = [];
    const totalRows = [];
    const percentCells = [];

    crsLayout.forEach((layoutRow) => {
      const rowStart = rows.length;
      subHeaderRows.push(rowStart);
      const titleRow = Array(8).fill('');
      const metricRows = Array.from({ length: 6 }, () => Array(8).fill(''));

      layoutRow.forEach((item, blockIndex) => {
        const col = blockIndex * 2;
        const report = crsReports[item.reportId];
        const rejectionReportForLine = crsReports[item.rejectionId];
        const totals = report?.totals || { output: 0, rejection: 0, rejectionPercent: 0 };
        titleRow[col] = item.title;
        merges.push({ s: { r: rowStart, c: col }, e: { r: rowStart, c: col + 1 } });

        if (item.bop) {
          (report?.rows || []).slice(0, 6).forEach((row, rowIndex) => {
            metricRows[rowIndex][col] = row.defectDetails;
            metricRows[rowIndex][col + 1] = row.total || 0;
          });
          return;
        }

        const metrics = [
          ['Month Cumulative', monthLabel],
          ['TOTAL PRODUCTION QTY', totals.output || 0],
          [item.helmet ? 'TOTAL REJECTION & REWORK QTY' : 'TOTAL REJECTION QTY', totals.rejection || 0],
          [item.helmet ? 'TOTAL REJECTION & REWORK QTY %' : 'TOTAL REJECTION %', { t: 'n', f: `IFERROR(${excelColumn(col + 1)}${rowStart + 4}/${excelColumn(col + 1)}${rowStart + 3},0)`, z: '0.00%' }]
        ];
        percentCells.push(XLSX.utils.encode_cell({ r: rowStart + 4, c: col + 1 }));
        if (item.helmet) {
          metrics.push(
            ['TOTAL REJECTION QTY', rejectionReportForLine?.totals?.rejection || 0],
            ['TOTAL REJECTION %', { t: 'n', f: `IFERROR(${excelColumn(col + 1)}${rowStart + 6}/${excelColumn(col + 1)}${rowStart + 3},0)`, z: '0.00%' }]
          );
          percentCells.push(XLSX.utils.encode_cell({ r: rowStart + 6, c: col + 1 }));
        }
        metrics.forEach(([label, value], metricIndex) => {
          metricRows[metricIndex][col] = label;
          metricRows[metricIndex][col + 1] = value;
        });
      });

      rows.push(titleRow, ...metricRows, []);
      totalRows.push(rowStart + 2, rowStart + 3, rowStart + 5);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = widths;
    worksheet['!merges'] = merges;
    styleWorksheet(worksheet, rows, {
      subHeaderRows,
      totalRows,
      numericColumns: [1, 3, 5, 7],
      percentCells
    });
    addSheet(workbook, usedSheetNames, subReport.name, worksheet);
  };

  const appendReportSheet = (workbook, usedSheetNames, tab, subReport) => {
    if (subReport.type === 'mis') {
      appendMisSheet(workbook, usedSheetNames, subReport);
      return;
    }
    if (subReport.type === 'crs') {
      appendCrsSheet(workbook, usedSheetNames, subReport);
      return;
    }

    const report = buildExportReport(subReport);
    const reportDays = report.dayColumns || currentDayColumns;
    const headers = [
      ...report.descriptorColumns.map((column) => column.label),
      ...reportDays.map((column) => column.label),
      ...report.totalColumns.map((column) => column.label)
    ];
    const rows = [
      [report.name],
      [`Source: ${report.sourceFileName || tab.name}`],
      []
    ];
    const dayStartCol = report.descriptorColumns.length;
    const dayEndCol = dayStartCol + reportDays.length - 1;
    const totalCol = dayStartCol + reportDays.length;
    const totalPercentCol = totalCol + 1;
    const headerRows = [];
    const summaryRowsForStyle = [];
    const totalRows = [];
    const numericColumns = [...reportDays.map((_, index) => dayStartCol + index), totalCol];
    const percentColumns = report.totalColumns.some((column) => column.id === 'totalPercent') ? [totalPercentCol] : [];

    if (report.summaryRows.length > 0) {
      headerRows.push(rows.length);
      rows.push([
        'Description',
        ...reportDays.map((column) => column.label),
        ...report.totalColumns.map((column) => column.label)
      ]);
      report.summaryRows.forEach((summaryRow) => {
        summaryRowsForStyle.push(rows.length);
        const summaryReport = report.type === 'drr' && ['Day Wise Rejection Qty', 'Day Wise Rejection %'].includes(summaryRow.label)
          ? editableRejectionReports[`d${report.line}-helmet-assembly-rejection`]
          : ['drr', 'visor-drr'].includes(report.type)
            ? editableDrrReports[report.id]
            : report.type === 'rejection'
              ? editableRejectionReports[report.id]
              : null;
        rows.push([
          summaryRow.label,
          ...reportDays.map((column) => summaryRow.getValue(column, summaryReport)),
          getCellValue(summaryRow.total, summaryReport),
          getCellValue(summaryRow.totalPercent, summaryReport)
        ]);
      });
      rows.push([]);
    }

    headerRows.push(rows.length);
    rows.push(headers);
    const headerRowNumber = rows.length;
    const firstDataRowNumber = headerRowNumber + 1;

    report.rows.forEach((row, rowIndex) => {
      const rowNumber = firstDataRowNumber + rowIndex;
      const dataRow = report.descriptorColumns.map((column) => row[column.key] ?? '');
      reportDays.forEach((_, dayIndex) => {
        if (report.type === 'rejection') {
          dataRow.push(numericCell(row.days?.[dayIndex]?.rejection));
        } else if (['drr', 'visor-drr'].includes(report.type)) {
          dataRow.push(numericCell(row.days?.[dayIndex]));
        } else {
          dataRow.push(row[reportDays[dayIndex]?.id] ?? '');
        }
      });
      if (report.totalColumns.some((column) => column.id === 'total')) {
        const startRef = `${excelColumn(dayStartCol)}${rowNumber}`;
        const endRef = `${excelColumn(dayEndCol)}${rowNumber}`;
        dataRow.push({ t: 'n', f: `SUM(${startRef}:${endRef})` });
      }
      if (report.totalColumns.some((column) => column.id === 'totalPercent')) {
        const dataTotalRef = `${excelColumn(totalCol)}${rowNumber}`;
        const allTotalRef = `${excelColumn(totalCol)}${firstDataRowNumber + report.rows.length}`;
        dataRow.push({ t: 'n', f: `IFERROR(${dataTotalRef}/${allTotalRef},0)`, z: '0.00%' });
      }
      rows.push(dataRow);
    });

    if (['drr', 'visor-drr', 'rejection'].includes(report.type)) {
      const totalRowNumber = firstDataRowNumber + report.rows.length;
      const totalRow = Array.from({ length: report.descriptorColumns.length }, (_, index) => index === 0 ? 'Total' : '');
      reportDays.forEach((_, dayIndex) => {
        const col = excelColumn(dayStartCol + dayIndex);
        totalRow.push({ t: 'n', f: `SUM(${col}${firstDataRowNumber}:${col}${totalRowNumber - 1})` });
      });
      totalRow.push({ t: 'n', f: `SUM(${excelColumn(totalCol)}${firstDataRowNumber}:${excelColumn(totalCol)}${totalRowNumber - 1})` });
      if (report.totalColumns.some((column) => column.id === 'totalPercent')) totalRow.push('');
      totalRows.push(rows.length);
      rows.push(totalRow);
    }

    appendAoASheet(
      workbook,
      usedSheetNames,
      report.name,
      rows,
      [...report.descriptorColumns.map((column) => Math.max(12, Math.round((column.width || 120) / 8))), ...reportDays.map(() => 10), ...report.totalColumns.map(() => 12)],
      {
        metaRows: [1],
        headerRows,
        summaryRows: summaryRowsForStyle,
        totalRows,
        numericColumns,
        percentColumns
      }
    );
  };

  const appendInspectionSheet = (workbook, usedSheetNames, familyName, report, entryMap) => {
    const savedRows = entryMap[`${inspectionDateValue}:${report.id}`] || {};
    const sectionRows = [];
    const rows = [
      [report.name],
      [`Source: ${report.sourceFileName || familyName}`],
      [`Date: ${inspectionDateValue}`],
      [],
      ['SI. No', 'Characteristics Description', 'Specification', 'Inspection Method', '1', '2', '3', '4', '5', 'Remarks']
    ];
    report.rows.forEach((row, index) => {
      if (row.type === 'section') {
        sectionRows.push(rows.length);
        rows.push([row.title]);
        return;
      }
      const rowKey = getShellInspectionRowKey(row, index);
      const savedRow = savedRows[rowKey] || {};
      const samples = Array.from({ length: 5 }, (_, sampleIndex) => savedRow.samples?.[sampleIndex] ?? row.samples?.[sampleIndex] ?? '');
      const rowNumber = rows.length + 1;
      rows.push([
        row.sno,
        row.characteristic,
        row.specification,
        row.inspectionMethod,
        ...samples,
        savedRow.remarks ?? row.remarks ?? ''
      ]);
    });
    appendAoASheet(workbook, usedSheetNames, report.name, rows, [8, 32, 28, 24, 10, 10, 10, 10, 10, 24], {
      metaRows: [1, 2],
      headerRows: [4],
      sectionRows,
      numericColumns: [0]
    });
  };

  const appendProductCategorySheet = (workbook, usedSheetNames, tab, subReport) => {
    appendAoASheet(workbook, usedSheetNames, `${tab.name} - ${subReport.name}`, [
      [subReport.name],
      [`Source: ${subReport.sourceFileName || tab.name}`],
      [],
      subReport.descriptorColumns.map((column) => column.label),
      ...subReport.rows.map((row) => subReport.descriptorColumns.map((column) => row[column.key] ?? ''))
    ], subReport.descriptorColumns.map((column) => Math.max(12, Math.round((column.width || 120) / 8))), {
      metaRows: [1],
      headerRows: [3],
      numericColumns: [4, 5]
    });
  };

  const handleExportDashboardWorkbook = () => {
    const workbook = XLSX.utils.book_new();
    const usedSheetNames = new Set();

    appendAoASheet(workbook, usedSheetNames, 'Dashboard Index', [
      ['Overall Dashboard Report'],
      [`Period: ${monthLabel}`],
      [`Selected Date: ${selectedDayLabel || inspectionDateValue}`],
      [],
      ['Tab', 'Nested sheets'],
      ...dashboardReportTabs.map((tab) => [tab.name, tab.subReports.map((report) => report.name).join(', ')])
    ], [34, 90], { metaRows: [1, 2], headerRows: [4] });

    dashboardReportTabs.forEach((tab) => {
      tab.subReports.forEach((subReport) => {
        if (subReport.type === 'product-category') {
          appendProductCategorySheet(workbook, usedSheetNames, tab, subReport);
          return;
        }
        appendReportSheet(workbook, usedSheetNames, tab, subReport);
      });
    });

    XLSX.writeFile(workbook, `overall-dashboard-report-${reportYear}-${String(reportMonth).padStart(2, '0')}.xlsx`);
  };

  const getColumnClass = (column) => {
    if (column.id === 'totalPercent') return totalPercentCellClass;
    if (column.id === 'total') return totalCellClass;
    return dayCellClass;
  };
  const getDescriptorLeft = (columnIndex) => activeSubReport.descriptorColumns
    .slice(0, columnIndex)
    .reduce((sum, column) => sum + column.width, 0);
  const descriptorWidth = activeSubReport.descriptorColumns.reduce((sum, column) => sum + column.width, 0);
  const updateRowOverride = (row, dayId, value) => {
    if (!isRejectionReport) return;
    const rowKey = getRejectionRowKey(row);
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
  const updateRejectionOutputOverride = (reportId, dayId, value) => {
    const overrideKey = `${periodKey}:${reportId}`;
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
  const updateDrrOutputOverrideById = (reportId, dayId, value) => {
    const overrideKey = `${periodKey}:${reportId}`;
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
  const updateSharedHelmetOutputOverride = (dayId, value) => {
    const line = activeSubReportBase.line;
    if (!line) return false;

    updateDrrOutputOverrideById(`d${line}-helmet-assembly-drr`, dayId, value);
    updateRejectionOutputOverride(`d${line}-helmet-assembly-rejection`, dayId, value);
    updateRejectionOutputOverride(`d${line}-helmet-assembly-rework`, dayId, value);
    return true;
  };
  const updateOutputOverride = (dayId, value) => {
    if (!isRejectionReport) return;
    updateSharedHelmetOutputOverride(dayId, value);
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
    if (activeSubReportBase.id === `d${activeSubReportBase.line}-helmet-assembly-drr`) {
      updateSharedHelmetOutputOverride(dayId, value);
      return;
    }
    updateDrrOutputOverrideById(activeSubReportBase.id, dayId, value);
  };
  const updateShellInspectionRow = (row, updater) => {
    const entryKey = `${inspectionDateValue}:${activeShellInspectionId}`;
    setShellInspectionEntries((current) => {
      const currentRows = current[entryKey] || {};
      const currentRow = currentRows[row.shellRowKey] || {
        samples: Array.from({ length: 5 }, (_, index) => row.samples?.[index] || ''),
        remarks: row.remarks || ''
      };
      return {
        ...current,
        [entryKey]: {
          ...currentRows,
          [row.shellRowKey]: updater(currentRow)
        }
      };
    });
  };
  const updateShellInspectionSample = (row, sampleIndex, value) => {
    updateShellInspectionRow(row, (currentRow) => {
      const samples = Array.from({ length: 5 }, (_, index) => currentRow.samples?.[index] || '');
      samples[sampleIndex] = value;
      return { ...currentRow, samples };
    });
  };
  const updateShellInspectionRemarks = (row, value) => {
    updateShellInspectionRow(row, (currentRow) => ({ ...currentRow, remarks: value }));
  };
  const saveShellInspectionRow = async (row) => {
    const entryKey = `${inspectionDateValue}:${activeShellInspectionId}`;
    const currentRow = shellInspectionEntries[entryKey]?.[row.shellRowKey] || row;
    await misOperationsAPI.saveShellMouldingInspection({
      sheetId: activeShellInspectionReport.id,
      productionLine: activeShellInspectionReport.productionLine,
      inspectionStage: activeShellInspectionReport.inspectionStage,
      inspectedAt: inspectionDateValue,
      rowKey: row.shellRowKey,
      samples: Array.from({ length: 5 }, (_, index) => currentRow.samples?.[index] || ''),
      remarks: currentRow.remarks || ''
    });
  };
  const updateVisorPdiirRow = (row, updater) => {
    const entryKey = `${inspectionDateValue}:${activeVisorPdiirId}`;
    setVisorPdiirEntries((current) => {
      const currentRows = current[entryKey] || {};
      const currentRow = currentRows[row.shellRowKey] || {
        samples: Array.from({ length: 5 }, (_, index) => row.samples?.[index] || ''),
        remarks: row.remarks || ''
      };
      return {
        ...current,
        [entryKey]: {
          ...currentRows,
          [row.shellRowKey]: updater(currentRow)
        }
      };
    });
  };
  const updateVisorPdiirSample = (row, sampleIndex, value) => {
    updateVisorPdiirRow(row, (currentRow) => {
      const samples = Array.from({ length: 5 }, (_, index) => currentRow.samples?.[index] || '');
      samples[sampleIndex] = value;
      return { ...currentRow, samples };
    });
  };
  const updateVisorPdiirRemarks = (row, value) => {
    updateVisorPdiirRow(row, (currentRow) => ({ ...currentRow, remarks: value }));
  };
  const saveVisorPdiirRow = async (row) => {
    const entryKey = `${inspectionDateValue}:${activeVisorPdiirId}`;
    const currentRow = visorPdiirEntries[entryKey]?.[row.shellRowKey] || row;
    await misOperationsAPI.saveVisorPdiirInspection({
      sheetId: activeVisorPdiirReport.id,
      productionLine: activeVisorPdiirReport.productionLine,
      inspectionStage: activeVisorPdiirReport.inspectionStage,
      side: activeVisorPdiirReport.side,
      inspectedAt: inspectionDateValue,
      rowKey: row.shellRowKey,
      samples: Array.from({ length: 5 }, (_, index) => currentRow.samples?.[index] || ''),
      remarks: currentRow.remarks || ''
    });
  };
  const updateD1VmBaseRow = (row, updater) => {
    const entryKey = `${inspectionDateValue}:${activeD1VmBaseId}`;
    setD1VmBaseEntries((current) => {
      const currentRows = current[entryKey] || {};
      const currentRow = currentRows[row.shellRowKey] || {
        samples: Array.from({ length: 5 }, (_, index) => row.samples?.[index] || ''),
        remarks: row.remarks || ''
      };
      return {
        ...current,
        [entryKey]: {
          ...currentRows,
          [row.shellRowKey]: updater(currentRow)
        }
      };
    });
  };
  const updateD1VmBaseSample = (row, sampleIndex, value) => {
    updateD1VmBaseRow(row, (currentRow) => {
      const samples = Array.from({ length: 5 }, (_, index) => currentRow.samples?.[index] || '');
      samples[sampleIndex] = value;
      return { ...currentRow, samples };
    });
  };
  const updateD1VmBaseRemarks = (row, value) => {
    updateD1VmBaseRow(row, (currentRow) => ({ ...currentRow, remarks: value }));
  };
  const saveD1VmBaseRow = async (row) => {
    const entryKey = `${inspectionDateValue}:${activeD1VmBaseId}`;
    const currentRow = d1VmBaseEntries[entryKey]?.[row.shellRowKey] || row;
    await misOperationsAPI.saveVisorPdiirInspection({
      sheetId: activeD1VmBaseReport.id,
      productionLine: activeD1VmBaseReport.productionLine,
      inspectionStage: activeD1VmBaseReport.inspectionStage,
      side: activeD1VmBaseReport.side,
      inspectedAt: inspectionDateValue,
      rowKey: row.shellRowKey,
      samples: Array.from({ length: 5 }, (_, index) => currentRow.samples?.[index] || ''),
      remarks: currentRow.remarks || ''
    });
  };
  const editableCellClass = 'h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-1 text-center text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white';
  const isFullTableScroll = reportScrollMode === 'full';
  const scheduleQuickReportMenuClose = () => {
    if (quickReportMenuCloseTimer.current) clearTimeout(quickReportMenuCloseTimer.current);
    quickReportMenuCloseTimer.current = setTimeout(() => setQuickReportMenu(null), 150);
  };
  const keepQuickReportMenuOpen = () => {
    if (quickReportMenuCloseTimer.current) clearTimeout(quickReportMenuCloseTimer.current);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <button
            type="button"
            onClick={handleExportDashboardWorkbook}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
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
      </div>

      {isInspectionFamily && (
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 overflow-x-auto">
          {inspectionReportFamilies.map((family) => (
            <button
              key={family.id}
              type="button"
              onClick={() => {
                setActiveInspectionFamilyId(family.id);
                setSearchTerm('');
              }}
              className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeInspectionFamilyId === family.id
                  ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              {family.name}
            </button>
          ))}
        </div>
      </div>
      )}

      {!isInspectionFamily ? (
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="space-y-3 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {dashboardReportTabs.map((report) => {
              const quickReportItems = report.dynamic
                ? report.subReports
                    .filter((subReport) => subReport.type === 'drr' && !subReport.id.endsWith('-rejection') && !subReport.id.endsWith('-rework'))
                    .flatMap((subReport) => ([
                      {
                        id: `${subReport.id}-quick-mis`,
                        label: `${subReport.sourceFileName || subReport.name} MIS`,
                        reportId: 'mis-quality-performance',
                        subReportId: `${subReport.id}-mis`
                      },
                      {
                        id: `${subReport.id}-quick-crs`,
                        label: `${subReport.sourceFileName || subReport.name} CRS`,
                        reportId: 'consolidated-rejection-status',
                        subReportId: `${subReport.id}-crs`
                      }
                    ]))
                : [];
              return (
              <div key={report.id} className="shrink-0">
                <button
                  type="button"
                  onMouseEnter={(event) => {
                    if (!quickReportItems.length) return;
                    keepQuickReportMenuOpen();
                    const rect = event.currentTarget.getBoundingClientRect();
                    setQuickReportMenu({
                      reportId: report.id,
                      items: quickReportItems,
                      anchor: event.currentTarget,
                      left: rect.left,
                      top: rect.bottom + 8
                    });
                  }}
                  onMouseLeave={() => {
                    if (quickReportItems.length) scheduleQuickReportMenuClose();
                  }}
                  onFocus={(event) => {
                    if (!quickReportItems.length) return;
                    keepQuickReportMenuOpen();
                    const rect = event.currentTarget.getBoundingClientRect();
                    setQuickReportMenu({
                      reportId: report.id,
                      items: quickReportItems,
                      anchor: event.currentTarget,
                      left: rect.left,
                      top: rect.bottom + 8
                    });
                  }}
                  onClick={() => {
                    setActiveReportId(report.id);
                    setActiveSubReportId(report.subReports[0]?.id || '');
                    setSearchTerm('');
                  }}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition ${
                    activeReportId === report.id
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  {report.name}
                </button>
              </div>
              );
            })}
          </div>
          {quickReportMenu && (
            <div
              onMouseEnter={keepQuickReportMenuOpen}
              onMouseLeave={scheduleQuickReportMenuClose}
              className="fixed z-50 max-h-72 min-w-64 overflow-y-auto rounded-md border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              style={{ left: quickReportMenu.left, top: quickReportMenu.top }}
            >
              {quickReportMenu.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveReportId(item.reportId);
                    setActiveSubReportId(item.subReportId);
                    setSearchTerm('');
                    setQuickReportMenu(null);
                  }}
                  className="block w-full whitespace-nowrap px-4 py-2 text-left text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 dark:text-slate-200 dark:hover:bg-primary-900/30 dark:hover:text-primary-200"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto">
            {activeReport.subReports.map((subReport) => (
              <button
                key={subReport.id}
                type="button"
                onClick={() => {
                  setActiveSubReportId(subReport.id);
                  setSearchTerm('');
                }}
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
        </div>
      </div>
      ) : (
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 overflow-x-auto">
          {(isD1VmBaseFamily ? d1VmBaseGroups : isVisorPdiirFamily ? visorPdiirGroups : shellInspectionGroups).map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                if (isD1VmBaseFamily) {
                  const firstSheet = d1VmBaseInspectionReports.find((report) => report.groupId === group.id);
                  setActiveD1VmBaseGroupId(group.id);
                  if (firstSheet) setActiveD1VmBaseId(firstSheet.id);
                } else if (isVisorPdiirFamily) {
                  const firstSheet = visorPdiirInspectionReports.find((report) => report.groupId === group.id);
                  setActiveVisorPdiirGroupId(group.id);
                  if (firstSheet) setActiveVisorPdiirId(firstSheet.id);
                } else {
                  const firstSheet = shellMouldingInspectionReports.find((report) => report.groupId === group.id);
                  setActiveShellInspectionGroupId(group.id);
                  if (firstSheet) setActiveShellInspectionId(firstSheet.id);
                }
                setSearchTerm('');
              }}
              className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                (isD1VmBaseFamily ? activeD1VmBaseGroupId : isVisorPdiirFamily ? activeVisorPdiirGroupId : activeShellInspectionGroupId) === group.id
                  ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {group.name}
            </button>
          ))}
        </div>
      </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {!isInspectionFamily && (
        <div className="flex flex-wrap items-center gap-2">
        </div>
        )}

        {isInspectionFamily ? (
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {(isD1VmBaseFamily ? activeD1VmBaseSheets : isVisorPdiirFamily ? activeVisorPdiirSheets : activeShellInspectionSheets).map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => {
                    if (isD1VmBaseFamily) {
                      setActiveD1VmBaseId(report.id);
                    } else if (isVisorPdiirFamily) {
                      setActiveVisorPdiirId(report.id);
                    } else {
                      setActiveShellInspectionId(report.id);
                    }
                    setSearchTerm('');
                  }}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition ${
                    (isD1VmBaseFamily ? activeD1VmBaseId : isVisorPdiirFamily ? activeVisorPdiirId : activeShellInspectionId) === report.id
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {report.name}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                Date
                <input
                  type="date"
                  value={inspectionDateValue}
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
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search this inspection"
                  className="w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        ) : isMisReport ? (
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
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            {[
              ['calendar', 'Calendar'],
              ['full', 'Full table']
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setReportScrollMode(mode)}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                  reportScrollMode === mode
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
          </div>
        )}
      </div>

      {isInspectionFamily ? (
        <ShellMouldingInspectionTable
          report={isD1VmBaseFamily ? activeD1VmBaseReport : isVisorPdiirFamily ? activeVisorPdiirReport : activeShellInspectionReport}
          rows={filteredRows}
          onSampleChange={isD1VmBaseFamily ? updateD1VmBaseSample : isVisorPdiirFamily ? updateVisorPdiirSample : updateShellInspectionSample}
          onRemarksChange={isD1VmBaseFamily ? updateD1VmBaseRemarks : isVisorPdiirFamily ? updateVisorPdiirRemarks : updateShellInspectionRemarks}
          onSaveRow={isD1VmBaseFamily ? saveD1VmBaseRow : isVisorPdiirFamily ? saveVisorPdiirRow : saveShellInspectionRow}
        />
      ) : isMisReport ? (
        <div className="space-y-4">
          <div className="border border-slate-200 bg-white px-5 py-4 text-center dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeSubReportBase.sourceReportId ? `${activeSubReportBase.name} - PARTWISE QUALITY PERFORMANCE REPORT` : 'HELMET - PARTWISE QUALITY PERFORMANCE REPORT'}
            </h2>
          </div>
          {activeSubReportBase.sourceReportId ? (
            <section className="overflow-hidden border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="grid gap-0 xl:grid-cols-2">
                {[
                  { label: `For the day - ${selectedDayLabel}`, period: 'day' },
                  { label: `For the month - ${monthLabel}`, period: 'month' }
                ].map(({ label, period }) => (
                  <div key={period} className="min-w-0 border-slate-300 xl:border-r last:xl:border-r-0 dark:border-slate-700">
                    <div className="relative z-10 flex items-center justify-between border-b border-slate-300 bg-blue-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="font-bold text-slate-900 dark:text-white">{activeSubReportBase.sourceFileName}</h3>
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
                          {activeDynamicSummaryRows.map((row) => {
                            const output = period === 'day'
                              ? toNumber(activeDynamicSummaryReport?.days?.[selectedDayIndex]?.output)
                              : toNumber(activeDynamicSummaryTotals.output);
                            const rejection = period === 'day'
                              ? toNumber(row.days?.[selectedDayIndex])
                              : toNumber(row.total);
                            const percent = output ? (rejection / output) * 100 : 0;
                            const processName = [row.questionAnswer, row.hasSubQuestion ? row.defectDetails : '']
                              .filter(Boolean)
                              .join(' - ');
                            return (
                              <tr key={`${period}-${row.drrRowKey}`}>
                                <td className="border-b border-r border-slate-200 px-3 py-2 dark:border-slate-700">{row.partDetails || '-'}</td>
                                <td className="border-b border-r border-slate-200 px-3 py-2 dark:border-slate-700">{processName || row.defectDetails || '-'}</td>
                                <td className="border-b border-r border-slate-200 px-3 py-2 text-right dark:border-slate-700">{output}</td>
                                <td className="border-b border-r border-slate-200 px-3 py-2 text-right dark:border-slate-700">{rejection}</td>
                                <td className="border-b border-r border-slate-200 px-3 py-2 text-right dark:border-slate-700">{formatPercent(percent)}</td>
                                <td className="border-b border-r border-slate-200 px-3 py-2 text-right dark:border-slate-700">0</td>
                                <td className="border-b border-slate-200 px-3 py-2 text-right dark:border-slate-700">0</td>
                              </tr>
                            );
                          })}
                          {activeDynamicSummaryRows.length === 0 && (
                            <tr>
                              <td colSpan="7" className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">No report rows found.</td>
                            </tr>
                          )}
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
          ) : [1, 2, 3, 4].map((line) => (
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
              {activeSubReportBase.sourceReportId ? `${activeSubReportBase.name} - ${monthLabel}` : `Helmet - Consolidated Rejection Status - ${monthLabel}`}
            </h2>
          </div>
          {activeSubReportBase.sourceReportId ? (
          <div className="p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="overflow-hidden border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
                <h3 className="border-b border-slate-300 bg-blue-100 px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  {activeSubReportBase.sourceFileName}
                </h3>
                <p className="border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Month Cumulative - {monthLabel}
                </p>
                {[
                  ['TOTAL PRODUCTION QTY', activeDynamicSummaryTotals.output || 0],
                  ['TOTAL REJECTION & REWORK QTY', activeDynamicSummaryTotals.rejection || 0],
                  ['TOTAL REJECTION & REWORK QTY %', formatPercent(activeDynamicSummaryTotals.rejectionPercent || 0)],
                  ['TOTAL REJECTION QTY', activeDynamicRejectionTotals.rejection || 0],
                  ['TOTAL REJECTION %', formatPercent(activeDynamicRejectionTotals.rejectionPercent || 0)]
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[1fr_110px] border-b border-slate-200 text-xs last:border-b-0 dark:border-slate-700">
                    <span className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                    <span className="border-l border-slate-200 px-3 py-2 text-right font-bold text-slate-900 dark:border-slate-700 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          ) : (
          <div className="space-y-4 p-4">
            {crsLayout.map((row, rowIndex) => (
              <div key={`crs-row-${rowIndex}`} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {row.map((item) => (
                  <CumulativeBlock key={item.title} item={item} reports={crsReports} monthLabel={monthLabel} />
                ))}
              </div>
            ))}
          </div>
          )}
        </section>
      ) : isProductCategoryReport ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{activeSubReport.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Source: {activeSubReport.sourceFileName}</p>
          </div>
          <div className="max-h-[calc(100vh-270px)] overflow-auto">
            <table className="min-w-[1100px] w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-blue-100 dark:bg-slate-900">
                <tr>
                  {activeSubReport.descriptorColumns.map((column) => (
                    <th
                      key={column.key}
                      style={{ width: column.width }}
                      className={`${gridBorderClass} sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr key={`${activeSubReport.id}-product-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    {activeSubReport.descriptorColumns.map((column) => (
                      <td key={`${activeSubReport.id}-${column.key}-${index}`} className={`${gridBorderClass} px-3 py-2 text-slate-700 dark:text-slate-300`}>
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No products found for this category.
            </div>
          )}
        </section>
      ) : (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{activeSubReport.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Source: {activeSubReport.sourceFileName}</p>
        </div>

        <div className="h-[calc(100vh-250px)] min-h-[420px] overflow-auto">
          <table className="min-w-max table-fixed border-separate border-spacing-0 text-sm">
            <colgroup>
              {activeSubReport.descriptorColumns.map((column) => (
                <col key={`descriptor-col-${column.key}`} style={{ width: column.width, minWidth: column.width }} />
              ))}
              {reportDayColumns.map((column) => (
                <col key={`day-col-${column.id}`} style={{ width: 64, minWidth: 64 }} />
              ))}
              {activeSubReport.totalColumns.map((column) => (
                <col key={`total-col-${column.id}`} style={{ width: column.id === 'totalPercent' ? 80 : 64, minWidth: column.id === 'totalPercent' ? 80 : 64 }} />
              ))}
            </colgroup>
            <thead className="bg-blue-100 dark:bg-slate-900">
              <tr className={reportRowClass}>
                {hasSummaryRows ? (
                  <th
                    colSpan={activeSubReport.descriptorColumns.length}
                    style={{ minWidth: descriptorWidth, width: descriptorWidth, maxWidth: descriptorWidth, ...(isFullTableScroll ? {} : { left: 0 }) }}
                    className={`${cellHeightClass} ${gridBorderClass} sticky top-0 ${isFullTableScroll ? 'z-30' : 'left-0 z-40'} bg-blue-100 px-3 py-2 text-left font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                  >
                    Description
                  </th>
                ) : activeSubReport.descriptorColumns.map((column, columnIndex) => (
                  <th
                    key={column.key}
                    style={{ minWidth: column.width, width: column.width, ...(isFullTableScroll ? {} : { left: getDescriptorLeft(columnIndex) }) }}
                    className={`${cellHeightClass} ${gridBorderClass} sticky top-0 ${isFullTableScroll ? 'z-30' : 'z-40'} bg-blue-100 px-3 py-2 text-left font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                  >
                    {column.label}
                  </th>
                ))}
                {calendarColumns.map((column) => (
                  <th
                    key={column.id}
                    className={`${getColumnClass(column)} sticky top-0 z-30 bg-blue-100 font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSubReport.summaryRows.map((row, rowIndex) => (
                <tr key={row.label} className={reportRowClass}>
                  <td
                    colSpan={activeSubReport.descriptorColumns.length}
                    style={{
                      minWidth: descriptorWidth,
                      ...(isFullTableScroll ? {} : { left: 0 })
                    }}
                    className={`${cellHeightClass} ${gridBorderClass} ${isFullTableScroll ? '' : 'sticky left-0 z-20'} bg-white px-3 py-1 text-right font-semibold text-slate-900 dark:bg-slate-800 dark:text-white`}
                  >
                    {row.label}
                  </td>
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
                      getCellValue(row.totalPercent, getSummaryReport(row)) ? 'bg-orange-100 text-slate-900 dark:bg-orange-950 dark:text-orange-100' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {getCellValue(row.totalPercent, getSummaryReport(row))}
                  </td>
                </tr>
              ))}
              <tr className="h-1">
                <td colSpan={activeSubReport.descriptorColumns.length + calendarColumns.length} className={`${gridBorderClass} bg-white dark:bg-slate-800`} />
              </tr>
              {hasSummaryRows && (
                <tr className={reportRowClass}>
                  {activeSubReport.descriptorColumns.map((column, columnIndex) => (
                    <th
                      key={`detail-header-${column.key}`}
                      style={{ minWidth: column.width, width: column.width, ...(isFullTableScroll ? {} : { left: getDescriptorLeft(columnIndex) }) }}
                      className={`${cellHeightClass} ${gridBorderClass} ${isFullTableScroll ? '' : 'sticky z-20'} bg-blue-100 px-3 py-2 text-left font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                    >
                      {column.label}
                    </th>
                  ))}
                  {calendarColumns.map((column) => (
                    <th
                      key={`detail-date-header-${column.id}`}
                      className={`${getColumnClass(column)} bg-blue-100 font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              )}
              {filteredRows.map((row, index) => (
                <tr key={`${activeSubReport.id}-row-${index}`} className={`${reportRowClass} hover:bg-slate-50 dark:hover:bg-slate-700/40`}>
                  {activeSubReport.descriptorColumns.map((column, columnIndex) => (
                    <td
                      key={`${activeSubReport.id}-${column.key}-${index}`}
                      style={{ minWidth: column.width, width: column.width, ...(isFullTableScroll ? {} : { left: getDescriptorLeft(columnIndex) }) }}
                      className={`${cellHeightClass} ${gridBorderClass} ${isFullTableScroll ? '' : 'sticky z-10'} bg-white px-3 py-1 dark:bg-slate-800 ${
                        columnIndex === 0
                          ? 'truncate font-medium text-slate-900 dark:text-white'
                          : 'truncate text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {row[column.key]}
                    </td>
                  ))}
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

const Dashboard = (props = {}) => {
  const { user, isAdmin } = useAuth();

  if (props.allowedReportIds || isAdmin) {
    return <AdminDashboard {...props} />;
  }

  return <UserDashboard user={user} />;
};

export default Dashboard;
