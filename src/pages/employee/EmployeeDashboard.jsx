import Dashboard from '../Dashboard';

const EmployeeDashboard = () => {
  return (
    <Dashboard
      title="Employee Dashboard"
      subtitle="MIS and CRS report sheets for production quality performance."
      allowedReportIds={['mis-quality-performance', 'consolidated-rejection-status']}
      showInspectionReports={false}
    />
  );
};

export default EmployeeDashboard;
