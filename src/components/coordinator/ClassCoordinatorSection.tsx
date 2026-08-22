import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Student, 
  AttendanceRecord, 
  AttendanceStatus, 
  AttendanceDailySummary,
  DepartmentCode,
  ClassCoordinator
} from '../../types';
import { 
  fetchAllocatedStudentsForStaff, 
  fetchAttendanceForDate, 
  saveAttendanceRecord, 
  saveBulkAttendance, 
  fetchAttendanceHistorySummaries,
  getTodayDateString,
  formatDateForDisplay,
  getClassCoordinatorAssignment
} from '../../services/attendanceSupabaseService';
import { supabase } from '../../services/supabase';
import { RoleLiveVerifiedBadge } from '../common/RoleLiveVerifiedBadge';
import { GatePassRequest } from '../student/CampusGatePassSection';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Building2, 
  User, 
  Calendar, 
  FileText, 
  Check, 
  X, 
  AlertTriangle,
  QrCode,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Users,
  UserCheck,
  UserX,
  CheckCheck,
  RefreshCw,
  Download,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  TrendingUp,
  MapPin
} from 'lucide-react';

const INITIAL_GATE_PASSES: GatePassRequest[] = [
  {
    id: 'GP-2026-0891',
    studentId: 'STU-10001',
    studentName: 'Rohit Kumar',
    registerNumber: '23CS101',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    studentEmail: 'rohit.kumar@avsct.edu.in',
    phoneNumber: '+91 98765 43210',
    curfewTime: '08:30 PM IST',
    outTime: '04:30 PM',
    expectedReturnTime: '08:30 PM',
    reason: 'PROJECT_FIELDWORK',
    reasonText: 'Hardware component procurement for Smart India Hackathon IoT prototype',
    note: 'Parent notified: Mr. Kumar (+91 98765 00112). Granted approval for local hardware market visit.',
    assignedCoordinatorName: 'Prof. R. Swaminathan',
    assignedCoordinatorEmail: 'swaminathan.cc.cse@avsct.edu.in',
    status: 'APPROVED',
    ccRemark: 'Approved for Salem electronics hub visit. Must return strictly before 08:30 PM curfew.',
    approvedAt: 'Today, 03:45 PM',
    passToken: 'AVSCT-GP-SECURE-99482-PASS',
    createdAt: 'Today, 02:15 PM'
  },
  {
    id: 'GP-2026-0894',
    studentId: 'STU-10002',
    studentName: 'Priya Dharshini',
    registerNumber: '23CS102',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    studentEmail: 'priya.24cs@avsct.edu.in',
    phoneNumber: '+91 98765 43211',
    curfewTime: '07:30 PM IST',
    outTime: '03:00 PM',
    expectedReturnTime: '07:30 PM',
    reason: 'MEDICAL',
    reasonText: 'Routine dental consultation and checkup at Salem Town Clinic',
    note: 'Parent acknowledged by phone (+91 98765 11223). Expected return before 07:30 PM.',
    assignedCoordinatorName: 'Prof. R. Swaminathan',
    assignedCoordinatorEmail: 'swaminathan.cc.cse@avsct.edu.in',
    status: 'PENDING_CC_APPROVAL',
    createdAt: '15 mins ago'
  }
];

export const ClassCoordinatorSection: React.FC = () => {
  const { user, addNotification } = useAuth();

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'attendance' | 'cohort' | 'gatepasses' | 'history'>('attendance');

  // Identify coordinator's department code
  const currentDeptCode: DepartmentCode = useMemo(() => {
    if (user?.departmentCode) return user.departmentCode as DepartmentCode;
    const deptStr = (user?.departmentName || user?.department || 'CSE').toUpperCase();
    if (deptStr.includes('CSE') || deptStr.includes('COMPUTER')) return 'CSE';
    if (deptStr.includes('IT') || deptStr.includes('INFORMATION')) return 'IT';
    if (deptStr.includes('ECE') || deptStr.includes('ELECTRONICS AND COMM')) return 'ECE';
    if (deptStr.includes('AIDS') || deptStr.includes('ARTIFICIAL')) return 'AIDS';
    if (deptStr.includes('EEE') || deptStr.includes('ELECTRICAL')) return 'EEE';
    if (deptStr.includes('MECH')) return 'MECH';
    if (deptStr.includes('AGRI')) return 'AGRI';
    return 'CSE';
  }, [user]);

  // Coordinator Details
  const coordinatorInfo: ClassCoordinator = useMemo(() => {
    return getClassCoordinatorAssignment(currentDeptCode);
  }, [currentDeptCode]);

  // Attendance states
  const [attendanceDate, setAttendanceDate] = useState<string>(getTodayDateString());
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(true);
  const [isSavingStudentId, setIsSavingStudentId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Present' | 'Absent' | 'Leave' | 'UNMARKED'>('ALL');

  // Gate Passes State
  const [passes, setPasses] = useState<GatePassRequest[]>(() => {
    try {
      const saved = localStorage.getItem('avs_gate_passes');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_GATE_PASSES;
  });

  const [passFilter, setPassFilter] = useState<'ALL' | 'PENDING_CC_APPROVAL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedPass, setSelectedPass] = useState<GatePassRequest | null>(null);
  const [remarkInput, setRemarkInput] = useState<string>('');
  const [isProcessingPass, setIsProcessingPass] = useState<boolean>(false);

  // History state
  const [historySummaries, setHistorySummaries] = useState<AttendanceDailySummary[]>([]);

  // Load students for coordinator's own department
  const loadCohortStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const cohort = await fetchAllocatedStudentsForStaff(user?.id || 'u-staff-1', currentDeptCode);
      setStudents(cohort);
    } catch (err) {
      console.error('Failed to load cohort students:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Load attendance records for current date & department
  const loadCohortAttendance = async (dateStr: string) => {
    setIsLoadingAttendance(true);
    try {
      const records = await fetchAttendanceForDate(user?.id || 'u-staff-1', dateStr, currentDeptCode);
      setAttendanceRecords(records);
    } catch (err) {
      console.error('Failed to load cohort attendance:', err);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Load past history summaries
  const loadHistory = async () => {
    try {
      const summaries = await fetchAttendanceHistorySummaries(user?.id || 'u-staff-1', students.length);
      setHistorySummaries(summaries);
    } catch (err) {
      console.error('Failed to load history summaries:', err);
    }
  };

  useEffect(() => {
    loadCohortStudents();
  }, [currentDeptCode, user?.id]);

  useEffect(() => {
    loadCohortAttendance(attendanceDate);
    loadHistory();
  }, [attendanceDate, currentDeptCode, user?.id, students.length]);

  // Realtime Supabase listener
  useEffect(() => {
    const channel = supabase
      .channel(`realtime_coordinator_${currentDeptCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          loadCohortAttendance(attendanceDate);
          loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDeptCode, attendanceDate]);

  // Sync passes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('avs_gate_passes', JSON.stringify(passes));
    } catch {
      // ignore
    }
  }, [passes]);

  // Map of studentId -> AttendanceRecord
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach(r => map.set(r.studentId, r));
    return map;
  }, [attendanceRecords]);

  // Live Stats Calculation
  const stats = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let leave = 0;

    students.forEach(s => {
      const rec = attendanceMap.get(s.id);
      if (rec?.status === 'Present') present++;
      else if (rec?.status === 'Absent') absent++;
      else if (rec?.status === 'Leave') leave++;
    });

    const marked = present + absent + leave;
    const unmarked = Math.max(0, total - marked);
    // Strict compliance formula: Leave is NOT counted as Present
    const percentage = marked > 0 ? Math.round((present / marked) * 100) : 0;

    return { total, present, absent, leave, unmarked, marked, percentage };
  }, [students, attendanceMap]);

  // Filtered students for attendance view
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.registerNumber.toLowerCase().includes(q) ||
        (student.studentIdNumber && student.studentIdNumber.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const record = attendanceMap.get(student.id);
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'UNMARKED') return !record || !record.status;
      return record?.status?.toLowerCase() === statusFilter.toLowerCase();
    });
  }, [students, searchQuery, statusFilter, attendanceMap]);

  // Filtered passes for this department
  const filteredPasses = passes.filter(p => {
    const deptMatch = p.departmentCode === currentDeptCode || p.department.toLowerCase().includes(currentDeptCode.toLowerCase());
    const statusMatch = passFilter === 'ALL' || p.status === passFilter;
    return deptMatch && statusMatch;
  });

  const pendingPassesCount = passes.filter(p => 
    p.status === 'PENDING_CC_APPROVAL' && 
    (p.departmentCode === currentDeptCode || p.department.toLowerCase().includes(currentDeptCode.toLowerCase()))
  ).length;

  // Single Student Attendance Marking
  const handleMark = async (studentId: string, status: AttendanceStatus) => {
    setIsSavingStudentId(studentId);
    try {
      const res = await saveAttendanceRecord({
        studentId,
        staffId: user?.id || 'u-staff-1',
        departmentCode: currentDeptCode,
        year: coordinatorInfo.year,
        section: coordinatorInfo.section,
        attendanceDate,
        status,
        notes: `Recorded by CC ${coordinatorInfo.staffName}`
      });

      if (res.success && res.record) {
        setAttendanceRecords(prev => {
          const filtered = prev.filter(r => r.studentId !== studentId);
          return [...filtered, res.record!];
        });
        addNotification('Attendance Recorded', `Student marked as ${status.toUpperCase()} for ${attendanceDate}.`, 'success');
      }
    } catch (err) {
      console.error('Failed to save record:', err);
      addNotification('Error', 'Could not record attendance to database.', 'error');
    } finally {
      setIsSavingStudentId(null);
    }
  };

  // Bulk Attendance Marking
  const handleBulkMark = async (status: AttendanceStatus) => {
    if (students.length === 0) return;
    setIsLoadingAttendance(true);
    try {
      const studentIds = students.map(s => s.id);
      const res = await saveBulkAttendance({
        staffId: user?.id || 'u-staff-1',
        departmentCode: currentDeptCode,
        year: coordinatorInfo.year,
        section: coordinatorInfo.section,
        attendanceDate,
        studentIds,
        status
      });

      if (res.success) {
        await loadCohortAttendance(attendanceDate);
        addNotification(
          'Cohort Attendance Recorded', 
          `All ${res.updatedCount} students in ${currentDeptCode} marked as ${status.toUpperCase()}.`, 
          'success'
        );
      }
    } catch (err) {
      console.error('Bulk attendance error:', err);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Gate Pass Approval
  const handleApprovePass = (pass: GatePassRequest) => {
    setIsProcessingPass(true);
    const remark = remarkInput.trim() || 'Approved by Class Coordinator. Please adhere to college curfew time.';
    
    setTimeout(() => {
      setPasses(prev => prev.map(p => {
        if (p.id === pass.id) {
          return {
            ...p,
            status: 'APPROVED',
            ccRemark: remark,
            approvedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            passToken: `AVSCT-GP-${Math.floor(10000 + Math.random() * 90000)}`
          };
        }
        return p;
      }));
      setIsProcessingPass(false);
      setSelectedPass(null);
      setRemarkInput('');
      addNotification('Pass Approved', `Gate access pass ${pass.id} approved for ${pass.studentName}.`, 'success');
    }, 300);
  };

  // Gate Pass Rejection
  const handleRejectPass = (pass: GatePassRequest) => {
    if (!remarkInput.trim()) {
      addNotification('Reason Required', 'Please enter a brief remark explaining why the pass is declined.', 'warning');
      return;
    }

    setIsProcessingPass(true);
    setTimeout(() => {
      setPasses(prev => prev.map(p => {
        if (p.id === pass.id) {
          return {
            ...p,
            status: 'REJECTED',
            ccRemark: remarkInput.trim(),
            rejectedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return p;
      }));
      setIsProcessingPass(false);
      setSelectedPass(null);
      setRemarkInput('');
      addNotification('Pass Rejected', `Gate pass request ${pass.id} declined.`, 'info');
    }, 300);
  };

  // Export Daily CSV Register
  const handleExportCsv = () => {
    if (students.length === 0) {
      addNotification('Export Notice', 'No students available in this cohort.', 'warning');
      return;
    }

    const headers = [
      'Register Number',
      'Student Name',
      'Department',
      'Year',
      'Section',
      'Attendance Date',
      'Attendance Status',
      'Class Coordinator',
      'Export Timestamp'
    ];

    const rows = students.map(st => {
      const rec = attendanceMap.get(st.id);
      return [
        st.registerNumber,
        `"${st.name}"`,
        currentDeptCode,
        coordinatorInfo.year,
        coordinatorInfo.section,
        attendanceDate,
        rec?.status || 'Unmarked',
        `"${coordinatorInfo.staffName}"`,
        new Date().toISOString()
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AVSCT_${currentDeptCode}_Attendance_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification('Attendance Exported', `CSV attendance sheet generated for ${attendanceDate}.`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HERO BANNER: CLASS COORDINATOR WORKSPACE */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black uppercase tracking-wider font-mono">
                <Building2 className="w-3.5 h-3.5" />
                <span>CLASS COORDINATOR (CC) DESK • {currentDeptCode} DEPARTMENT</span>
              </div>
              <RoleLiveVerifiedBadge role="STAFF" size="sm" customLabel={`CC - ${currentDeptCode}`} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span>{coordinatorInfo.staffName}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono font-bold">
                Year {coordinatorInfo.year} • Sec {coordinatorInfo.section}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Department of <strong className="text-white">{coordinatorInfo.departmentName}</strong> • Office: <strong className="text-white">{coordinatorInfo.roomNumber}</strong> • Phone: <strong className="text-white">{coordinatorInfo.staffPhone}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Assigned Cohort</span>
              <span className="text-lg font-black text-indigo-400 font-mono">{students.length} Students</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Today's Turnout</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{stats.percentage}%</span>
            </div>
            {pendingPassesCount > 0 && (
              <button
                onClick={() => setActiveTab('gatepasses')}
                className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-center min-w-[100px] cursor-pointer hover:bg-amber-500/30 transition-all"
              >
                <span className="text-[10px] text-amber-300 uppercase font-bold block">Pending Passes</span>
                <span className="text-lg font-black text-amber-400 font-mono">{pendingPassesCount} Urgent</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Daily Roll Call & Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('cohort')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'cohort'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>My Class Cohort Roster ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gatepasses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'gatepasses'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Gate Pass Approvals {pendingPassesCount > 0 && `(${pendingPassesCount})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Attendance Registers & Past Logs</span>
        </button>
      </div>

      {/* 3. TAB CONTENT WORKSPACES */}

      {/* TAB 1: DAILY ROLL CALL & ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Date Selector & Export */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Date Picker */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label htmlFor="cc-att-date-picker" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date:</label>
              <input
                id="cc-att-date-picker"
                aria-label="Attendance Date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-xs font-mono font-bold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              <button
                onClick={() => setAttendanceDate(getTodayDateString())}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  attendanceDate === getTodayDateString()
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Today {attendanceDate === getTodayDateString() && '• LIVE'}
              </button>
            </div>

            {/* Quick Export & Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Daily CSV</span>
              </button>
            </div>

          </div>

          {/* Live Metrics Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* Total In Class */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cohort Strength</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{stats.total}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Present */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Present</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.present}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Absent */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Absent</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{stats.absent}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
            </div>

            {/* Approved Leave */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Approved Leave</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{stats.leave}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Turnout Percentage */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Turnout %</span>
                <span className="text-xs font-black text-emerald-400 font-mono">{stats.marked}/{stats.total} MARKED</span>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-mono">{stats.percentage}%</span>
                  <span className="text-[10px] text-slate-400">{stats.present} of {stats.marked || stats.total}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${stats.percentage}%` }} />
                </div>
              </div>
            </div>

          </div>

          {/* Search, Filter Pills & Bulk Action Buttons */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name or reg no..."
                className="w-full text-xs font-medium pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All ({students.length})
              </button>
              <button
                onClick={() => setStatusFilter('Present')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'Present'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                Present ({stats.present})
              </button>
              <button
                onClick={() => setStatusFilter('Absent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'Absent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                }`}
              >
                Absent ({stats.absent})
              </button>
              <button
                onClick={() => setStatusFilter('Leave')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'Leave'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                }`}
              >
                Leave ({stats.leave})
              </button>
              <button
                onClick={() => setStatusFilter('UNMARKED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'UNMARKED'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Unmarked ({stats.unmarked})
              </button>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => handleBulkMark('Present')}
                disabled={isLoadingAttendance || students.length === 0}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={() => handleBulkMark('Absent')}
                disabled={isLoadingAttendance || students.length === 0}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mark All Absent</span>
              </button>
            </div>

          </div>

          {/* Student Cards / Roll-Call Grid */}
          {isLoadingStudents ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Loading students for {currentDeptCode} cohort...
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                No students match your filter
              </h3>
              <p className="text-xs text-slate-500">
                Try resetting your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => {
                const record = attendanceMap.get(student.id);
                const status = record?.status;
                const isSaving = isSavingStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-sm relative overflow-hidden flex flex-col justify-between ${
                      status === 'Present'
                        ? 'border-emerald-300 dark:border-emerald-800/80 shadow-emerald-500/5'
                        : status === 'Absent'
                        ? 'border-rose-300 dark:border-rose-800/80 shadow-rose-500/5'
                        : status === 'Leave'
                        ? 'border-amber-300 dark:border-amber-800/80 shadow-amber-500/5'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Status Border Strip */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 ${
                        status === 'Present'
                          ? 'bg-emerald-500'
                          : status === 'Absent'
                          ? 'bg-rose-500'
                          : status === 'Leave'
                          ? 'bg-amber-500'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />

                    <div>
                      {/* Student Info Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                          />
                          <div>
                            <span className="text-xs font-mono font-black text-slate-500 dark:text-slate-400 block">
                              {student.registerNumber}
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
                          ) : status === 'Leave' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[11px] font-black font-mono">
                              <Clock className="w-3 h-3" />
                              <span>LEAVE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold font-mono">
                              <Clock className="w-3 h-3" />
                              <span>UNMARKED</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contact & Parent Meta */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Phone</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                            {student.phoneNumber || '+91 98765 00000'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Parent / Emergency</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                            {student.emergencyContact || '+91 98765 00112'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3 Explicit Attendance State Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        
                        {/* PRESENT */}
                        <button
                          onClick={() => handleMark(student.id, 'Present')}
                          disabled={isSaving}
                          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        {/* ABSENT */}
                        <button
                          onClick={() => handleMark(student.id, 'Absent')}
                          disabled={isSaving}
                          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        {/* LEAVE */}
                        <button
                          onClick={() => handleMark(student.id, 'Leave')}
                          disabled={isSaving}
                          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            status === 'Leave'
                              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Leave</span>
                        </button>

                      </div>

                      {record?.updatedAt && (
                        <div className="text-[10px] text-slate-400 font-mono text-center pt-1">
                          Saved: {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: COHORT ROSTER */}
      {activeTab === 'cohort' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Class Cohort Student Roster</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Students registered under {currentDeptCode} • Year {coordinatorInfo.year} • Section {coordinatorInfo.section}
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Roster</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Register No</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Emergency Contact</th>
                  <th className="px-4 py-3">Blood Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img src={st.photoUrl} alt={st.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{st.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{st.collegeEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{st.registerNumber}</td>
                    <td className="px-4 py-3">{currentDeptCode}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{st.course || 'B.E. Engineering'}</td>
                    <td className="px-4 py-3">{st.phoneNumber}</td>
                    <td className="px-4 py-3 text-slate-500">{st.emergencyContact}</td>
                    <td className="px-4 py-3 font-bold text-rose-500">{st.bloodGroup || 'O+'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GATE PASS APPROVALS */}
      {activeTab === 'gatepasses' && (
        <div className="space-y-4">
          
          {/* Header & Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Student Gate Pass Approval Desk
              </h3>
              <p className="text-xs text-slate-500">
                Verify and approve outpass requests for {currentDeptCode} students
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPassFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  passFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                All ({passes.length})
              </button>
              <button
                onClick={() => setPassFilter('PENDING_CC_APPROVAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  passFilter === 'PENDING_CC_APPROVAL' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700'
                }`}
              >
                Pending ({pendingPassesCount})
              </button>
              <button
                onClick={() => setPassFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  passFilter === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'
                }`}
              >
                Approved
              </button>
            </div>
          </div>

          {/* Gate Pass Cards */}
          {filteredPasses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                No Gate Passes Under This Filter
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPasses.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 block">{p.id}</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.studentName} ({p.registerNumber})</h4>
                      <span className="text-[11px] text-slate-500">{p.reasonText}</span>
                    </div>
                    <div>
                      {p.status === 'APPROVED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">APPROVED</span>
                      ) : p.status === 'PENDING_CC_APPROVAL' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black">PENDING CC</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black">REJECTED</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Out Time: <strong>{p.outTime}</strong></span>
                      <span>Return By: <strong>{p.expectedReturnTime}</strong></span>
                    </div>
                    {p.note && <p className="text-slate-600 dark:text-slate-400 italic pt-1">{p.note}</p>}
                  </div>

                  {p.status === 'PENDING_CC_APPROVAL' && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <input
                        type="text"
                        placeholder="Coordinator approval remarks / reason..."
                        value={selectedPass?.id === p.id ? remarkInput : ''}
                        onChange={(e) => {
                          setSelectedPass(p);
                          setRemarkInput(e.target.value);
                        }}
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleApprovePass(p)}
                          disabled={isProcessingPass}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Approve Gate Pass
                        </button>
                        <button
                          onClick={() => handleRejectPass(p)}
                          disabled={isProcessingPass}
                          className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Decline Pass
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 4: ATTENDANCE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Attendance Log Summaries & Daily Turnout</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Archived working session records for {currentDeptCode} cohort
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {historySummaries.map((sum) => (
              <div key={sum.date} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {formatDateForDisplay(sum.date)}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {sum.attendancePercentage}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px] text-center">
                  <div className="p-1.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold">
                    {sum.presentCount} Pres
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-100/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold">
                    {sum.absentCount} Abs
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold">
                    {sum.leaveCount || 0} Leave
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
