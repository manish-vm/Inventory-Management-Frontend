const createRows = (defects) =>
  defects.map((defectDetails) => ({
    assemblyProcess: 'Moulding Defects',
    partDetails: 'Visor',
    defectDetails
  }));

export const visorMouldingReports = [
  {
    line: 1,
    subReportName: 'D1 - Visor Moulding DRR',
    sourceFileName: 'D1 - Visor Moulding DRR',
    rows: createRows([
      'Silver streaks',
      'Black spot',
      'Moulding Rejection at Visor Coating',
      'Short Fill',
      'Weld Line',
      'Setting pieces rejection',
      'Damage',
      'Flow mark',
      'Scratches',
      'Sink Mark',
      'Dust Mark',
      'Burning Mark',
      'Fit mark',
      'Gas mark/Smoke',
      'Flashes'
    ])
  },
  {
    line: 2,
    subReportName: 'D2 - Visor Moulding DRR',
    sourceFileName: 'D2 - Visor Moulding DRR',
    rows: createRows([
      'Silver streaks',
      'Flow mark',
      'Black spot',
      'Flashes',
      'Short Fill',
      'Weld Line',
      'Scratches',
      'Setting pieces',
      'Sink Mark',
      'White colour',
      'Damage',
      'Air bubble',
      'Burning Mark',
      'Moulding Rejection at Visor Coating'
    ])
  },
  {
    line: 3,
    subReportName: 'D3 - Visor Moulding DRR',
    sourceFileName: 'D3 - Visor Moulding DRR',
    rows: createRows([
      'Silver streaks',
      'Flow mark',
      'Black spot',
      'Flashes',
      'Short Fill',
      'Weld Line',
      'Scratches',
      'Setting pieces',
      'Sink Mark',
      'White colour',
      'Damage',
      'Air bubble',
      'Fit mark',
      'Burning Mark',
      'Moulding Rejection at Visor Coating'
    ])
  },
  {
    line: 4,
    subReportName: 'D4 - Visor Moulding DRR',
    sourceFileName: 'D4 - Visor Moulding DRR',
    rows: createRows([
      'Silver streaks',
      'Flow mark',
      'Black spot',
      'Flashes',
      'Short Fill',
      'Weld Line',
      'Scratches',
      'Setting pieces',
      'Sink Mark',
      'White colour',
      'Damage',
      'Air bubble',
      'Fit mark',
      'Burning Mark',
      'Moulding Rejection at Visor Coating'
    ])
  }
];
