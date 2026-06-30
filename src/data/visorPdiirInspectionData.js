const makeRows = (rows) => rows.map((row) => ({
  ...row,
  samples: row.type === 'section' ? [] : ['', '', '', '', ''],
}));

const sectionRow = (title) => ({ type: 'section', title });

const visualRows = [
  'Poor finish',
  'Shot fiiling',
  'Sink mark ,Flashes ,Sharp edges',
  'Scratches',
  'Flow mark (Gate area)',
  'Improper defalshing',
  'Ejector pin impression mark',
  'Mould catchup mark',
  'Leg damage',
  'Oil flow mark',
  'Silver streak',
  'Parting line mark',
].map((characteristic, index) => ({
  sno: index + 1,
  characteristic,
  specification: 'Not allowed',
  inspectionMethod: 'Visual',
  remarks: '',
}));

const rawMaterialRows = [
  {
    sno: 1,
    characteristic: 'Material :',
    specification: 'POM',
    inspectionMethod: 'Material as per drawing',
    remarks: '',
  },
  {
    sno: 2,
    characteristic: 'Grade',
    specification: 'Ultraform N23200038 AT Unclored +MB Black',
    inspectionMethod: 'Material as per drawing',
    remarks: '',
  },
];

const d1D4DimensionRows = [
  ['Weight ___g.', '8 +/- 1.5 g', 'Weighing Machine'],
  ['Small locking pip height', '1.11 +/- 0.05 mm', 'DVC'],
  ['Small locking pip height', '1.2 +/- 0.05 mm', 'DVC'],
  ['Inner Diameter', '25+0.40 mm', 'DVC'],
  ['Outer Diameter', '56 +/- 0.40 mm', 'DVC'],
  ['Over all Length', '58.95 +/- 0.40 mm', 'DVC'],
  ['Depth', '2.20 +/- 0.05 mm', 'DVC'],
  ['Locking rib thickness', '2.87 +/- 0.05 mm', 'DVC'],
  ['Big locking pip hieght', '3.11 +/- 0.10 mm', 'DVC'],
  ['Big mounting rib width', '7.00 +0.05 mm', 'DVC'],
  ['Small mounting rib width', '4.9+0.05 mm x 2', 'DVC'],
];

const d2DimensionRows = [
  ['Weight ___g.', '10 +/- 1.5g', 'Weighing Machine'],
  ['Over all Length', '56 +/- 0.40 mm', 'DVC'],
  ['Overall OD', 'Dia 54 +/- 0.40mm', 'DVC'],
  ['Big rib width', '6.6 +/- 0.05 mm', 'DVC'],
  ['Small rib width x 2', '4.7 +/- 0.05 mm', 'DVC'],
  ['Inner ID', 'Dia 14.91 +/- 0.05mm', 'DVC'],
  ['Rib Height', '3.1 +/- 0.05 mm', 'DVC'],
  ['Rib Thickness', '3.5 +/- 0.05 mm', 'DVC'],
  ['Small rib Locking pip thickness', '2 +/- 0.05 mm', 'DVC'],
  ['Big rib Locking pip thickness', '3.8 +/- 0.05 mm', 'DVC'],
];

const makeDimensionalRows = (rows) => rows.map(([characteristic, specification, inspectionMethod], index) => ({
  sno: index + 1,
  characteristic,
  specification,
  inspectionMethod,
  remarks: '',
}));

const makePdiirRows = (dimensions) => makeRows([
  ...visualRows,
  sectionRow('RAW MATERIAL'),
  ...rawMaterialRows,
  sectionRow('DIMENSION'),
  ...makeDimensionalRows(dimensions),
]);

export const visorPdiirInspectionReports = [
  {
    id: 'd1-d4-vm-base-lh',
    name: 'LH',
    groupId: 'd1-d4-vm-base',
    groupName: 'D1/D4 VM Base',
    productionLine: 'D1/D4',
    inspectionStage: 'pdiir',
    side: 'LH',
    partName: 'D1 VM Base LH',
    reportTitle: 'Pre Delivery Inspection report - D1 VM Base',
    sourceFileName: 'VISOR PDIIR.xlsx / D1 D4 VM BASE LH',
    rows: makePdiirRows(d1D4DimensionRows),
  },
  {
    id: 'd1-d4-vm-base-rh',
    name: 'RH',
    groupId: 'd1-d4-vm-base',
    groupName: 'D1/D4 VM Base',
    productionLine: 'D1/D4',
    inspectionStage: 'pdiir',
    side: 'RH',
    partNumber: 'SPM03010021',
    partName: 'D1 VM Base RH',
    reportTitle: 'Pre Delivery Inspection report - D1 VM Base',
    sourceFileName: 'VISOR PDIIR.xlsx / D1 D4 VM BASE RH',
    rows: makePdiirRows(d1D4DimensionRows),
  },
  {
    id: 'd2-vm-base-lh',
    name: 'LH',
    groupId: 'd2-vm-base',
    groupName: 'D2 VM Base',
    productionLine: 'D2',
    inspectionStage: 'pdiir',
    side: 'LH',
    partName: 'D2 VM Base LH',
    reportTitle: 'Pre Delivery Inspection report - D2 VM Base',
    sourceFileName: 'VISOR PDIIR.xlsx / D2 VM BASE LH',
    rows: makePdiirRows(d2DimensionRows),
  },
  {
    id: 'd2-vm-base-rh',
    name: 'RH',
    groupId: 'd2-vm-base',
    groupName: 'D2 VM Base',
    productionLine: 'D2',
    inspectionStage: 'pdiir',
    side: 'RH',
    partName: 'D2 VM Base RH',
    reportTitle: 'Pre Delivery Inspection report - D2 VM Base',
    sourceFileName: 'VISOR PDIIR.xlsx / D2 VM BASE RH',
    rows: makePdiirRows(d2DimensionRows),
  },
];
