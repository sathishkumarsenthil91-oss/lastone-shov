import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentAttendanceStats, AttendanceRecord } from '../../types';
import { 
  fetchStudentAttendanceStats, 
  formatDateForDisplay,
  getClassCoordinatorAssignment 
} from '../../services/attendanceSupabaseService';
import { supabase } from '../../services/supabase';
import { 
  CalendarCheck, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  GraduationCap, 
  FileText, 
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';

interface StudentAttendanceSectionProps {
  studentIdOrReg?: string;
}

export const StudentAttendanceSection: React.FC<StudentAttendanceSectionProps> = ({ 
  studentIdOrReg 
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentAttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Present' | 'Absent' | 'Leave'>('ALL');

  const targetIdentifier = studentIdOrReg || user?.studentId || user?.username || 'STU-10001';

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStudentAttendanceStats(targetIdentifier);
      setStats(data);
    } catch (err) {
      console.error('Failed to load student attendance stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Listen to local attendance updates from CC actions
    const handleUpdate = () => {
      loadStats();
    };

    window.addEventListener('shov_attendance_updated', handleUpdate);

    // Realtime Supabase channel
    const channel = supabase
      .channel(`realtime_student_attendance_${targetIdentifier}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('shov_attendance_updated', handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [targetIdentifier]);

  const coordinator = stats ? getClassCoordinatorAssignment(stats.departmentCode) : null;

  const filteredRecords = (stats?.records || []).filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>PRESENT</span>
        </span>
      );
    }
    if (s === 'leave') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>LEAVE (EXCUSED)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-black font-mono">
        <XCircle className="w-3.5 h-3.5" />
        <span>ABSENT</span>
      </span>
    );
  };

  const getAttendanceHealthBadge = (percentage: number) => {
    if (percentage >= 85) {
      return {
        label: 'EXEMPLARY ATTENDANCE',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        desc: 'Eligible for all Anna University & Autonomous Semester End Examinations without condonation.'
      };
    }
    if (percentage >= 75) {
      return {
        label: 'SATISFACTORY COMPLIANCE',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        desc: 'Meets minimum attendance requirement of 75% for regular exam admission.'
      };
    }
    if (percentage >= 65) {
      return {
        label: 'ATTENDANCE SHORTAGE WARNING',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        desc: 'Requires medical certificate / Class Coordinator condonation approval to sit for exams.'
      };
    }
    return {
      label: 'CRITICAL SHORTAGE - DETAINED RISK',
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      desc: 'Immediate consultation with Class Coordinator and Department HOD required.'
    };
  };

  if (isLoading && !stats) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Loading live attendance records and Class Coordinator details...
        </p>
      </div>
    );
  }

  const health = getAttendanceHealthBadge(stats?.attendancePercentage || 0);

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO: CLASS COORDINATOR CONNECTION */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Left: CC Overview */}
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black uppercase tracking-wider font-mono">
              <Building2 className="w-3.5 h-3.5" />
              <span>OFFICIAL CLASS COORDINATOR (CC) CONNECTION</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {stats?.coordinatorName || 'Prof. R. Swaminathan'}
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Assigned Faculty Mentor & Class In-charge for <strong className="text-white">{stats?.departmentName || 'Computer Science and Engineering'}</strong> (Year {stats?.year || 3}, Section {stats?.section || 'A'}).
            </p>

            {/* Coordinator Contact Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a 
                href={`mailto:${stats?.coordinatorEmail || coordinator?.staffEmail || 'coordinator@avsct.edu.in'}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{stats?.coordinatorEmail || coordinator?.staffEmail}</span>
              </a>

              <a 
                href={`tel:${stats?.coordinatorPhone || coordinator?.staffPhone || '+919876599011'}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{stats?.coordinatorPhone || coordinator?.staffPhone}</span>
              </a>

              {coordinator?.roomNumber && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{coordinator.roomNumber}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Action Pill */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2 text-center lg:text-left">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">
              Office Consultation Hours
            </span>
            <p className="text-xs font-semibold text-white">
              {coordinator?.officeHours || 'Mon - Fri: 09:30 AM - 10:30 AM & 03:30 PM - 04:30 PM'}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">Cohort:</span>
              <span className="font-mono font-bold text-indigo-300">{stats?.departmentCode} • Year {stats?.year} Sec {stats?.section}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. ATTENDANCE ANALYTICS & STATS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance Percentage Main Tile */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Attendance %
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${health.color}`}>
              {health.label}
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {stats?.attendancePercentage.toFixed(1)}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {stats?.presentDays} / {stats?.totalWorkingDays} Days
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  (stats?.attendancePercentage || 0) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, stats?.attendancePercentage || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Present Days */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Present Days
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats?.presentDays || 0}
            </span>
            <span className="text-[10px] text-emerald-600/80 mt-1 block">
              Regular class turnout
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Absent Days */}
        <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
              Absent Days
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {stats?.absentDays || 0}
            </span>
            <span className="text-[10px] text-rose-600/80 mt-1 block">
              Unexcused sessions
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        {/* Leave (Excused) Days */}
        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Approved Leave
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {stats?.leaveDays || 0}
            </span>
            <span className="text-[10px] text-amber-600/80 mt-1 block">
              Medical / On-Duty Leave
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. ATTENDANCE FORMULA & POLICY NOTICE */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <p className="font-bold">
            Live Attendance Computation Formula & Academic Rules:
          </p>
          <p>
            <span className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded font-semibold">Attendance % = (Present Days / Total Working Days) × 100</span>. Approved Leave is tracked separately in your permanent record and is <em>not</em> counted as Present to ensure strict audit compliance.
          </p>
        </div>
      </div>

      {/* 4. DAY-BY-DAY ATTENDANCE HISTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-500" />
              <span>Day-by-Day Attendance History</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live synchronized attendance log verified by your Class Coordinator
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All ({stats?.records.length || 0})
            </button>
            <button
              onClick={() => setFilterStatus('Present')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'Present'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              Present ({stats?.presentDays || 0})
            </button>
            <button
              onClick={() => setFilterStatus('Absent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'Absent'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
              }`}
            >
              Absent ({stats?.absentDays || 0})
            </button>
            <button
              onClick={() => setFilterStatus('Leave')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'Leave'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
              }`}
            >
              Leave ({stats?.leaveDays || 0})
            </button>
          </div>
        </div>

        {/* Table Records */}
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No attendance records found for this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Working Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Class / Section</th>
                  <th className="px-6 py-3.5">Marked By Coordinator</th>
                  <th className="px-6 py-3.5">Notes & Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatDateForDisplay(rec.attendanceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rec.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {rec.departmentCode || stats?.departmentCode} • Year {rec.year || stats?.year} (Sec {rec.section || stats?.section || 'A'})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold">
                      {stats?.coordinatorName || 'Class Coordinator'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {rec.notes || 'Routine attendance logged'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
