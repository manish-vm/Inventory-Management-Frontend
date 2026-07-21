import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Receipt,
  User,
  RefreshCcw,
  Shield,
  Store,
  FileText,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  Boxes,
  QrCode,
  Workflow,
  Scan,
  PieChart,
  UserCheck,
  ClipboardCheck,
  Clock3,
  ShieldCheck
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { refundRequestAPI, productAPI } from '../api/api';
import ThemeToggle from './ThemeToggle';
import BrandModelManager from './BrandModelManager';
import DefectDetailManager from './DefectDetailManager';

const Sidebar = ({ isSuperAdmin }) => {
  const { user, logout, isAdmin, isSuperAdmin: isSA, isEmployee } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  console.log('[Sidebar] user:', user);
  const [pendingRefundCount, setPendingRefundCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [brandModelOpen, setBrandModelOpen] = useState(false);
  const [defectDetailOpen, setDefectDetailOpen] = useState(false);

  // Check if it's superadmin from prop or context
  const isSuperAdminView = isSuperAdmin || isSA;

  useEffect(() => {
    if (isAdmin) {
      fetchPendingCount();
      fetchLowStockCount();
    }
  }, [isAdmin]);

  const fetchPendingCount = async () => {
    try {
      const response = await refundRequestAPI.getPendingCount();
      setPendingRefundCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch pending refund count:', error);
    }
  };

  const fetchLowStockCount = async () => {
    try {
      const response = await productAPI.getLowStock();
      setLowStockCount(response.data.length || 0);
    } catch (error) {
      console.error('Failed to fetch low stock count:', error);
    }
  };

  // Super Admin Navigation
  const superAdminNavItems = [
    { path: '/superadmin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/superadmin/admins', icon: Shield, label: 'Admin Management' },
    { path: '/superadmin/dealers', icon: Store, label: 'Vendor Management' },
    { path: '/superadmin/plans', icon: FileText, label: 'Subscription Plans' },
    { path: '/superadmin/logs', icon: BarChart3, label: 'Activity Logs' },
  ];

  {/* Admin gets full access */}
  const adminNavItems = [
    { path: '/app/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Report Management' },
    { path: '/app/inspector-management', icon: ClipboardCheck, label: 'Inspector Management' },
    { path: '/app/products', icon: Package, label: 'Products' },
    { path: '/app/manufacturing-config', icon: Workflow, label: 'Manufacturing Config' },
    { path: '/app/qr-generator', icon: QrCode, label: 'QR Generator' },
    // { path: '/app/invoices', icon: Receipt, label: 'Invoices' },
    // { path: '/app/refund-requests', icon: RefreshCcw, label: 'Refund Requests', badge: pendingRefundCount },
    // { path: '/app/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/app/admin-employees', icon: Users, label: 'Employees' },
    { path: '/app/attendance', icon: Clock3, label: 'Attendance' },
    { path: '/app/role-management', icon: UserCheck, label: 'Role Management' },
    { path: '/app/admin/responses', icon: FileText, label: 'Responses' },
    // { path: '/app/reports', icon: BarChart3, label: 'Reports' },
    // { path: '/app/settings', icon: Settings, label: 'Settings' },
    // Helmet Production System
    // { path: '/app/product-master', icon: Package, label: 'Product Master' },
    // { path: '/app/operator', icon: Scan, label: 'Operator Dashboard' },
    { path: '/app/production-analytics', icon: PieChart, label: 'Analytics' },
  ];


  // Low Stock Alert - separate item for admins
  const lowStockNavItem = { 
    path: '/products?lowStock=true', 
    icon: AlertTriangle, 
    label: 'Low Stock Alerts', 
    badge: lowStockCount,
    isAlert: true 
  };
  // Employee gets profile with analytics, products (read-only), invoices, and production
  const employeeNavItems = [
    ...(user?.role === 'inspector' ? [] : [{ path: '/app/employee/scanner', icon: Scan, label: 'QR Scanner' }]),
    ...(user?.role === 'inspector' ? [
      { path: '/app/inspector-verification', icon: ClipboardCheck, label: 'Inspector Verification', end: true },
      { path: '/app/inspector-verification/scan-logs', icon: FileText, label: 'Scan Logs' },
    ] : [
      { path: '/app/employee/scan-logs', icon: FileText, label: 'Scan Logs' },
    ]),
    ...(user?.assignedFinalStageRole ? [{ path: '/app/employee/final-inspection', icon: ShieldCheck, label: 'Final Inspection' }] : []),
    { path: '/app/attendance', icon: Clock3, label: 'Attendance' },
    ...(user?.role === 'inspector' ? [] : [{ path: '/app/employee-profile', icon: LayoutDashboard, label: 'Profile' }]),
  ];

  let navItems;
  if (isSuperAdminView) {
    navItems = superAdminNavItems;
  } else if (isAdmin) {
    navItems = adminNavItems;
  } else if (isEmployee) {
    navItems = employeeNavItems;
  } else {
    navItems = [];
  }

  const getRoleBadgeColor = () => {
    if (isSuperAdminView) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    if (isAdmin) return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
    if (isEmployee) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300';
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div className="lg:hidden fixed inset-0 z-40 bg-surface-900/50 backdrop-blur-sm hidden" />
      
      <aside className={`
        fixed left-0 top-0 h-screen flex flex-col z-50 overflow-visible
        bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700
        transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        {/* Logo */}
        <div className={`relative h-20 flex items-center border-b border-surface-100 dark:border-surface-800 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4 lg:px-6'
        }`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center shadow-glow text-white drop-shadow-sm">
              <Boxes className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-slideIn">
                <h1 className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight">
                  Inventory<span className="text-gradient">Pro</span>
                </h1>
                <p className="text-[10px] text-surface-500 dark:text-surface-400 -mt-0.5">
                  Management System
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex shrink-0 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors ${
              isCollapsed ? 'absolute right-0 z-[70] translate-x-1/2 bg-white shadow-md ring-1 ring-surface-200 dark:bg-surface-900 dark:ring-surface-700' : ''
            }`}
          >
            <ChevronRight className={`w-4 h-4 text-surface-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end || item.path === '/app/employee' || item.path.endsWith('/dashboard')}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 group relative ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/25 dark:text-primary-300'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm'
                      : 'text-surface-900 dark:text-surface-100'
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  {!isCollapsed && (
                    <span className="animate-slideIn whitespace-nowrap font-medium text-sm">{item.label}</span>
                  )}
                  {item.badge > 0 && !isCollapsed && (
                    <span className="ml-auto bg-danger-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.badge > 0 && isCollapsed && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-danger-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          {/* Category Manager Button - Admin only */}
          {isAdmin && !isCollapsed && (
            <div className="space-y-1 animate-slideIn">
              <button
                onClick={() => {
                  import('./CategoryManager').then(() => {
                    const event = new CustomEvent('openCategoryManager');
                    window.dispatchEvent(event);
                  });
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-200 cursor-pointer w-full group"
              >
                <Package className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-surface-900'} drop-shadow-sm flex-shrink-0 group-hover:scale-110 transition-all`} />
                <span className="font-medium text-sm">Manage Categories</span>
              </button>

              {/* Brand/Model Manager */}
              <button
                onClick={() => setBrandModelOpen(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-200 cursor-pointer w-full group"
              >
                <Package className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-surface-900'} drop-shadow-sm flex-shrink-0 group-hover:scale-110 transition-all`} />
                <span className="font-medium text-sm">Manage Brand & Model</span>
              </button>

              <button
                onClick={() => setDefectDetailOpen(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-200 cursor-pointer w-full group"
              >
                <AlertTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-surface-900'} drop-shadow-sm flex-shrink-0 group-hover:scale-110 transition-all`} />
                <span className="font-medium text-sm">Manage Defect Details</span>
              </button>
            </div>
          )}

          {/* Low Stock Alert - Only show for admins when there are low stock items */}
          {/* {isAdmin && lowStockCount > 0 && (
            <NavLink
              to={lowStockNavItem.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400'
                    : 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                }`
              }
            >
              <AlertTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-surface-900'} drop-shadow-sm flex-shrink-0`} />
              {!isCollapsed && (
                <>
                  <span className="font-medium text-sm">Low Stock Alerts</span>
                  <span className="ml-auto bg-danger-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {lowStockCount}
                  </span>
                </>
              )}
            </NavLink>
          )} */}
        </nav>

        {/* User Info & Theme Toggle */}
        <div className="p-4 border-t border-surface-100 dark:border-surface-800">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => user?.role === 'inspector' && navigate('/app/employee-profile')}
              className={`flex items-center gap-3 rounded-lg text-left transition-colors ${
                isCollapsed ? 'justify-center w-full p-0' : 'w-full p-1 -m-1'
              } ${
                user?.role === 'inspector'
                  ? 'cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800'
                  : 'cursor-default'
              }`}
              aria-label={user?.role === 'inspector' ? 'Open inspector profile' : undefined}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center shadow-soft flex-shrink-0 text-white drop-shadow-sm">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-slideIn">
                  <p className="font-medium text-surface-900 dark:text-surface-100 text-sm truncate">
                    {user?.name || user?.username}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor()}`}>
                    {user?.role}
                  </span>
                </div>
              )}
            </button>
          </div>
          
          {!isCollapsed && (
            <div className="animate-slideIn">
              <div className="flex items-center justify-between mb-3">
                <ThemeToggle />
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all duration-200"
              >
                <LogOut className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-surface-900'} hover:text-danger-700 dark:hover:text-danger-300 drop-shadow-sm`} />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          )}

          {isCollapsed && (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle />
              <button
                onClick={logout}
                className="p-2.5 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all duration-200"
              >
                <LogOut className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-surface-900'} hover:text-danger-700 dark:hover:text-danger-300 drop-shadow-sm`} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Brand/Model Manager Modal */}
      {brandModelOpen && isAdmin && (
        <BrandModelManager onClose={() => setBrandModelOpen(false)} />
      )}

      {defectDetailOpen && isAdmin && (
        <DefectDetailManager onClose={() => setDefectDetailOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
