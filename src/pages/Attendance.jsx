import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, LogIn, LogOut, RefreshCw, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { attendanceAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const statusPillClasses = {
  'checked-in': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'checked-out': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  absent: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
};

const ATTENDANCE_TIMEZONE = 'Asia/Kolkata';

const todayString = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ATTENDANCE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .formatToParts(new Date())
    .reduce((acc, part) => {
      if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const formatExportDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN');
};

const employeeStatusMeta = {
  checkedIn: {
    label: 'Checked In',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    card: 'from-emerald-500 via-green-500 to-teal-500',
    accent: 'text-emerald-600 dark:text-emerald-300'
  },
  checkedOut: {
    label: 'Checked Out',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    card: 'from-rose-500 via-red-500 to-orange-500',
    accent: 'text-rose-600 dark:text-rose-300'
  }
};

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  const [date, setDate] = useState(todayString());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendance, setAttendance] = useState(null);
  const [overview, setOverview] = useState({ summary: null, rows: [] });
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const loadEmployeeAttendance = async (selectedDate = date) => {
    const response = await attendanceAPI.getMyAttendance({ date: selectedDate });
    setAttendance(response.data.attendance);
  };

  const loadAdminOverview = async (selectedDate = date, nextFilters = filters) => {
    const response = await attendanceAPI.getAdminOverview({
      date: selectedDate,
      search: nextFilters.search || undefined,
      status: nextFilters.status || undefined
    });
    setOverview(response.data);
  };

  const loadData = async (selectedDate = date, nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      if (isAdmin) {
        await loadAdminOverview(selectedDate, nextFilters);
      } else {
        await loadEmployeeAttendance(selectedDate);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  useEffect(() => {
    if (!date) return;
    loadData(date, filters);
  }, [date]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError('');
      const response = await attendanceAPI.checkIn();
      setAttendance(response.data.attendance);
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError('');
      const response = await attendanceAPI.checkOut();
      setAttendance(response.data.attendance);
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    await loadData(date, filters);
  };

  const handleExportExcel = () => {
    if (!isAdmin || !overview.rows.length) return;

    const exportRows = overview.rows.map((row) => ({
      User: row.name,
      Email: row.email || '-',
      Phone: row.phone || '-',
      Role: row.role,
      Status: row.status,
      'First Check-In': formatExportDate(row.firstCheckIn),
      'Last Check-Out': formatExportDate(row.lastCheckOut),
      Sessions: row.sessionsCount,
      'Worked Hours': row.totalHoursFormatted
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `attendance-${date}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Management</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isAdmin ? 'Track team attendance and worked hours.' : 'Check in, check out, and review your daily working hours.'}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="button"
            onClick={() => loadData(date, filters)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={!overview.rows.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Export Excel
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          {success}
        </div>
      )}

      {isAdmin ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{overview.summary?.totalUsers || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Checked In</p>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">{overview.summary?.checkedInCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Checked Out</p>
              <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{overview.summary?.checkedOutCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Worked Hours</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{overview.summary?.totalHoursFormatted || '0h 0m'}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr,180px,auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by name, email, or phone"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="absent">Absent</option>
              </select>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-white transition hover:from-blue-700 hover:to-purple-700"
              >
                Apply Filter
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400">Loading attendance...</div>
            ) : overview.rows.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                <Users className="h-10 w-10" />
                <p>No attendance records found for {date}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">First Check-In</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Last Check-Out</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Sessions</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Worked Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {overview.rows.map((row) => (
                      <tr key={row.userId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{row.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{row.email || row.phone || '-'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize text-slate-700 dark:text-slate-300">{row.role}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClasses[row.status] || statusPillClasses.absent}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{formatDateTime(row.firstCheckIn)}</td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{formatDateTime(row.lastCheckOut)}</td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.sessionsCount}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.totalHoursFormatted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${attendance?.isCheckedIn ? employeeStatusMeta.checkedIn.badge : employeeStatusMeta.checkedOut.badge}`}>
                  {attendance?.isCheckedIn ? employeeStatusMeta.checkedIn.label : employeeStatusMeta.checkedOut.label}
                </span>
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Overview</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Track your worked time and current attendance state for today.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Today Worked</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{attendance?.totalHoursFormatted || '0h 0m'}</p>
                </div>
                <div className={`rounded-2xl border p-4 ${attendance?.isCheckedIn ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/40 dark:bg-emerald-900/15' : 'border-rose-200 bg-rose-50/90 dark:border-rose-900/40 dark:bg-rose-900/15'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${attendance?.isCheckedIn ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>Current Status</p>
                  <p className={`mt-3 text-2xl font-bold ${attendance?.isCheckedIn ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {attendance?.isCheckedIn ? employeeStatusMeta.checkedIn.label : employeeStatusMeta.checkedOut.label}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border-2 border-primary-200 bg-gradient-to-br from-white via-blue-50/50 to-slate-50 p-6 shadow-sm dark:border-primary-800/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-300">Mark Attendance</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Start or end your work session</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    This is the main action area. Check in when work starts and check out when it ends.
                  </p>
                </div>
                <div className={`hidden rounded-2xl px-3 py-2 text-xs font-semibold lg:block ${attendance?.isCheckedIn ? employeeStatusMeta.checkedIn.badge : employeeStatusMeta.checkedOut.badge}`}>
                  {attendance?.isCheckedIn ? 'Active Session' : 'No Active Session'}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={actionLoading || attendance?.isCheckedIn}
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogIn className="h-4 w-4" />
                  Check In
                </button>
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={actionLoading || !attendance?.isCheckedIn}
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  Check Out
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Rule:</span> only one active session can stay open at a time, and all completed sessions are added cumulatively.
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                <Clock3 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daily Sessions</h2>
            </div>
            {loading ? (
              <div className="flex h-40 items-center justify-center text-slate-500 dark:text-slate-400">Loading attendance...</div>
            ) : !attendance ? (
              <div className="flex h-40 items-center justify-center text-slate-500 dark:text-slate-400">
                No attendance marked for {date} yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-700/30">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">First Check-In</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{formatDateTime(attendance.firstCheckIn)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-700/30">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Last Check-Out</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{formatDateTime(attendance.lastCheckOut)}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Total Worked</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{attendance.totalHoursFormatted}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Session</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Check-In</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Check-Out</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {attendance.sessions.map((session, index) => (
                        <tr key={session.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/20">
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                              Session {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatDateTime(session.checkIn)}</td>
                          <td className={`px-4 py-3 ${session.checkOut ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                            {formatDateTime(session.checkOut)}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{session.durationFormatted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
