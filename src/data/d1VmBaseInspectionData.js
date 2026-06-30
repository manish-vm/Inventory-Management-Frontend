import { visorPdiirInspectionReports } from './visorPdiirInspectionData';

export const d1VmBaseInspectionReports = visorPdiirInspectionReports.map((report) => ({
  ...report,
  id: `d1-vm-base-rh-lh-${report.id}`,
  groupId: `d1-vm-base-rh-lh-${report.groupId}`,
  inspectionStage: 'd1-vm-base-rh-lh',
  sourceFileName: report.sourceFileName.replace('VISOR PDIIR.xlsx', 'D1 VM  BASE RH_LH.xlsx'),
  rows: report.rows.map((row) => ({
    ...row,
    samples: Array.isArray(row.samples) ? [...row.samples] : row.samples,
  })),
}));
