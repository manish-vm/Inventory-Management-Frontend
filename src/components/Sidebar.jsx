import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Boxes
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { refundRequestAPI, productAPI } from '../api/api';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isSuperAdmin }) => {
  const { user, logout, isAdmin, isCustomer, isSuperAdmin: isSA, isEmployee } = useAuth();
  const { theme } = useTheme();
  const [pendingRefundCount, setPendingRefundCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const { isCollapsed, setIsCollapsed } = useSidebar();

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
    { path: '/superadmin/dealers', icon: Store, label: 'Dealer Management' },
    { path: '/superadmin/plans', icon: FileText, label: 'Subscription Plans' },
    { path: '/superadmin/logs', icon: BarChart3, label: 'Activity Logs' },
  ];

  // Admin gets full access
  const adminNavItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/billing', icon: ShoppingCart, label: 'Billing / POS' },
    { path: '/app/products', icon: Package, label: 'Products' },
    { path: '/app/invoices', icon: Receipt, label: 'Invoices' },
    { path: '/app/refund-requests', icon: RefreshCcw, label: 'Refund Requests', badge: pendingRefundCount },
    { path: '/app/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/app/customers', icon: Users, label: 'Customers' },
    { path: '/app/admin-employees', icon: Users, label: 'Employees' },
    { path: '/app/reports', icon: BarChart3, label: 'Reports' },
    { path: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  // Low Stock Alert - separate item for admins
  const lowStockNavItem = { 
    path: '/products?lowStock=true', 
    icon: AlertTriangle, 
    label: 'Low Stock Alerts', 
    badge: lowStockCount,
    isAlert: true 
  };

  // Customer gets billing, products (read-only), invoices
  const customerNavItems = [
    { path: '/app/dashboard', icon: User, label: 'My Profile' },
    { path: '/app/billing', icon: ShoppingCart, label: 'Billing / POS' },
    { path: '/app/products', icon: Package, label: 'Products' },
    { path: '/app/invoices', icon: Receipt, label: 'Invoices' },
    { path: '/app/refund-requests', icon: RefreshCcw, label: 'My Refunds' },
  ];

  // Employee gets profile with analytics, products (read-only), invoices
  const employeeNavItems = [
    { path: '/app/employee-profile', icon: User, label: 'My Profile' },
    { path: '/app/products', icon: Package, label: 'Products' },
    { path: '/app/invoices', icon: Receipt, label: 'Invoices' },
    { path: '/app/refund-requests', icon: RefreshCcw, label: 'My Refunds' },
  ];

  let navItems;
  if (isSuperAdminView) {
    navItems = superAdminNavItems;
  } else if (isAdmin) {
    navItems = adminNavItems;
  } else if (isEmployee) {
    navItems = employeeNavItems;
  } else {
    navItems = customerNavItems;
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
        fixed left-0 top-0 h-screen flex flex-col z-50
        bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 lg:px-6 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center shadow-glow text-white drop-shadow-sm">
              <Boxes className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
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
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 text-surface-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-r-full" />
                  )}
                  <item.icon className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-surface-900'} drop-shadow-sm flex-shrink-0 group-hover:scale-110 transition-all`} />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
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
            <button
              onClick={() => {
                import('./CategoryManager').then((module) => {
                  const event = new CustomEvent('openCategoryManager');
                  window.dispatchEvent(event);
                });
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-200 cursor-pointer w-full group"
            >
              <Package className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-surface-900'} drop-shadow-sm flex-shrink-0 group-hover:scale-110 transition-all`} />
              <span className="font-medium text-sm">Manage Categories</span>
            </button>
          )}

          {/* Low Stock Alert - Only show for admins when there are low stock items */}
          {isAdmin && lowStockCount > 0 && (
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
          )}
        </nav>

        {/* User Info & Theme Toggle */}
        <div className="p-4 border-t border-surface-100 dark:border-surface-800">
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center shadow-soft flex-shrink-0 text-white drop-shadow-sm">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 dark:text-surface-100 text-sm truncate">
                    {user?.name || user?.username}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor()}`}>
                    {user?.role}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {!isCollapsed && (
            <>
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
            </>
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
    </>
  );
};

export default Sidebar;

