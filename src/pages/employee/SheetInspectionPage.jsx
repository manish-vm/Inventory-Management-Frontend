import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { misOperationsAPI } from '../../api/api';
import {
  helmetD1DrrReport,
  helmetD1RejectionReport,
  helmetD2RejectionReport,
  helmetD3RejectionReport,
  helmetD4RejectionReport
} from '../../data/helmetWorkbookReportData';
import {
  helmetD2DrrReport,
  helmetD3DrrReport,
  helmetD4DrrReport
} from '../../data/correctedHelmetDrrData';
import { visorMouldingReports } from '../../data/visorMouldingReportData';
import {
  shellMouldingReports,
  visorCoatingReports,
  visorMechanismTopMouldingReports
} from '../../data/additionalMouldingReportData';
import {
  bopReports,
  chinCoverReports,
  spoilerReports,
  stagewiseReports
} from '../../data/latestWorkbookReportData';

const normalizeReportKey = (value) => String(value || '').trim().toLowerCase();
const fillMergedDrrValues = (rows) => {
  let assemblyProcess = '';
  let partDetails = '';
  return rows.map((row) => {
    if (String(row.assemblyProcess || '').trim()) assemblyProcess = row.assemblyProcess;
    if (String(row.partDetails || '').trim()) partDetails = row.partDetails;
    return { ...row, assemblyProcess, partDetails };
  });
};

const buildSheetOptions = () => {
  const helmetSheets = [
    [1, helmetD1DrrReport, helmetD1RejectionReport],
    [2, helmetD2DrrReport, helmetD2RejectionReport],
    [3, helmetD3DrrReport, helmetD3RejectionReport],
    [4, helmetD4DrrReport, helmetD4RejectionReport]
  ].flatMap(([line, drrReport, rejectionReport]) => [
    {
      id: `d${line}-helmet-assembly-drr`,
      group: 'Helmet Assembly',
      line: `D${line}`,
      name: drrReport.subReportName,
      descriptorColumns: [
        { key: 'assemblyProcess', label: 'Assembly Process' },
        { key: 'partDetails', label: 'Part details' },
        { key: 'defectDetails', label: 'Defect Details' }
      ],
      rows: fillMergedDrrValues(drrReport.rows)
    },
    {
      id: `d${line}-helmet-assembly-rejection`,
      group: 'Helmet Assembly',
      line: `D${line}`,
      name: rejectionReport.subReportName,
      descriptorColumns: line >= 3
        ? [{ key: 'rejectionDetails', label: 'Defects' }]
        : [
            { key: 'defectGroup', label: 'Defects' },
            { key: 'rejectionDetails', label: 'Rejection Details' }
          ],
      rows: rejectionReport.rows
    }
  ]);

  const cloneRows = (rows) => rows.map((row) => ({ ...row }));

  const drrGroup = (group, reports, processLabel, transform = cloneRows) => reports.map((report) => ({
    id: `${group.id}-d${report.line}`,
    group: group.name,
    line: `D${report.line}`,
    name: report.subReportName,
    descriptorColumns: [
      { key: 'assemblyProcess', label: processLabel },
      { key: 'partDetails', label: 'Part details' },
      { key: 'defectDetails', label: 'Defect Details' }
    ],
    rows: transform(report.rows)
  }));

  return [
    ...helmetSheets,
    ...visorMouldingReports.map((report) => ({
      id: `d${report.line}-visor-moulding-drr`,
      group: 'Visor Moulding Quality Performance',
      line: `D${report.line}`,
      name: report.subReportName,
      descriptorColumns: [
        { key: 'assemblyProcess', label: 'Visor moulding Process' },
        { key: 'partDetails', label: 'Part details' },
        { key: 'defectDetails', label: 'Defect Details' }
      ],
      rows: report.rows
    })),
    ...drrGroup({ id: 'visor-mechanism-top-moulding', name: 'Visor Mechanism Top Moulding' }, visorMechanismTopMouldingReports, 'Visor Top moulding Process'),
    ...drrGroup({ id: 'visor-coating-quality-performance', name: 'Visor Coating Quality Performance' }, visorCoatingReports, 'Visor Coating Process'),
    ...drrGroup({ id: 'shell-moulding-quality-performance', name: 'Shell Moulding Quality Performance' }, shellMouldingReports, 'Shell moulding Process'),
    ...drrGroup(
      { id: 'stagewise-rejection-performance', name: 'Stagewise Rejection' },
      stagewiseReports.map((report) => ({
        ...report,
        rows: report.rows.map((row) => ({ assemblyProcess: '', partDetails: row.assemblyProcess, defectDetails: row.partDetails }))
      })),
      'Helmet assembly'
    ),
    ...drrGroup({ id: 'chin-cover-moulding-performance', name: 'Chin Cover Moulding' }, chinCoverReports, 'Chin Cover moulding Process'),
    ...drrGroup({ id: 'spoiler-moulding-performance', name: 'Spoiler Moulding' }, spoilerReports, 'Spoiler moulding Process'),
    ...bopReports.map((report) => ({
      id: `d${report.line}-bop-parts-receipt`,
      group: 'BOP Parts Receipt',
      line: `D${report.line}`,
      name: report.subReportName,
      descriptorColumns: [{ key: 'defectDetails', label: 'Description' }],
      rows: report.metrics.map((metric) => ({ defectDetails: metric }))
    }))
  ];
};

const sheetOptions = buildSheetOptions();

const getRowKey = (row, index, sheet) => {
  if (row.rejectionDetails) return normalizeReportKey(row.rejectionDetails);
  return `${index}-${normalizeReportKey(row.defectDetails || row.partDetails || sheet.name)}`;
};

const SheetInspectionPage = () => {
  const now = new Date();
  const [sheetId, setSheetId] = useState(sheetOptions[0]?.id || '');
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [entries, setEntries] = useState({});
  const [savingKey, setSavingKey] = useState('');

  const selectedSheet = useMemo(
    () => sheetOptions.find((sheet) => sheet.id === sheetId) || sheetOptions[0],
    [sheetId]
  );
  const selectedDay = Number(date.slice(-2));
  const selectedMonth = Number(date.slice(5, 7));
  const selectedYear = Number(date.slice(0, 4));

  useEffect(() => {
    const load = async () => {
      try {
        const response = await misOperationsAPI.getEmployeeSheetEntries({
          month: selectedMonth,
          year: selectedYear,
          sheetId,
          mine: true
        });
        const nextEntries = {};
        (response.data.entries || []).forEach((entry) => {
          nextEntries[`${entry.rowKey}:${entry.day}`] = entry.value || '';
        });
        setEntries(nextEntries);
      } catch (error) {
        toast.error('Failed to load sheet entries');
      }
    };
    if (sheetId && selectedMonth && selectedYear) load();
  }, [selectedMonth, selectedYear, sheetId]);

  const saveCell = async (row, rowIndex) => {
    const rowKey = getRowKey(row, rowIndex, selectedSheet);
    const value = entries[`${rowKey}:${selectedDay}`] || 0;
    setSavingKey(rowKey);
    try {
      await misOperationsAPI.saveEmployeeSheetEntry({
        sheetId: selectedSheet.id,
        sheetName: selectedSheet.name,
        rowKey,
        rowLabel: row.rejectionDetails || row.defectDetails || row.partDetails || '',
        productionLine: selectedSheet.line,
        inspectedAt: date,
        day: selectedDay,
        value
      });
      toast.success('Entry saved');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save entry');
    } finally {
      setSavingKey('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Sheet Entry</h1>
          <p className="text-slate-600 dark:text-slate-400">Enter your quantity against the same MIS dashboard sheet rows.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={sheetId}
            onChange={(event) => setSheetId(event.target.value)}
            className="min-w-[320px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {sheetOptions.map((sheet) => (
              <option key={sheet.id} value={sheet.id}>{sheet.group} / {sheet.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <section key={selectedSheet.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedSheet.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedSheet.group} - {selectedSheet.line} - Day {selectedDay}</p>
        </div>
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-[900px] w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-blue-100 dark:bg-slate-900">
              <tr>
                {selectedSheet.descriptorColumns.map((column) => (
                  <th key={column.key} className="sticky top-0 z-20 border-b border-r border-slate-300 bg-blue-100 px-4 py-3 text-left font-semibold dark:border-slate-700 dark:bg-slate-900">{column.label}</th>
                ))}
                <th className="sticky top-0 z-20 w-36 border-b border-r border-slate-300 bg-blue-100 px-4 py-3 text-center font-semibold dark:border-slate-700 dark:bg-slate-900">
                  {String(selectedDay).padStart(2, '0')}/{String(selectedMonth).padStart(2, '0')}
                </th>
                <th className="sticky top-0 z-20 w-28 border-b border-slate-300 bg-blue-100 px-4 py-3 text-center font-semibold dark:border-slate-700 dark:bg-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedSheet.rows.map((row, rowIndex) => {
                const rowKey = getRowKey(row, rowIndex, selectedSheet);
                return (
                  <tr key={rowKey} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    {selectedSheet.descriptorColumns.map((column) => (
                      <td key={column.key} className="border-b border-r border-slate-200 px-4 py-3 font-medium text-slate-800 dark:border-slate-700 dark:text-slate-100">
                        {row[column.key] || '-'}
                      </td>
                    ))}
                    <td className="border-b border-r border-slate-200 px-3 py-2 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        value={entries[`${rowKey}:${selectedDay}`] ?? ''}
                        onChange={(event) => setEntries((current) => ({ ...current, [`${rowKey}:${selectedDay}`]: event.target.value }))}
                        className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-center text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-center dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => saveCell(row, rowIndex)}
                        disabled={savingKey === rowKey}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SheetInspectionPage;
