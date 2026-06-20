const createRows = (assemblyProcess, partDetails, defects) =>
  defects.map((defectDetails) => ({ assemblyProcess, partDetails, defectDetails }));

export const visorMechanismTopMouldingReports = [
  {
    line: 1,
    subReportName: 'D1 - Visor Mechanism Top Moulding DRR',
    sourceFileName: 'D1 - Visor Mech Top Moulding DR',
    rows: createRows('Moulding Defects', 'VM- TOP', [
      'Silver streaks',
      'Flow mark/Oil Mark',
      'Black spot',
      'Flashes',
      'Short Fill',
      'Weld Line',
      'Setting pieces'
    ])
  },
  {
    line: 2,
    subReportName: 'D2 - Visor Mechanism Top Moulding DRR',
    sourceFileName: 'D2 - Visor Mech Top Moulding DR',
    rows: createRows('Moulding Defects', 'VM- TOP', [
      'Silver streaks',
      'Flow mark/Oil Mark',
      'Black spot',
      'Flashes',
      'Short Fill',
      'Weld Line',
      'Setting pieces',
      'Damage'
    ])
  }
];

export const visorCoatingReports = [
  {
    line: 1,
    defects: [
      'Assembly rejection Scratches',
      'Dent Due to Tray Fall',
      'Dust',
      'Scratches',
      'Silicon Flow',
      'Flashes & Thread',
      'Silver Mark',
      'Coating Uncoverage',
      'Buffing rejection',
      'Black Spot',
      'Burn Mark'
    ]
  },
  {
    line: 2,
    defects: [
      'Assembly rejection Scratches',
      'Dust',
      'Dent Due to Tray Fall',
      'Silicon Flow',
      'Scratches',
      'Flashes & Thread',
      'Black Spot',
      'Silver Mark',
      'Coating Uncoverage',
      'Burn Mark',
      'Buffing rejection'
    ]
  },
  {
    line: 3,
    defects: [
      'Assembly rejection Scratches',
      'Dust',
      'Dent Due to Tray Fall',
      'Silicon Flow',
      'Scratches',
      'Flashes & Thread',
      'Black Spot',
      'Silver Mark',
      'Coating Uncoverage',
      'Burn Mark',
      'Buffing rejection'
    ]
  },
  {
    line: 4,
    defects: [
      'Silver Mark',
      'Silicon Flow',
      'Scratches',
      'Flashes & Thread',
      'Dust',
      'Dent Due to Tray Fall',
      'Coating Uncoverage',
      'Burn Mark',
      'Buffing rejection',
      'Black Spot',
      'Assembly rejection Scratches'
    ]
  }
].map((report) => ({
  line: report.line,
  subReportName: `D${report.line} - Visor Coating DRR`,
  sourceFileName: `D${report.line} - Visor Coating DRR`,
  rows: createRows('Coating Defects', 'Visor', report.defects)
}));

const shellD1Defects = [
  'Silver Streak',
  'Short Fill',
  'Setting Process Rejection',
  'Burn Mark',
  'Weld line',
  'Flow mark',
  'Sink Mark',
  'Black Dot',
  'Damage',
  'Flashes',
  'Oil mark',
  'Parting Line',
  'Scratches'
];

const shellD2ToD4Defects = [
  'Silver Streak',
  'Setting Process Rejection',
  'Damage',
  'Short Fill',
  'Flow Mark',
  'Burn Mark',
  'Black dot',
  'Sink Mark',
  'Scratches',
  'Flashes',
  'Sharp Edges',
  'Parting Line',
  'Weld line'
];

export const shellMouldingReports = [1, 2, 3, 4].map((line) => ({
  line,
  subReportName: `D${line} - Shell Moulding DRR`,
  sourceFileName: `D${line} - Shell Moulding`,
  rows: createRows('Moulding Defects', 'Shell', line === 1 ? shellD1Defects : shellD2ToD4Defects)
}));
