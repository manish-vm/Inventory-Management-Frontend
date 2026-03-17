import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import GlobalModals from './GlobalModals';
import AIChatbot from './AIChatbot';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useState } from 'react';
import { Search, Menu, X, Bell, User } from 'lucide-react';

const Layout = ({ isSuperAdmin }) => {
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Dashboard',
      '/billing': 'Billing / POS',
      '/products': 'Products',
      '/invoices': 'Invoices',
      '/refund-requests': 'Refund Requests',
      '/messages': 'Messages',
      '/customers': 'Customers',
      '/admin-employees': 'Employees',
      '/reports': 'Reports',
      '/settings': 'Settings',
      '/superadmin/dashboard': 'Super Admin Dashboard',
      '/superadmin/admins': 'Admin Management',
      '/superadmin/dealers': 'Dealer Management',
      '/superadmin/plans': 'Subscription Plans',
      '/superadmin/logs': 'Activity Logs',
    };
    return titles[path] || 'Inventory Pro';
  };

  return (
    <>
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <Sidebar isSuperAdmin={isSuperAdmin} />
      
      <main className={`min-h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Left side - Mobile menu button and page title */}
            <div className="flex items-center gap-4">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-surface-600 dark:text-surface-400" />
                ) : (
                  <Menu className="w-6 h-6 text-surface-600 dark:text-surface-400" />
                )}
              </button>
              
              {/* Page Title */}
              <div>
                <h1 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-surface-500 dark:text-surface-400 hidden sm:block">
                  Welcome back, {user?.name || user?.username}
                </p>
              </div>
            </div>

            {/* Center - Search Bar (hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search products, invoices, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Right side - Notifications and User */}
            <div className="flex items-center gap-3">
              {/* Quick Actions - Only for admins */}
              {/* {user?.role === 'admin' && (
                <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition-all duration-300">
                  <span>+ New Sale</span>
                </button>
              )} */}
              
              {/* Notification Bell */}
              <NotificationBell />
              
              {/* User Profile Dropdown */}
              {user && (
                <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-surface-200 dark:border-surface-700">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center shadow-soft text-white drop-shadow-sm">
                    <span className="text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                      {user.name || user.username}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <Outlet />
          <GlobalModals />
        </div>

      </main>
      <AIChatbot />
    </div>
    </>
  );
};

export default Layout;
