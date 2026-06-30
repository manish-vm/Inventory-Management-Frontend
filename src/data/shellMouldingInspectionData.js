const mouldedShellVisualRows = [
  'Shortfill',
  'Sink Mark',
  'Silver Streaks',
  'Flow Mark',
  'Parting Line Flashes',
  'Weld line',
  'Dent Mark',
  'Scratch',
  'Under cut',
  'Cold Material',
  'Drooling',
  'Air Bubble',
  'Oil Mark',
  'Scoring Mark',
  'Stress Mark',
  'Warpage',
].map((characteristic, index) => ({
  sno: index + 1,
  characteristic,
  specification: 'Not allowed',
  inspectionMethod: 'Visual',
  remarks: '',
}));

const visualLuxRow = {
  sno: 17,
  characteristic: 'Lux Value at visual inspection area',
  specification: 'Minimum 800 Lux',
  inspectionMethod: 'Lux Meter',
  remarks: '',
};

const makeRows = (rows) => rows.map((row) => ({
  ...row,
  samples: row.type === 'section' ? [] : ['', '', '', '', ''],
}));

const sectionRow = (title) => ({ type: 'section', title });

const shellD1DimensionsC = [
  ['Inner ID', 'Dia 16.78 +/- 0.2', 'DVC'],
  ['Top slot length', '24.70 +/- 0.2', 'DVC'],
  ['Over all ID', 'Dia 56.97 +/- 0.40', 'DVC'],
  ['Small Slot width 1A', '4.31 +/- 0.2', 'DVC'],
  ['Small Slot width 1B', '4.82 +/- 0.05', 'DVC'],
  ['Big Slot width 2A', '5.40 +/- 0.2', 'DVC'],
  ['Big Slot width 2B', '6.92 +/- 0.1', 'DVC'],
  ['Small Slot width 3A', '4.40 +/- 0.2', 'DVC'],
  ['Small Slot width 3B', '4.75 +/- 0.2', 'DVC'],
];

const shellD2DimensionsA = [
  ['Inner ID', 'Dia 14.40 +/- 0.20', 'DVC'],
  ['Top slot length', '24.80 +/- 0.40', 'DVC'],
  ['Over all ID', 'Dia 55 +/- 1.2', 'DVC'],
  ['Small Slot width 1A', '5 +/- 0.50', 'DVC'],
  ['Small Slot width 1B', '6.2 +/- 0.3', 'DVC'],
  ['Big Slot width 2A', '6.9 +/- 0.50', 'DVC'],
  ['Big Slot width 2B', '8.3 +/- 0.20', 'DVC'],
  ['Small Slot width 3A', '5 +/- 0.50', 'DVC'],
  ['Small Slot width 3B', '6.1 +/- 0.2', 'DVC'],
];

const shellD4DimensionsA = [
  ['Small Slot width 1A', '5 +/- 0.2', 'DVC'],
  ['Small Slot width 1B', '4.40 +/- 0.15', 'DVC'],
  ['Big Slot width 2A', '4.6 +/- 0.2', 'DVC'],
  ['Big Slot width 2B', '7 +/- 0.15', 'DVC'],
  ['Small Slot width 3A', '5.20 +/- 0.2', 'DVC'],
  ['Small Slot width 3B', '4.1 +/- 0.15', 'DVC'],
  ['Rivet area ID', 'Dia 5.6 +/- 0.2', 'DVC'],
];

const makeDimensionalRows = (dimensions) => dimensions.map(([characteristic, specification, inspectionMethod], index) => ({
  sno: index === 0 ? 1 : index,
  characteristic,
  specification,
  inspectionMethod,
  remarks: '',
}));

const makeShellInspectionRows = ({ rawMaterialSpec, weightSpec, dimensionSections }) => makeRows([
  ...mouldedShellVisualRows,
  visualLuxRow,
  sectionRow('RAW MATERIAL'),
  {
    sno: 1,
    characteristic: 'Shell Raw material',
    specification: rawMaterialSpec,
    inspectionMethod: 'As per supplier test certificate',
    remarks: '',
  },
  sectionRow('PART WEIGHT'),
  {
    sno: 1,
    characteristic: 'Weight __gm.',
    specification: weightSpec,
    inspectionMethod: 'Weighing Machine',
    remarks: '',
  },
  ...dimensionSections.flatMap((section) => [
    sectionRow(section.title),
    ...makeDimensionalRows(section.rows),
  ]),
]);

const shellD1Layout = (rawMaterialSpec, weightSpec) => ({
  rawMaterialSpec,
  weightSpec,
  dimensionSections: [
    { title: 'DIMENSION LH/RH SIDE DETAILS - C', rows: shellD1DimensionsC },
    { title: 'DIMENSION LH /RH SIDE VIEW - D', rows: [['Rivet area ID X 2', 'Dia 4.2 +/- 0.10', 'DVC']] },
    { title: 'DIMENSION LH / RH SIDE VIEW - E', rows: [['Rivet area ID X 2', 'Dia 4.2 +/- 0.10', 'DVC']] },
  ],
});

const shellD2Layout = (weightSpec) => ({
  rawMaterialSpec: 'ABS- PT-0183',
  weightSpec,
  dimensionSections: [
    { title: 'DIMENSION LH/RH SIDE DETAIL- A', rows: shellD2DimensionsA },
    { title: 'DIMENSION LH/RH SIDE DETAIL- B', rows: [['Rivet area ID X 2', 'Dia 4.2 +/- 0.2', 'DVC']] },
    { title: 'DIMENSION LH/RH SIDE DETAIL- C', rows: [['Rivet area ID X 2', 'Dia 4.2 +/- 0.2', 'DVC']] },
  ],
});

const shellD4Layout = () => ({
  rawMaterialSpec: 'ABS- PT-0183',
  weightSpec: '550 +/- 15grms',
  dimensionSections: [
    { title: 'DIMENSION LH/RH SIDE DETAIL- A', rows: shellD4DimensionsA },
  ],
});

export const shellMouldingInspectionReports = [
  {
    id: 'painted-shell',
    name: 'Painted Shell',
    groupId: 'painted-shell',
    groupName: 'Painted Shell',
    productionLine: '',
    inspectionStage: 'painted',
    reportTitle: 'Inward Inspection Report - Decal & Painted Shell',
    sourceFileName: 'Shell Moulding Inspection.xlsx / Painted Shell',
    rows: makeRows([
      ...[
        'Paint Rundown',
        'Dry Spray',
        'Paint Uncoverage',
        'Dust',
        'Scratches',
        'Dent Mark',
        'Water stain Mark',
        'Oil spot',
        'Paint peel off',
        'Orange Peel',
        'Sticker Cutting Mistack',
        'Sticker Positioning Variation',
        'Air Bubble',
        'Shade Variation',
        'Pin Holes',
        'Improper Buffing (Sink Mark)',
        'Parting Line Visiblity',
        'Foam Impression mark',
      ].map((characteristic, index) => ({
        sno: index + 1,
        characteristic,
        specification: 'Not allowed',
        inspectionMethod: 'Visual',
        remarks: '',
      })),
      {
        sno: 19,
        characteristic: 'Lux Value at visual inspection area',
        specification: 'Minimum 800 Lux',
        inspectionMethod: 'Lux Meter',
        remarks: '',
      },
      {
        sno: 1,
        characteristic: 'Weight __gm.',
        specification: 'As per model specification',
        inspectionMethod: 'Weighing Machine',
        remarks: '',
      },
    ]),
  },
  {
    id: 'inward-shell-d1',
    name: 'Inward',
    groupId: 'd1-shell',
    groupName: 'D1 Shell',
    productionLine: 'D1',
    inspectionStage: 'inward',
    reportTitle: 'Inward Inspection Report - D1 ACE Shell',
    sourceFileName: 'Shell Moulding Inspection.xlsx / INWARD SHELL D1',
    rows: makeShellInspectionRows(shellD1Layout('ABS- PT-0183', '494 +/- 15grms')),
  },
  {
    id: 'inprocess-shell-d1',
    name: 'Inprocess',
    groupId: 'd1-shell',
    groupName: 'D1 Shell',
    productionLine: 'D1',
    inspectionStage: 'inprocess',
    reportTitle: 'Inprocess Inspection Report - D1 ACE Shell',
    sourceFileName: 'Shell Moulding Inspection.xlsx / INPROCESS SHELL D1',
    rows: makeShellInspectionRows(shellD1Layout('3ABS- PT-0183', '494 +/-15grms')),
  },
  {
    id: 'inward-shell-d2',
    name: 'Inward',
    groupId: 'd2-shell',
    groupName: 'D2 Shell',
    productionLine: 'D2',
    inspectionStage: 'inward',
    reportTitle: 'Inward Inspection Report - D2 FIT Shell',
    sourceFileName: 'Shell Moulding Inspection.xlsx / INWARD SHELL D2',
    rows: makeShellInspectionRows(shellD2Layout('480+/-15grms')),
  },
  {
    id: 'inprocess-shell-d2',
    name: 'Inprocess',
    groupId: 'd2-shell',
    groupName: 'D2 Shell',
    productionLine: 'D2',
    inspectionStage: 'inprocess',
    reportTitle: 'Inprocess Inspection Report - D2 FIT Shell',
    sourceFileName: 'Shell Moulding Inspection.xlsx / INPROCESS SHELL D2',
    rows: makeShellInspectionRows(shellD2Layout('480 +/-15grms')),
  },
  {
    id: 'inward-shell-d4',
    name: 'Inward',
    groupId: 'd4-shell',
    groupName: 'D4 Shell',
    productionLine: 'D4',
    inspectionStage: 'inward',
    reportTitle: 'Inward Inspection Report - D4 ARC Shell',
    sourceFileName: 'Shell Moulding Inspection.xlsx / INWARD SHELL D4',
    rows: makeShellInspectionRows(shellD4Layout()),
  },
  {
    id: 'inprocess-shell-d4',
    name: 'Inprocess',
    groupId: 'd4-shell',
    groupName: 'D4 Shell',
    productionLine: 'D4',
    inspectionStage: 'inprocess',
    reportTitle: 'Inprocess Inspection Report - D4 ARC Shell',
    sourceFileName: 'Shell Moulding Inspection.xlsx / INPROCESS SHELLL D4',
    rows: makeShellInspectionRows(shellD4Layout()),
  },
];
