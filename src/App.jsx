import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import Layout from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Products = lazy(() => import('./pages/Products'));
const Billing = lazy(() => import('./pages/Billing'));
const Invoices = lazy(() => import('./pages/Invoices'));
const RefundRequests = lazy(() => import('./pages/RefundRequests'));
const Reports = lazy(() => import('./pages/Reports'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));
const DealerManagement = lazy(() => import('./pages/DealerManagement'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Messages = lazy(() => import('./pages/Messages'));
const MessageInbox = lazy(() => import('./pages/Inbox'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
const AdminEmployees = lazy(() => import('./pages/AdminEmployees'));
const RoleManagement = lazy(() => import('./pages/RoleManagement'));
const EmployeeProfile = lazy(() => import('./pages/EmployeeProfile'));
const ProductMaster = lazy(() => import('./pages/ProductMaster'));
const QRGenerator = lazy(() => import('./pages/QRGenerator'));
const ManufacturingConfig = lazy(() => import('./pages/ManufacturingConfig'));
const OperatorDashboard = lazy(() => import('./pages/OperatorDashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ProductReviewConfig = lazy(() => import('./pages/ProductReviewConfig'));
const InspectorVerification = lazy(() => import('./pages/InspectorVerification'));
const InspectorManagement = lazy(() => import('./pages/InspectorManagement'));
const QRScannerPage = lazy(() => import('./pages/employee/QRScannerPage'));
const FinalInspectionPage = lazy(() => import('./pages/employee/FinalInspectionPage'));
const ScanLogsPage = lazy(() => import('./pages/employee/ScanLogsPage'));
const ProductTraceabilityPage = lazy(() => import('./pages/employee/ProductTraceabilityPage'));
const AdminResponsesPage = lazy(() => import('./pages/admin/AdminResponsesPage'));
const Attendance = lazy(() => import('./pages/Attendance'));

const PageLoader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
  </div>
);

const defaultPathForUser = (user) => {
  if (user?.role === 'superadmin') return '/superadmin/dashboard';
  if (user?.role === 'inspector') return '/app/inspector-verification';
  if (user?.role === 'employee') return '/app/employee/scanner';
  return '/app/dashboard';
};

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
    return <Navigate to={defaultPathForUser(user)} replace />;
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
    return <Navigate to={defaultPathForUser(user)} replace />;
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

const EmployeeIndexRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={defaultPathForUser(user)} replace />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <ProtectedRoute allowedRoles={['employee', 'inspector', 'admin']}>
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
        <Route path="admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Billing */}
        <Route path="billing" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Billing />
          </ProtectedRoute>
        } />
        
        {/* Employee profile with analytics - only for employees */}
        <Route path="employee-profile" element={
          <ProtectedRoute allowedRoles={['employee', 'inspector']}>
            <EmployeeProfile />
          </ProtectedRoute>
        } />
        
        {/* Admin and Employee can access products */}
        <Route path="products" element={
          <ProtectedRoute allowedRoles={['admin', 'employee', 'inspector']}>
            <Products />
          </ProtectedRoute>
        } />
        
        {/* Admin and Employee can access invoices */}
        <Route path="invoices" element={
          <ProtectedRoute allowedRoles={['admin', 'employee', 'inspector']}>
            <Invoices />
          </ProtectedRoute>
        } />
        
        {/* Refund Requests - accessible by all authenticated users */}
        <Route path="refund-requests" element={
          <ProtectedRoute allowedRoles={['admin', 'employee', 'inspector']}>
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
           <ProtectedRoute allowedRoles={['admin', 'employee', 'inspector']}>
             <QRGenerator />
           </ProtectedRoute>
         } />
         <Route path="manufacturing-config" element={
           <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
             <ManufacturingConfig />
           </ProtectedRoute>
         } />
         <Route path="operator" element={
           <ProtectedRoute allowedRoles={['admin', 'employee', 'inspector']}>
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
         <Route path="attendance" element={
           <ProtectedRoute allowedRoles={['admin', 'employee', 'inspector']}>
             <Attendance />
           </ProtectedRoute>
         } />
         <Route path="inspector-management" element={
           <ProtectedRoute allowedRoles={['admin']}>
             <InspectorManagement />
           </ProtectedRoute>
         } />
         <Route path="admin/traceability/:id" element={
           <ProtectedRoute allowedRoles={['admin']}>
             <ProductTraceabilityPage admin />
           </ProtectedRoute>
         } />
         <Route path="employee" element={
           <ProtectedRoute allowedRoles={['employee', 'inspector', 'admin']}>
             <EmployeeIndexRedirect />
           </ProtectedRoute>
         } />
         <Route path="employee/scanner" element={
           <ProtectedRoute allowedRoles={['employee', 'inspector', 'admin']}>
             <QRScannerPage />
           </ProtectedRoute>
         } />
          <Route path="employee/scan-logs" element={
            <ProtectedRoute allowedRoles={['employee', 'inspector', 'admin']}>
              <ScanLogsPage />
            </ProtectedRoute>
          } />
          <Route path="employee/final-inspection" element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <FinalInspectionPage />
            </ProtectedRoute>
          } />
         <Route path="inspector-verification" element={
           <ProtectedRoute allowedRoles={['inspector', 'admin']}>
             <InspectorVerification />
           </ProtectedRoute>
         } />
         <Route path="inspector-verification/scan-logs" element={
           <ProtectedRoute allowedRoles={['inspector', 'admin']}>
             <InspectorVerification initialTab="logs" />
           </ProtectedRoute>
         } />
         <Route path="employee/traceability/:id" element={
           <ProtectedRoute allowedRoles={['employee', 'inspector', 'admin']}>
             <ProductTraceabilityPage />
           </ProtectedRoute>
         } />
        {/* Product Review Config (admin) */}
         <Route path="product-review-config/:stageId" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ProductReviewConfig />
          </ProtectedRoute>
        } />

        {/* Manufacturing stage -> product review (question preview/config) */}
        <Route path="manufacturing-config/stages/:stageNumber/product-review/:configurationMode?" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ProductReviewConfig />
          </ProtectedRoute>
        } />
       </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
