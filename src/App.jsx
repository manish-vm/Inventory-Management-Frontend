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
import AdminCustomers from './pages/AdminCustomers';
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
import EmployeeProfile from './pages/EmployeeProfile';

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
        
        {/* Only Admin and Customer can access billing (employees cannot purchase) */}
        <Route path="billing" element={
          <ProtectedRoute allowedRoles={['admin', 'customer']}>
            <Billing />
          </ProtectedRoute>
        } />
        
        {/* Employee profile with analytics - only for employees */}
        <Route path="employee-profile" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeProfile />
          </ProtectedRoute>
        } />
        
        {/* Admin and Customer/Employee can access products (read-only for customer/employee) */}
        <Route path="products" element={
          <ProtectedRoute allowedRoles={['admin', 'customer', 'employee']}>
            <Products />
          </ProtectedRoute>
        } />
        
        {/* Admin and Customer/Employee can access invoices */}
        <Route path="invoices" element={
          <ProtectedRoute allowedRoles={['admin', 'customer', 'employee']}>
            <Invoices />
          </ProtectedRoute>
        } />
        
        {/* Refund Requests - accessible by all authenticated users */}
        <Route path="refund-requests" element={
          <ProtectedRoute allowedRoles={['admin', 'customer', 'employee']}>
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
        <Route path="customers" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCustomers />
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

