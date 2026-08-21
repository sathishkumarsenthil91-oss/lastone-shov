import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Student, 
  AttendanceRecord, 
  AttendanceStatus, 
  AttendanceDailySummary, 
  StaffMember,
  DepartmentCode 
} from '../../types';
import { 
  fetchAllocatedStudentsForStaff, 
  allocateStudentToStaff, 
  unallocateStudentFromStaff, 
  fetchAttendanceForDate, 
  saveAttendanceRecord, 
  saveBulkAttendance, 
  fetchAttendanceHistorySummaries,
  getTodayDateString,
  formatDateForDisplay,
  getAttendanceSqlSchema,
  INITIAL_STAFF_MEMBERS
} from '../../services/attendanceSupabaseService';
import { INITIAL_STUDENTS } from '../../data/mockData';
import { supabase } from '../../services/supabase';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCheck, 
  History, 
  FileSpreadsheet, 
  Download,
  Database, 
  Copy, 
  Check, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';

export const StaffAttendanceDashboard: React.FC = () => {
  const { user, addNotification } = useAuth();

  // Active Staff ID (defaults to logged-in user or first staff)
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    if (user?.role === 'STAFF' && user.id) return user.id;
    return 'u-staff-1';
  });

  // Current selected attendance date (defaults to today YYYY-MM-DD)
  const [attendanceDate, setAttendanceDate] = useState<string>(getTodayDateString());

  // Allocated students list for active staff
  const [allocatedStudents, setAllocatedStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(true);

  // Attendance records for the selected date
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(true);
  const [isSavingRecord, setIsSavingRecord] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'UNMARKED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // History & Summaries
  const [historySummaries, setHistorySummaries] = useState<AttendanceDailySummary[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Allocation Management Modal
  const [showAllocationModal, setShowAllocationModal] = useState<boolean>(false);
  const [allocationSearch, setAllocationSearch] = useState<string>('');
  const [allocationDeptFilter, setAllocationDeptFilter] = useState<string>('ALL');

  // SQL Schema & Health Modal
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'CHECKING' | 'LOCAL_ACTIVE'>('CONNECTED');

  // Active staff details
  const activeStaff: StaffMember = useMemo(() => {
    const found = INITIAL_STAFF_MEMBERS.find(s => s.id === selectedStaffId);
    if (found) return found;
    return {
      id: selectedStaffId,
      name: user?.name || 'Staff Proctor',
      email: user?.email || 'staff@avsct.edu.in',
      departmentCode: 'CSE',
      designation: user?.designation || 'Staff Incharge',
      phoneNumber: user?.phoneNumber || '+91 98765 00000',
      avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
    };
  }, [selectedStaffId, user]);

  // ==========================================================================
  // LOAD DATA FROM SUPABASE
  // ==========================================================================

  // 1. Load allocated students
  const loadAllocatedStudents = async (staffId: string) => {
    setIsLoadingStudents(true);
    try {
      const students = await fetchAllocatedStudentsForStaff(staffId);
      setAllocatedStudents(students);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // 2. Load attendance records for current staff & date
  const loadAttendanceForDate = async (staffId: string, dateStr: string) => {
    setIsLoadingAttendance(true);
    try {
      const records = await fetchAttendanceForDate(staffId, dateStr);
      setAttendanceRecords(records);
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // 3. Load history summaries
  const loadHistory = async (staffId: string, count: number) => {
    try {
      const summaries = await fetchAttendanceHistorySummaries(staffId, count);
      setHistorySummaries(summaries);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Initial load and sync on staff change or date change
  useEffect(() => {
    loadAllocatedStudents(selectedStaffId);
  }, [selectedStaffId]);

  useEffect(() => {
    loadAttendanceForDate(selectedStaffId, attendanceDate);
    loadHistory(selectedStaffId, allocatedStudents.length);
  }, [selectedStaffId, attendanceDate, allocatedStudents.length]);

  // Real-time Supabase subscription for attendance & allocations
  useEffect(() => {
    const channel = supabase
      .channel(`realtime_staff_attendance_${selectedStaffId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          loadAttendanceForDate(selectedStaffId, attendanceDate);
          loadHistory(selectedStaffId, allocatedStudents.length);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff_student_allocation' },
        () => {
          loadAllocatedStudents(selectedStaffId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStaffId, attendanceDate, allocatedStudents.length]);

  // ==========================================================================
  // STATS & METRICS
  // ==========================================================================

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach(r => map.set(r.studentId, r));
    return map;
  }, [attendanceRecords]);

  const stats = useMemo(() => {
    const total = allocatedStudents.length;
    let present = 0;
    let absent = 0;

    allocatedStudents.forEach(st => {
      const record = attendanceMap.get(st.id);
      if (record?.status === 'Present') present++;
      else if (record?.status === 'Absent') absent++;
    });

    const marked = present + absent;
    const unmarked = Math.max(0, total - marked);
    const percentage = marked > 0 ? Math.round((present / marked) * 100) : 0;

    return { total, present, absent, unmarked, marked, percentage };
  }, [allocatedStudents, attendanceMap]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return allocatedStudents.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.studentIdNumber && student.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        student.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const record = attendanceMap.get(student.id);
      if (statusFilter === 'PRESENT') return record?.status === 'Present';
      if (statusFilter === 'ABSENT') return record?.status === 'Absent';
      if (statusFilter === 'UNMARKED') return !record || !record.status;

      return true;
    });
  }, [allocatedStudents, searchQuery, statusFilter, attendanceMap]);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  // Mark single student attendance
  const handleMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
    setIsSavingRecord(studentId);
    try {
      const result = await saveAttendanceRecord({
        studentId,
        staffId: selectedStaffId,
        attendanceDate,
        status
      });

      if (result.success && result.record) {
        setAttendanceRecords(prev => {
          const filtered = prev.filter(r => r.studentId !== studentId);
          return [...filtered, result.record!];
        });
        addNotification('Attendance Recorded', `Student marked as ${status.toUpperCase()} for ${attendanceDate}.`, 'success');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      addNotification('Error', 'Failed to record attendance to Supabase.', 'error');
    } finally {
      setIsSavingRecord(null);
    }
  };

  // Bulk mark all allocated students
  const handleBulkMark = async (status: AttendanceStatus) => {
    if (allocatedStudents.length === 0) return;
    const studentIds = allocatedStudents.map(s => s.id);
    setIsLoadingAttendance(true);

    try {
      const result = await saveBulkAttendance({
        staffId: selectedStaffId,
        attendanceDate,
        studentIds,
        status
      });

      if (result.success) {
        await loadAttendanceForDate(selectedStaffId, attendanceDate);
        addNotification(
          'Bulk Attendance Updated',
          `All ${result.updatedCount} allocated students marked as ${status.toUpperCase()} for ${attendanceDate}.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Bulk mark error:', err);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Allocate new student
  const handleAddAllocation = async (studentId: string) => {
    try {
      const res = await allocateStudentToStaff(selectedStaffId, studentId);
      if (res.success) {
        await loadAllocatedStudents(selectedStaffId);
        addNotification('Student Allocated', 'Student added to your personal attendance roster.', 'success');
      }
    } catch (err) {
      console.error('Add allocation error:', err);
    }
  };

  // Remove allocation
  const handleRemoveAllocation = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to unallocate ${studentName} from your roster?`)) return;
    try {
      const res = await unallocateStudentFromStaff(selectedStaffId, studentId);
      if (res.success) {
        setAllocatedStudents(prev => prev.filter(s => s.id !== studentId));
        addNotification('Allocation Removed', `${studentName} removed from roster.`, 'info');
      }
    } catch (err) {
      console.error('Remove allocation error:', err);
    }
  };

  // Copy SQL script to clipboard
  const handleCopySql = () => {
    navigator.clipboard.writeText(getAttendanceSqlSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    addNotification('SQL Copied', 'Supabase DDL and RLS script copied to clipboard.', 'success');
  };

  // Date shortcuts
  const handleSetDateOffset = (offsetDays: number) => {
    const curr = new Date(attendanceDate);
    curr.setDate(curr.getDate() + offsetDays);
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    setAttendanceDate(`${year}-${month}-${day}`);
  };

  const isToday = attendanceDate === getTodayDateString();

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Active Staff Context */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider font-mono">
                <UserCheck className="w-3.5 h-3.5" />
                <span>DAILY STUDENT ATTENDANCE PORTAL • SUPABASE REAL-TIME CLOUD</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>RLS ISOLATION ACTIVE</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Staff Attendance Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Strictly manage student rosters allocated to your supervision. Mark daily attendance, track previous historical records, and synchronize changes instantly with the Supabase database.
            </p>
          </div>

          {/* Staff Switcher for testing multiple faculty personas */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src={activeStaff.avatarUrl} 
                alt={activeStaff.name} 
                className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-400/60 shadow" 
              />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold block">
                  Active Staff Incharge
                </span>
                <span className="text-sm font-bold text-white block">
                  {activeStaff.name}
                </span>
                <span className="text-xs text-slate-300 block">
                  {activeStaff.designation} ({activeStaff.departmentCode})
                </span>
              </div>
            </div>

            {/* Quick Switch Persona Dropdown */}
            <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Switch Staff Persona
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full sm:w-auto text-xs bg-slate-900/90 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {INITIAL_STAFF_MEMBERS.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.departmentCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Date Navigation & Primary Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Date Picker & Navigation */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={() => handleSetDateOffset(-1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="text-xs sm:text-sm font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleSetDateOffset(1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAttendanceDate(getTodayDateString())}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isToday
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Today {isToday && '• LIVE'}
          </button>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            ({formatDateForDisplay(attendanceDate)})
          </span>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <button
            onClick={() => setShowAllocationModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Allocations ({allocatedStudents.length})</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Records</span>
          </button>

          <button
            onClick={() => setShowSqlModal(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title="Database Schema & SQL"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 3. Live Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Allocated */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Allocated Students
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Present Count */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Present Today
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats.present}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Absent Count */}
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
              Absent Today
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {stats.absent}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Unmarked / Pending */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Unmarked / Pending
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {stats.unmarked}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Turnout Rate
            </span>
            <span className="text-xs font-black text-emerald-400 font-mono">
              {stats.marked}/{stats.total} MARKED
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">
                {stats.percentage}%
              </span>
              <span className="text-[10px] text-slate-400">
                {stats.present} of {stats.total}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* 4. Search, Batch Actions & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, reg no, dept..."
            className="w-full text-xs font-medium pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({allocatedStudents.length})
          </button>
          <button
            onClick={() => setStatusFilter('PRESENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'PRESENT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            Present ({stats.present})
          </button>
          <button
            onClick={() => setStatusFilter('ABSENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ABSENT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
            }`}
          >
            Absent ({stats.absent})
          </button>
          <button
            onClick={() => setStatusFilter('UNMARKED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'UNMARKED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
            }`}
          >
            Unmarked ({stats.unmarked})
          </button>
        </div>

        {/* Batch Operations */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={() => handleBulkMark('Present')}
            disabled={isLoadingAttendance || allocatedStudents.length === 0}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={() => handleBulkMark('Absent')}
            disabled={isLoadingAttendance || allocatedStudents.length === 0}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Mark All Absent</span>
          </button>
        </div>

      </div>

      {/* 5. Allocated Students List / Grid */}
      {isLoadingStudents ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Loading your allocated students from Supabase...
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {allocatedStudents.length === 0 ? 'No Students Allocated Yet' : 'No Students Match Current Filter'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {allocatedStudents.length === 0 
                ? 'You currently have no students assigned to your roster. Click "Manage Allocations" to add students.'
                : 'Try adjusting your search criteria or resetting the status filters.'}
            </p>
          </div>
          {allocatedStudents.length === 0 && (
            <button
              onClick={() => setShowAllocationModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Allocate Students to Your Roster</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, index) => {
            const record = attendanceMap.get(student.id);
            const status = record?.status;
            const isSaving = isSavingRecord === student.id;

            return (
              <div 
                key={student.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-sm relative overflow-hidden flex flex-col justify-between ${
                  status === 'Present'
                    ? 'border-emerald-300 dark:border-emerald-800/80 shadow-emerald-500/5'
                    : status === 'Absent'
                    ? 'border-rose-300 dark:border-rose-800/80 shadow-rose-500/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  status === 'Present'
                    ? 'bg-emerald-500'
                    : status === 'Absent'
                    ? 'bg-rose-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`} />

                <div>
                  {/* Top Card Details */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={student.photoUrl} 
                        alt={student.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                      <div>
                        <span className="text-xs font-mono font-black text-slate-500 dark:text-slate-400 block">
                          {student.registerNumber} • {student.studentIdNumber || 'ID-001'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {student.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          {student.departmentName} (Yr {student.year || 3})
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {status === 'Present' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-black font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PRESENT</span>
                        </span>
                      ) : status === 'Absent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[11px] font-black font-mono">
                          <XCircle className="w-3 h-3" />
                          <span>ABSENT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold font-mono">
                          <Clock className="w-3 h-3" />
                          <span>UNMARKED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student Details Meta */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Course</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                        {student.course || 'B.E. Computer Science'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Blood Group / Contact</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        {student.bloodGroup || 'O+'} • {student.phoneNumber?.slice(-5) || '43210'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Attendance Selection Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* PRESENT BUTTON */}
                    <button
                      onClick={() => handleMarkAttendance(student.id, 'Present')}
                      disabled={isSaving}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        status === 'Present'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{status === 'Present' ? 'Present ✓' : 'Mark Present'}</span>
                    </button>

                    {/* ABSENT BUTTON */}
                    <button
                      onClick={() => handleMarkAttendance(student.id, 'Absent')}
                      disabled={isSaving}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        status === 'Absent'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{status === 'Absent' ? 'Absent ✕' : 'Mark Absent'}</span>
                    </button>
                  </div>

                  {/* Last updated timestamp or notes */}
                  {record?.updatedAt && (
                    <div className="text-[10px] text-slate-400 font-mono text-center">
                      Updated: {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL: ALLOCATION MANAGEMENT (Assign / Deallocate Students) */}
      {/* ===================================================================== */}
      {showAllocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Student Allocation Manager</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate students from the college master directory to {activeStaff.name} ({activeStaff.departmentCode}).
                </p>
              </div>
              <button 
                onClick={() => setShowAllocationModal(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={allocationSearch}
                  onChange={(e) => setAllocationSearch(e.target.value)}
                  placeholder="Search students to assign..."
                  className="w-full text-xs font-medium pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 uppercase">Dept:</span>
                {['ALL', 'CSE', 'IT', 'AIDS'].map(dept => (
                  <button
                    key={dept}
                    onClick={() => setAllocationDeptFilter(dept)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      allocationDeptFilter === dept
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Master Student List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              <div className="space-y-2">
                {INITIAL_STUDENTS
                  .filter(st => {
                    const matchesSearch = 
                      st.name.toLowerCase().includes(allocationSearch.toLowerCase()) ||
                      st.registerNumber.toLowerCase().includes(allocationSearch.toLowerCase()) ||
                      st.departmentName.toLowerCase().includes(allocationSearch.toLowerCase());

                    if (!matchesSearch) return false;

                    if (allocationDeptFilter !== 'ALL') {
                      const deptCode = st.departmentId?.replace('dept-', '').toUpperCase();
                      if (deptCode !== allocationDeptFilter) return false;
                    }

                    return true;
                  })
                  .map(st => {
                    const isAllocated = allocatedStudents.some(s => s.id === st.id);

                    return (
                      <div 
                        key={st.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
                          isAllocated
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={st.photoUrl} 
                            alt={st.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" 
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {st.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                                {st.registerNumber}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {st.departmentName} • Year {st.year || 3} • {st.collegeEmail}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isAllocated ? (
                            <button
                              onClick={() => handleRemoveAllocation(st.id, st.name)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Unallocate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddAllocation(st.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Allocate</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
                Currently Allocated: {allocatedStudents.length} Students
              </span>
              <button
                onClick={() => setShowAllocationModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black cursor-pointer shadow"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. MODAL: PAST ATTENDANCE RECORDS & HISTORY */}
      {/* ===================================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <span>Attendance History & Archives</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select any previous date to inspect and edit saved attendance records.
                </p>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Daily List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {historySummaries.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No previous attendance records recorded yet.
                </div>
              ) : (
                historySummaries.map(summary => (
                  <div
                    key={summary.date}
                    onClick={() => {
                      setAttendanceDate(summary.date);
                      setShowHistoryModal(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      summary.date === attendanceDate
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatDateForDisplay(summary.date)}
                        </span>
                        {summary.date === getTodayDateString() && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-black font-mono">
                            TODAY
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                        Date: {summary.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                          {summary.presentCount} Present • {summary.absentCount} Absent
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {summary.attendancePercentage}% Attendance Rate
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black cursor-pointer shadow"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. MODAL: SUPABASE SQL DDL & RLS POLICIES */}
      {/* ===================================================================== */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <span>Supabase Schema & RLS Security Policies</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tables: `attendance`, `staff_student_allocation` with unique constraints and foreign key relationships.
                </p>
              </div>
              <button 
                onClick={() => setShowSqlModal(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SQL Script Viewer */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{getAttendanceSqlSchema()}</pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Copy and run in Supabase SQL Editor if creating custom database triggers.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
