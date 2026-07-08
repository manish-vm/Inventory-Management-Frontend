import { useState, useEffect } from 'react';
import { 
  User, 
  Mail,
  ShieldCheck,
  Badge,
  Loader2
} from 'lucide-react';
import { employeeAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await employeeAPI.getEmployeeProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const employee = profileData?.employee || profileData?.user || profileData || {};
  const displayName = employee.name || employee.username || user?.name || user?.username || 'User';
  const email = employee.email || user?.email || 'No email provided';
  const role = employee.role || user?.role || 'employee';
  const phone = employee.phone || employee.mobile || user?.phone || '';
  const employeeId = employee.employeeId || employee.code || employee._id || user?._id || '';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {displayName}.</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white/15 text-3xl font-bold text-white ring-1 ring-white/30">
              {initial}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{displayName}</h2>
              <p className="mt-1 capitalize text-blue-100">{role}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{email}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Role</p>
                <p className="text-sm font-medium capitalize text-slate-900 dark:text-white">{role}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-violet-600 dark:text-violet-300" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Name</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{displayName}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Badge className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">ID</p>
                <p className="break-all text-sm font-medium text-slate-900 dark:text-white">{employeeId || 'Not assigned'}</p>
              </div>
            </div>
          </div>
          {phone && (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Phone</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{phone}</p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use the scanner page to continue inspection and production workflows.</p>
        <div className="mt-4">
          <Link
            to="/app/employee/scanner"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Open QR Scanner
          </Link>
        </div>
      </section>
    </div>
  );
};

export default EmployeeProfile;
