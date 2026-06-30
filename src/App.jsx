import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Billing from './pages/Billing';
import Invoices from './pages/Invoices';
import RefundRequests from './pages/RefundRequests';
import Reports from './pages/Reports';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminManagement from './pages/AdminManagement';
import DealerManagement from './pages/DealerManagement';
import SubscriptionPlans from './pages/SubscriptionPlans';
import ActivityLogs from './pages/ActivityLogs';
import Messages from './pages/Messages';
import MessageInbox from './pages/Inbox';
import AdminMessages from './pages/AdminMessages';
import AdminEmployees from './pages/AdminEmployees';
import RoleManagement from './pages/RoleManagement';
import EmployeeProfile from './pages/EmployeeProfile';
import ProductMaster from './pages/ProductMaster';
import QRGenerator from './pages/QRGenerator';
import ManufacturingConfig from './pages/ManufacturingConfig';
import OperatorDashboard from './pages/OperatorDashboard';
import Analytics from './pages/Analytics';

import ProductReviewConfig from './pages/ProductReviewConfig';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import QRScannerPage from './pages/employee/QRScannerPage';
import ScanLogsPage from './pages/employee/ScanLogsPage';
import ProductTraceabilityPage from './pages/employee/ProductTraceabilityPage';
import SheetInspectionPage from './pages/employee/SheetInspectionPage';
import AdminResponsesPage from './pages/admin/AdminResponsesPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If allowedRoles is specified, check if user's role is in the allowed list
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user's role is not allowed
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

// Super Admin Route Component
const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    // Redirect based on role
    if (user.role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

// Placeholder pages for admin-only routes
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400">This feature is coming soon!</p>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Unified Login */}
      <Route 
        path="/"
        element={
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Redirect old superadmin login to unified login */}
      <Route path="/superadmin/login" element={<Navigate to="/login" replace />} />

      {/* Super Admin Routes */}
      <Route
        path="/superadmin"
        element={
          <SuperAdminRoute>
            <Layout isSuperAdmin />
          </SuperAdminRoute>
        }
      >
        <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="dealers" element={<DealerManagement />} />
        <Route path="plans" element={<SubscriptionPlans />} />
        <Route path="logs" element={<ActivityLogs />} />
        <Route path="messages" element={<Messages />} />
        <Route path="inbox" element={<MessageInbox />} />
      </Route>

      {/* Protected Routes */}
      <Route path="/employee/scanner" element={
        <ProtectedRoute allowedRoles={['employee', 'admin']}>
          <QRScannerPage />
        </ProtectedRoute>
      } />

      <Route
        path="/app"
        element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
        }
      >

        
        {/* All authenticated users can access dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Billing */}
        <Route path="billing" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Billing />
          </ProtectedRoute>
        } />
        
        {/* Employee profile with analytics - only for employees */}
        <Route path="employee-profile" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeProfile />
          </ProtectedRoute>
        } />
        
        {/* Admin and Employee can access products */}
        <Route path="products" element={
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <Products />
          </ProtectedRoute>
        } />
        
        {/* Admin and Employee can access invoices */}
        <Route path="invoices" element={
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <Invoices />
          </ProtectedRoute>
        } />
        
        {/* Refund Requests - accessible by all authenticated users */}
        <Route path="refund-requests" element={
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <RefundRequests />
          </ProtectedRoute>
        } />
        
        {/* Admin-only routes */}
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlaceholderPage title="User Management" />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlaceholderPage title="Settings" />
          </ProtectedRoute>
        } />
        <Route path="messages" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminMessages />
          </ProtectedRoute>
        } />
        <Route path="admin-employees" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminEmployees />
          </ProtectedRoute>
        } />
        <Route path="role-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RoleManagement />
          </ProtectedRoute>
        } />
         
         {/* Helmet Production System Routes */}
         <Route path="product-master" element={
           <ProtectedRoute allowedRoles={['admin']}>
             <ProductMaster />
           </ProtectedRoute>
         } />
         <Route path="qr-generator" element={
           <ProtectedRoute allowedRoles={['admin', 'employee']}>
             <QRGenerator />
           </ProtectedRoute>
         } />
         <Route path="manufacturing-config" element={
           <ProtectedRoute allowedRoles={['admin']}>
             <ManufacturingConfig />
           </ProtectedRoute>
         } />
         <Route path="operator" element={
           <ProtectedRoute allowedRoles={['admin', 'employee']}>
             <OperatorDashboard />
           </ProtectedRoute>
         } />
         <Route path="production-analytics" element={
           <ProtectedRoute allowedRoles={['admin']}>
             <Analytics />
           </ProtectedRoute>
         } />
         <Route path="admin/responses" element={
           <ProtectedRoute allowedRoles={['admin']}>
             <AdminResponsesPage />
           </ProtectedRoute>
         } />
         <Route path="admin/traceability/:id" element={
           <ProtectedRoute allowedRoles={['admin']}>
             <ProductTraceabilityPage admin />
           </ProtectedRoute>
         } />
         <Route path="employee" element={
           <ProtectedRoute allowedRoles={['employee', 'admin']}>
             <EmployeeDashboard />
           </ProtectedRoute>
         } />
         <Route path="employee/scanner" element={
           <ProtectedRoute allowedRoles={['employee', 'admin']}>
             <QRScannerPage />
           </ProtectedRoute>
         } />
         <Route path="employee/sheet-inspection" element={
           <ProtectedRoute allowedRoles={['employee', 'admin']}>
             <SheetInspectionPage />
           </ProtectedRoute>
         } />
         <Route path="employee/scan-logs" element={
           <ProtectedRoute allowedRoles={['employee', 'admin']}>
             <ScanLogsPage />
           </ProtectedRoute>
         } />
         <Route path="employee/traceability/:id" element={
           <ProtectedRoute allowedRoles={['employee', 'admin']}>
             <ProductTraceabilityPage />
           </ProtectedRoute>
         } />
        {/* Product Review Config (admin) */}
         <Route path="product-review-config/:stageId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProductReviewConfig />
          </ProtectedRoute>
        } />

        {/* Manufacturing stage -> product review (question preview/config) */}
        <Route path="manufacturing-config/stages/:stageNumber/product-review" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProductReviewConfig />
          </ProtectedRoute>
        } />
       </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <AppRoutes />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
