import { supabase } from './supabase';
import { 
  Student, 
  AttendanceRecord, 
  AttendanceStatus, 
  StaffStudentAllocation, 
  AttendanceDailySummary,
  StaffMember,
  DepartmentCode,
  StudentAttendanceStats,
  ClassCoordinatorAssignment 
} from '../types';
import { INITIAL_STUDENTS, INITIAL_USERS } from '../data/mockData';

// Initial pre-allocated staff list and class coordinators for all 7 departments
export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'u-staff-1',
    name: 'Prof. R. Swaminathan',
    email: 'swaminathan.cc.cse@avsct.edu.in',
    departmentCode: 'CSE',
    designation: 'Class Coordinator & Associate Professor',
    phoneNumber: '+91 98765 99011',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    isClassCoordinator: true,
    assignedYear: 3,
    assignedSection: 'A'
  },
  {
    id: 'u-staff-2',
    name: 'Prof. Anita Sharma',
    email: 'anita.sharma@faculty.avsct.edu.in',
    departmentCode: 'CSE',
    designation: 'Class Coordinator & Associate Professor',
    phoneNumber: '+91 98765 99002',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    isClassCoordinator: true,
    assignedYear: 3,
    assignedSection: 'B'
  },
  {
    id: 'u-staff-it',
    name: 'Prof. David Miller',
    email: 'david.miller@faculty.avsct.edu.in',
    departmentCode: 'IT',
    designation: 'Class Coordinator & Assistant Professor',
    phoneNumber: '+91 98765 99003',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    isClassCoordinator: true,
    assignedYear: 3,
    assignedSection: 'A'
  },
  {
    id: 'u-staff-ece',
    name: 'Dr. K. Venkatraman',
    email: 'venkatraman.ece@faculty.avsct.edu.in',
    departmentCode: 'ECE',
    designation: 'Class Coordinator & Associate Professor',
    phoneNumber: '+91 98765 99005',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    isClassCoordinator: true,
    assignedYear: 3,
    assignedSection: 'A'
  },
  {
    id: 'u-staff-aids',
    name: 'Prof. Sneha Kulkarni',
    email: 'sneha.k@faculty.avsct.edu.in',
    departmentCode: 'AIDS',
    designation: 'Class Coordinator & Assistant Professor',
    phoneNumber: '+91 98765 99004',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    isClassCoordinator: true,
    assignedYear: 2,
    assignedSection: 'A'
  },
  {
    id: 'u-staff-eee',
    name: 'Dr. M. Suresh',
    email: 'suresh.eee@faculty.avsct.edu.in',
    departmentCode: 'EEE',
    designation: 'Class Coordinator & Associate Professor',
    phoneNumber: '+91 98765 99006',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    isClassCoordinator: true,
    assignedYear: 3,
    assignedSection: 'A'
  },
  {
    id: 'u-staff-mech',
    name: 'Dr. S. Balasubramanian',
    email: 'bala.mech@faculty.avsct.edu.in',
    departmentCode: 'MECH',
    designation: 'Class Coordinator & Associate Professor',
    phoneNumber: '+91 98765 99007',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    isClassCoordinator: true,
    assignedYear: 3,
    assignedSection: 'A'
  },
  {
    id: 'u-staff-agri',
    name: 'Dr. P. Meenakshi',
    email: 'meenakshi.agri@faculty.avsct.edu.in',
    departmentCode: 'AGRI',
    designation: 'Class Coordinator & Associate Professor',
    phoneNumber: '+91 98765 99008',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    isClassCoordinator: true,
    assignedYear: 3,
    assignedSection: 'A'
  }
];

export const INITIAL_COORDINATOR_ASSIGNMENTS: ClassCoordinatorAssignment[] = [
  {
    staffId: 'u-staff-1',
    staffName: 'Prof. R. Swaminathan',
    staffEmail: 'swaminathan.cc.cse@avsct.edu.in',
    staffPhone: '+91 98765 99011',
    departmentCode: 'CSE',
    departmentName: 'Computer Science and Engineering',
    year: 3,
    section: 'A',
    roomNumber: 'CS-302 (Computing Block 3rd Floor)',
    officeHours: 'Mon - Fri: 09:30 AM - 10:30 AM & 03:30 PM - 04:30 PM'
  },
  {
    staffId: 'u-staff-2',
    staffName: 'Prof. Anita Sharma',
    staffEmail: 'anita.sharma@faculty.avsct.edu.in',
    staffPhone: '+91 98765 99002',
    departmentCode: 'CSE',
    departmentName: 'Computer Science and Engineering',
    year: 3,
    section: 'B',
    roomNumber: 'CS-304 (Computing Block 3rd Floor)',
    officeHours: 'Mon - Fri: 10:00 AM - 11:00 AM'
  },
  {
    staffId: 'u-staff-it',
    staffName: 'Prof. David Miller',
    staffEmail: 'david.miller@faculty.avsct.edu.in',
    staffPhone: '+91 98765 99003',
    departmentCode: 'IT',
    departmentName: 'Information Technology',
    year: 3,
    section: 'A',
    roomNumber: 'IT-201 (IT Block 2nd Floor)',
    officeHours: 'Mon - Fri: 02:00 PM - 03:30 PM'
  },
  {
    staffId: 'u-staff-ece',
    staffName: 'Dr. K. Venkatraman',
    staffEmail: 'venkatraman.ece@faculty.avsct.edu.in',
    staffPhone: '+91 98765 99005',
    departmentCode: 'ECE',
    departmentName: 'Electronics and Communication Engineering',
    year: 3,
    section: 'A',
    roomNumber: 'ECE-105 (Circuits Block)',
    officeHours: 'Mon - Fri: 11:00 AM - 12:30 PM'
  },
  {
    staffId: 'u-staff-aids',
    staffName: 'Prof. Sneha Kulkarni',
    staffEmail: 'sneha.k@faculty.avsct.edu.in',
    staffPhone: '+91 98765 99004',
    departmentCode: 'AIDS',
    departmentName: 'Artificial Intelligence and Data Science',
    year: 2,
    section: 'A',
    roomNumber: 'AI-204 (AI Innovation Center)',
    officeHours: 'Mon - Fri: 09:00 AM - 11:00 AM'
  },
  {
    staffId: 'u-staff-eee',
    staffName: 'Dr. M. Suresh',
    staffEmail: 'suresh.eee@faculty.avsct.edu.in',
    staffPhone: '+91 98765 99006',
    departmentCode: 'EEE',
    departmentName: 'Electrical and Electronics Engineering',
    year: 3,
    section: 'A',
    roomNumber: 'EEE-202 (Power Systems Block)',
    officeHours: 'Mon - Fri: 03:00 PM - 04:30 PM'
  },
  {
    staffId: 'u-staff-mech',
    staffName: 'Dr. S. Balasubramanian',
    staffEmail: 'bala.mech@faculty.avsct.edu.in',
    staffPhone: '+91 98765 99007',
    departmentCode: 'MECH',
    departmentName: 'Mechanical Engineering',
    year: 3,
    section: 'A',
    roomNumber: 'ME-102 (Mechanical Workshop Block)',
    officeHours: 'Mon - Fri: 01:30 PM - 03:00 PM'
  },
  {
    staffId: 'u-staff-agri',
    staffName: 'Dr. P. Meenakshi',
    staffEmail: 'meenakshi.agri@faculty.avsct.edu.in',
    staffPhone: '+91 98765 99008',
    departmentCode: 'AGRI',
    departmentName: 'Agricultural Engineering',
    year: 3,
    section: 'A',
    roomNumber: 'AG-101 (Agro Science Center)',
    officeHours: 'Mon - Fri: 10:00 AM - 12:00 PM'
  }
];

// Initial default seed allocations per staff/coordinator
const DEFAULT_SEED_ALLOCATIONS: Record<string, string[]> = {
  'u-staff-1': ['st-001', 'st-002', 'st-008'], // Marcus Vance / Swaminathan (CSE Year 3 Sec A)
  'u-staff-2': ['st-001', 'st-002'],          // Anita Sharma (CSE Year 3 Sec B)
  'u-staff-it': ['st-003', 'st-005'],         // David Miller (IT Year 3 Sec A)
  'u-staff-ece': ['st-ece-01', 'st-ece-02'],  // Venkatraman (ECE Year 3 Sec A)
  'u-staff-aids': ['st-004'],                 // Sneha Kulkarni (AIDS Year 2 Sec A)
  'u-staff-eee': ['st-eee-01'],               // Suresh (EEE Year 3 Sec A)
  'u-staff-mech': ['st-mech-01'],             // Balasubramanian (MECH Year 3 Sec A)
  'u-staff-agri': ['st-agri-01']              // Meenakshi (AGRI Year 3 Sec A)
};

const CACHE_KEYS = {
  ALLOCATIONS: 'shov_staff_student_allocations_v2',
  ATTENDANCE: 'shov_attendance_records_v2',
  COORDINATORS: 'shov_class_coordinators_v2'
};

function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading localStorage ${key}:`, e);
  }
  return fallback;
}

function setLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shov_attendance_updated', { detail: { key } }));
    }
  } catch (e) {
    console.warn(`Error writing localStorage ${key}:`, e);
  }
}

// Generate realistic past dates for attendance seeding
export function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(dateStr: string): string {
  try {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Seed baseline realistic attendance records across recent working days
function getInitialSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const pastDays = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]; // skips weekends approx

  INITIAL_STUDENTS.forEach(student => {
    const staffId = student.classCoordinatorId || 'u-staff-1';
    const deptCode = (student.departmentCode || 'CSE') as DepartmentCode;

    pastDays.forEach((daysAgo, idx) => {
      const dateStr = getPastDateString(daysAgo);
      let status: AttendanceStatus = 'Present';

      // Realistic attendance variation
      if (student.id === 'st-001') {
        // Rohit Kumar: 1 absent, 1 leave, rest present (~83%)
        if (idx === 3) status = 'Absent';
        else if (idx === 7) status = 'Leave';
        else status = 'Present';
      } else if (student.id === 'st-002') {
        // Priya: 100%
        status = 'Present';
      } else if (student.id === 'st-003') {
        // Rohan: 1 leave
        if (idx === 2) status = 'Leave';
        else status = 'Present';
      } else if (student.id === 'st-005') {
        // Vikram: 2 absent, 1 leave
        if (idx === 1 || idx === 6) status = 'Absent';
        else if (idx === 4) status = 'Leave';
        else status = 'Present';
      } else {
        if (idx % 6 === 5) status = 'Absent';
        else if (idx % 7 === 6) status = 'Leave';
        else status = 'Present';
      }

      records.push({
        id: `att-${student.id}-${dateStr}`,
        studentId: student.id,
        staffId,
        attendanceDate: dateStr,
        status,
        notes: status === 'Leave' ? 'Approved Medical / On-Duty Leave' : status === 'Absent' ? 'Unexcused absence' : 'Regular class attendance recorded',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studentName: student.name,
        registerNumber: student.registerNumber,
        departmentName: student.departmentName,
        departmentCode: deptCode,
        course: student.course,
        year: student.year,
        section: student.section || 'A',
        photoUrl: student.photoUrl
      });
    });
  });

  return records;
}

// ============================================================================
// 1. ALLOCATED STUDENTS & CLASS COORDINATOR QUERIES
// ============================================================================

/**
 * Fetch all students allocated to a specific staff member or class coordinator.
 * Restricts data strictly to the staff's department.
 */
export async function fetchAllocatedStudentsForStaff(
  staffId: string, 
  staffDepartmentCode?: string
): Promise<Student[]> {
  if (!staffId) return [];

  try {
    // 1. Query Supabase staff_student_allocation table
    const { data: allocations, error: allocError } = await supabase
      .from('staff_student_allocation')
      .select('id, staff_id, student_id, department_code, academic_year, allocated_at')
      .eq('staff_id', staffId);

    if (allocError) {
      console.warn('[Supabase Notice] Error fetching staff_student_allocation:', allocError.message);
    }

    let allocatedStudentIds: string[] = [];

    if (allocations && allocations.length > 0) {
      allocatedStudentIds = allocations.map((a: any) => a.student_id);
    } else {
      // Check local cache
      const cached = getLocalCache<Record<string, string[]>>(CACHE_KEYS.ALLOCATIONS, DEFAULT_SEED_ALLOCATIONS);
      allocatedStudentIds = cached[staffId] || DEFAULT_SEED_ALLOCATIONS[staffId] || [];
    }

    // Determine target department
    const staffObj = INITIAL_STAFF_MEMBERS.find(s => s.id === staffId);
    const effectiveDept = (staffDepartmentCode || staffObj?.departmentCode || 'CSE').toUpperCase();

    // Fetch matching students from INITIAL_STUDENTS
    let result = INITIAL_STUDENTS.filter(s => {
      const studentDept = (s.departmentCode || s.departmentId?.replace('dept-', '') || '').toUpperCase();
      const matchesDept = studentDept === effectiveDept;
      const isAllocated = allocatedStudentIds.includes(s.id);
      const isCoordinated = s.classCoordinatorId === staffId;
      return matchesDept && (isAllocated || isCoordinated);
    });

    // If staff has no direct allocations yet, return department students
    if (result.length === 0) {
      result = INITIAL_STUDENTS.filter(s => {
        const studentDept = (s.departmentCode || s.departmentId?.replace('dept-', '') || '').toUpperCase();
        return studentDept === effectiveDept;
      });
    }

    return result;
  } catch (err) {
    console.error('Failed to fetch allocated students:', err);
    const staffObj = INITIAL_STAFF_MEMBERS.find(s => s.id === staffId);
    const dept = (staffDepartmentCode || staffObj?.departmentCode || 'CSE').toUpperCase();
    return INITIAL_STUDENTS.filter(s => (s.departmentCode || '').toUpperCase() === dept);
  }
}

/**
 * Allocate a student to a staff proctor.
 */
export async function allocateStudentToStaff(
  staffId: string,
  studentId: string,
  departmentCode?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const student = INITIAL_STUDENTS.find(s => s.id === studentId);
    const dept = departmentCode || student?.departmentCode || 'CSE';

    // 1. Supabase attempt
    try {
      await supabase
        .from('staff_student_allocation')
        .upsert({
          id: `alloc-${staffId}-${studentId}`,
          staff_id: staffId,
          student_id: studentId,
          department_code: dept,
          allocated_at: new Date().toISOString()
        });
    } catch {
      // ignore
    }

    // 2. Cache update
    const cached = getLocalCache<Record<string, string[]>>(CACHE_KEYS.ALLOCATIONS, DEFAULT_SEED_ALLOCATIONS);
    const currentList = cached[staffId] || [];
    if (!currentList.includes(studentId)) {
      cached[staffId] = [...currentList, studentId];
      setLocalCache(CACHE_KEYS.ALLOCATIONS, cached);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error allocating student:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Unallocate a student from a staff proctor.
 */
export async function unallocateStudentFromStaff(
  staffId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    try {
      await supabase
        .from('staff_student_allocation')
        .delete()
        .eq('staff_id', staffId)
        .eq('student_id', studentId);
    } catch {
      // ignore
    }

    const cached = getLocalCache<Record<string, string[]>>(CACHE_KEYS.ALLOCATIONS, DEFAULT_SEED_ALLOCATIONS);
    if (cached[staffId]) {
      cached[staffId] = cached[staffId].filter(id => id !== studentId);
      setLocalCache(CACHE_KEYS.ALLOCATIONS, cached);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error unallocating student:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Get Class Coordinator Assignment details for a staff member or department.
 */
export function getClassCoordinatorAssignment(
  staffIdOrDept: string
): ClassCoordinatorAssignment | null {
  const normalized = (staffIdOrDept || '').toUpperCase();
  
  // Search by staffId
  const byStaffId = INITIAL_COORDINATOR_ASSIGNMENTS.find(c => c.staffId === staffIdOrDept);
  if (byStaffId) return byStaffId;

  // Search by department code
  const byDept = INITIAL_COORDINATOR_ASSIGNMENTS.find(c => c.departmentCode.toUpperCase() === normalized);
  if (byDept) return byDept;

  // Fallback to first assignment (CSE)
  return INITIAL_COORDINATOR_ASSIGNMENTS[0];
}

/**
 * Fetch all students belonging to a Class Coordinator's assigned class and section.
 */
export async function fetchCoordinatorClassStudents(
  staffId: string,
  departmentCode?: string,
  year?: number,
  section?: string
): Promise<Student[]> {
  const assignment = getClassCoordinatorAssignment(staffId) || 
    (departmentCode ? getClassCoordinatorAssignment(departmentCode) : INITIAL_COORDINATOR_ASSIGNMENTS[0]);
  
  const targetDept = (departmentCode || assignment?.departmentCode || 'CSE').toUpperCase();
  const targetYear = year || assignment?.year || 3;
  const targetSection = (section || assignment?.section || 'A').toUpperCase();

  return INITIAL_STUDENTS.filter(s => {
    const sDept = (s.departmentCode || s.departmentId?.replace('dept-', '') || '').toUpperCase();
    const sYear = s.year;
    const sSection = (s.section || 'A').toUpperCase();

    return sDept === targetDept && sYear === targetYear && sSection === targetSection;
  });
}

// ============================================================================
// 2. DAILY ATTENDANCE PERSISTENCE & CRUD
// ============================================================================

/**
 * Fetch attendance records for a specific date.
 */
export async function fetchAttendanceForDate(
  staffId: string, 
  attendanceDate: string,
  departmentCode?: string
): Promise<AttendanceRecord[]> {
  if (!attendanceDate) return [];

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('attendance_date', attendanceDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase DB Notice] Error fetching attendance:', error.message);
    }

    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, getInitialSeedAttendance());

    if (data && data.length > 0) {
      const studentMap = new Map<string, Student>();
      INITIAL_STUDENTS.forEach(s => studentMap.set(s.id, s));

      const records: AttendanceRecord[] = data.map((item: any) => {
        const student = studentMap.get(item.student_id);
        const normStatus: AttendanceStatus = 
          item.status?.toLowerCase() === 'present' ? 'Present' :
          item.status?.toLowerCase() === 'leave' ? 'Leave' : 'Absent';

        return {
          id: item.id || `att-${item.student_id}-${item.attendance_date}`,
          studentId: item.student_id,
          staffId: item.staff_id || staffId,
          attendanceDate: item.attendance_date,
          status: normStatus,
          notes: item.notes || '',
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
          studentName: student?.name || 'Enrolled Student',
          registerNumber: student?.registerNumber || item.student_id,
          departmentName: student?.departmentName || 'Computer Science and Engineering',
          departmentCode: (student?.departmentCode || 'CSE') as DepartmentCode,
          course: student?.course || 'B.E. Engineering',
          year: student?.year || 3,
          section: student?.section || 'A',
          photoUrl: student?.photoUrl
        };
      });

      // Filter by department if requested
      if (departmentCode) {
        return records.filter(r => (r.departmentCode || '').toUpperCase() === departmentCode.toUpperCase());
      }
      return records;
    }

    // Filter cached records
    let result = cached.filter(r => r.attendanceDate === attendanceDate);
    if (departmentCode) {
      result = result.filter(r => (r.departmentCode || '').toUpperCase() === departmentCode.toUpperCase());
    } else if (staffId) {
      result = result.filter(r => r.staffId === staffId || !r.staffId);
    }

    return result;
  } catch (err) {
    console.error('Failed to load attendance:', err);
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, getInitialSeedAttendance());
    return cached.filter(r => r.attendanceDate === attendanceDate);
  }
}

/**
 * Mark or update attendance for a single student on a specific date.
 * Supports: 'Present' | 'Absent' | 'Leave'
 * Enforces uniqueness on (studentId, attendanceDate) to prevent duplicates.
 */
export async function saveAttendanceRecord(params: {
  studentId: string;
  staffId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  notes?: string;
  departmentCode?: string;
  year?: number;
  section?: string;
}): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
  const { studentId, staffId, attendanceDate, status, notes } = params;
  const recordId = `att-${studentId}-${attendanceDate}`;
  const now = new Date().toISOString();

  // Normalize status
  const normalizedStatus: AttendanceStatus = 
    status.toLowerCase() === 'present' ? 'Present' :
    status.toLowerCase() === 'leave' ? 'Leave' : 'Absent';

  const student = INITIAL_STUDENTS.find(s => s.id === studentId);
  const deptCode = (params.departmentCode || student?.departmentCode || 'CSE') as DepartmentCode;

  const newRecord: AttendanceRecord = {
    id: recordId,
    studentId,
    staffId,
    attendanceDate,
    status: normalizedStatus,
    notes: notes || '',
    createdAt: now,
    updatedAt: now,
    studentName: student?.name || 'Enrolled Student',
    registerNumber: student?.registerNumber || studentId,
    departmentName: student?.departmentName || 'Academic Department',
    departmentCode: deptCode,
    course: student?.course || 'B.E. Engineering',
    year: params.year || student?.year || 3,
    section: params.section || student?.section || 'A',
    photoUrl: student?.photoUrl
  };

  try {
    // Upsert into Supabase `attendance` table
    const { error } = await supabase
      .from('attendance')
      .upsert({
        id: recordId,
        student_id: studentId,
        staff_id: staffId,
        attendance_date: attendanceDate,
        status: normalizedStatus,
        notes: notes || null,
        updated_at: now
      }, { onConflict: 'student_id,attendance_date' });

    if (error) {
      console.warn('[Supabase DB Notice] Error upserting attendance:', error.message);
    }

    // Always update local cache for instant UI reactivity and offline persistence
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, getInitialSeedAttendance());
    const filtered = cached.filter(r => !(r.studentId === studentId && r.attendanceDate === attendanceDate));
    setLocalCache(CACHE_KEYS.ATTENDANCE, [newRecord, ...filtered]);

    return { success: true, record: newRecord };
  } catch (err: any) {
    console.error('Error saving attendance:', err);
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, getInitialSeedAttendance());
    const filtered = cached.filter(r => !(r.studentId === studentId && r.attendanceDate === attendanceDate));
    setLocalCache(CACHE_KEYS.ATTENDANCE, [newRecord, ...filtered]);

    return { success: true, record: newRecord };
  }
}

/**
 * Bulk mark attendance for all allocated students on a date.
 */
export async function saveBulkAttendance(params: {
  staffId: string;
  attendanceDate: string;
  studentIds: string[];
  status: AttendanceStatus;
  notes?: string;
  departmentCode?: string;
  year?: number;
  section?: string;
}): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  const { staffId, attendanceDate, studentIds, status, notes } = params;
  const now = new Date().toISOString();

  const normalizedStatus: AttendanceStatus = 
    status.toLowerCase() === 'present' ? 'Present' :
    status.toLowerCase() === 'leave' ? 'Leave' : 'Absent';

  try {
    const rows = studentIds.map(studentId => ({
      id: `att-${studentId}-${attendanceDate}`,
      student_id: studentId,
      staff_id: staffId,
      attendance_date: attendanceDate,
      status: normalizedStatus,
      notes: notes || `Marked ${normalizedStatus} by Class Coordinator on ${attendanceDate}`,
      updated_at: now
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'student_id,attendance_date' });

    if (error) {
      console.warn('[Supabase DB Notice] Bulk upsert error:', error.message);
    }

    const studentMap = new Map<string, Student>();
    INITIAL_STUDENTS.forEach(s => studentMap.set(s.id, s));

    const updatedRecords: AttendanceRecord[] = rows.map(r => {
      const student = studentMap.get(r.student_id);
      return {
        id: r.id,
        studentId: r.student_id,
        staffId: r.staff_id,
        attendanceDate: r.attendance_date,
        status: normalizedStatus,
        notes: r.notes,
        createdAt: now,
        updatedAt: now,
        studentName: student?.name,
        registerNumber: student?.registerNumber,
        departmentName: student?.departmentName,
        departmentCode: (student?.departmentCode || 'CSE') as DepartmentCode,
        course: student?.course,
        year: student?.year || 3,
        section: student?.section || 'A',
        photoUrl: student?.photoUrl
      };
    });

    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, getInitialSeedAttendance());
    const remaining = cached.filter(r => !(r.attendanceDate === attendanceDate && studentIds.includes(r.studentId)));
    setLocalCache(CACHE_KEYS.ATTENDANCE, [...updatedRecords, ...remaining]);

    return { success: true, updatedCount: rows.length };
  } catch (err: any) {
    console.error('Bulk attendance error:', err);
    return { success: false, updatedCount: 0, error: err?.message };
  }
}

// ============================================================================
// 3. STUDENT LIVE ATTENDANCE & CC CONNECTION
// ============================================================================

/**
 * Fetch full attendance statistics, history, and assigned Class Coordinator info for a student.
 * Strict: Leave is tracked separately and NOT counted as Present.
 * Formula: Attendance % = (Present Days / Total Working Days) * 100
 */
export async function fetchStudentAttendanceStats(
  studentIdOrRegNumber: string
): Promise<StudentAttendanceStats | null> {
  if (!studentIdOrRegNumber) return null;

  const cleanQuery = studentIdOrRegNumber.trim().toLowerCase();

  // Find student in directory
  const student = INITIAL_STUDENTS.find(s => 
    s.id.toLowerCase() === cleanQuery ||
    s.registerNumber.toLowerCase() === cleanQuery ||
    s.studentIdNumber.toLowerCase() === cleanQuery ||
    s.collegeEmail.toLowerCase() === cleanQuery
  ) || INITIAL_STUDENTS[0];

  if (!student) return null;

  const deptCode = (student.departmentCode || student.departmentId?.replace('dept-', '') || 'CSE').toUpperCase() as DepartmentCode;

  // Find assigned Class Coordinator
  const ccAssignment = getClassCoordinatorAssignment(student.classCoordinatorId || deptCode) || INITIAL_COORDINATOR_ASSIGNMENTS[0];

  // Fetch all attendance records for this student
  let allRecords: AttendanceRecord[] = [];

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student.id)
      .order('attendance_date', { ascending: false });

    if (!error && data && data.length > 0) {
      allRecords = data.map((item: any) => {
        const normStatus: AttendanceStatus = 
          item.status?.toLowerCase() === 'present' ? 'Present' :
          item.status?.toLowerCase() === 'leave' ? 'Leave' : 'Absent';

        return {
          id: item.id || `att-${student.id}-${item.attendance_date}`,
          studentId: student.id,
          staffId: item.staff_id || ccAssignment.staffId,
          attendanceDate: item.attendance_date,
          status: normStatus,
          notes: item.notes || '',
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
          studentName: student.name,
          registerNumber: student.registerNumber,
          departmentName: student.departmentName,
          departmentCode: deptCode,
          course: student.course,
          year: student.year,
          section: student.section || 'A',
          photoUrl: student.photoUrl
        };
      });
    } else {
      // Fallback from cache
      const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, getInitialSeedAttendance());
      allRecords = cached.filter(r => r.studentId === student.id || r.registerNumber === student.registerNumber);
    }
  } catch (err) {
    console.error('Error loading student attendance stats:', err);
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, getInitialSeedAttendance());
    allRecords = cached.filter(r => r.studentId === student.id || r.registerNumber === student.registerNumber);
  }

  // If no records exist, load seed
  if (allRecords.length === 0) {
    const seed = getInitialSeedAttendance();
    allRecords = seed.filter(r => r.studentId === student.id);
  }

  // Sort latest date first
  allRecords.sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));

  // Calculate live statistics
  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;

  allRecords.forEach(r => {
    const st = r.status.toLowerCase();
    if (st === 'present') presentDays++;
    else if (st === 'absent') absentDays++;
    else if (st === 'leave') leaveDays++;
  });

  const totalWorkingDays = presentDays + absentDays + leaveDays;
  const attendancePercentage = totalWorkingDays > 0 
    ? Math.round((presentDays / totalWorkingDays) * 1000) / 10 
    : 100.0;

  return {
    studentId: student.id,
    studentName: student.name,
    registerNumber: student.registerNumber,
    departmentName: student.departmentName,
    departmentCode: deptCode,
    year: student.year,
    section: student.section || 'A',
    coordinatorName: student.classCoordinatorName || ccAssignment.staffName,
    coordinatorEmail: student.classCoordinatorEmail || ccAssignment.staffEmail,
    coordinatorPhone: student.classCoordinatorPhone || ccAssignment.staffPhone,
    totalWorkingDays,
    presentDays,
    absentDays,
    leaveDays,
    attendancePercentage,
    records: allRecords
  };
}

/**
 * Fetch daily summary for a coordinator's assigned cohort across multiple dates.
 */
export async function fetchCoordinatorDailySummaries(
  staffId: string,
  departmentCode?: string
): Promise<AttendanceDailySummary[]> {
  try {
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, getInitialSeedAttendance());
    const effectiveDept = (departmentCode || 'CSE').toUpperCase();

    const filtered = cached.filter(r => 
      (r.departmentCode || '').toUpperCase() === effectiveDept || r.staffId === staffId
    );

    const dateMap = new Map<string, { present: number; absent: number; leave: number }>();

    filtered.forEach(r => {
      const d = r.attendanceDate;
      if (!dateMap.has(d)) {
        dateMap.set(d, { present: 0, absent: 0, leave: 0 });
      }
      const item = dateMap.get(d)!;
      const st = r.status.toLowerCase();
      if (st === 'present') item.present++;
      else if (st === 'absent') item.absent++;
      else if (st === 'leave') item.leave++;
    });

    // Ensure today is in map
    const today = getTodayDateString();
    if (!dateMap.has(today)) {
      dateMap.set(today, { present: 0, absent: 0, leave: 0 });
    }

    const summaries: AttendanceDailySummary[] = [];

    dateMap.forEach((counts, date) => {
      const totalLogged = counts.present + counts.absent + counts.leave;
      const totalAllocated = Math.max(totalLogged, 3);
      const unmarked = Math.max(0, totalAllocated - totalLogged);
      const percentage = totalLogged > 0 
        ? Math.round((counts.present / totalLogged) * 100) 
        : 0;

      summaries.push({
        date,
        totalAllocated,
        presentCount: counts.present,
        absentCount: counts.absent,
        leaveCount: counts.leave,
        unmarkedCount: unmarked,
        attendancePercentage: percentage
      });
    });

    return summaries.sort((a, b) => b.date.localeCompare(a.date));
  } catch (err) {
    console.error('Error in fetchCoordinatorDailySummaries:', err);
    return [];
  }
}

/**
 * Fetch attendance history summaries for a staff member.
 */
export async function fetchAttendanceHistorySummaries(
  staffId: string,
  totalAllocatedStudents: number = 3
): Promise<AttendanceDailySummary[]> {
  return fetchCoordinatorDailySummaries(staffId);
}

// ============================================================================
// 4. COMPLETE POSTGRESQL DDL & RLS SCHEMA SCRIPT
// ============================================================================

export function getAttendanceSqlSchema(): string {
  return `-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR STAFF, CLASS COORDINATOR & STUDENT ATTENDANCE
-- ==============================================================================

-- 1. Create Staff Student Allocation Table
CREATE TABLE IF NOT EXISTS public.staff_student_allocation (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  department_code TEXT DEFAULT 'CSE',
  academic_year TEXT DEFAULT '2025-2026',
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_staff_student UNIQUE(staff_id, student_id)
);

-- 2. Create Attendance Table with Present, Absent, and Leave status
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave', 'present', 'absent', 'leave')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_date UNIQUE(student_id, attendance_date)
);

-- 3. Create Class Coordinators Assignment Table
CREATE TABLE IF NOT EXISTS public.class_coordinators (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  department_code TEXT NOT NULL,
  year INT NOT NULL DEFAULT 3,
  section TEXT NOT NULL DEFAULT 'A',
  room_number TEXT,
  office_hours TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_dept_year_sec UNIQUE(department_code, year, section)
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_staff ON public.attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_allocation_staff ON public.staff_student_allocation(staff_id);
CREATE INDEX IF NOT EXISTS idx_allocation_dept ON public.staff_student_allocation(department_code);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.staff_student_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_coordinators ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for Staff Student Allocation (Restricting by Department)
DROP POLICY IF EXISTS "Staff read own dept allocations" ON public.staff_student_allocation;
CREATE POLICY "Staff read own dept allocations" ON public.staff_student_allocation 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff insert allocations" ON public.staff_student_allocation;
CREATE POLICY "Staff insert allocations" ON public.staff_student_allocation 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff update allocations" ON public.staff_student_allocation;
CREATE POLICY "Staff update allocations" ON public.staff_student_allocation 
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Staff delete allocations" ON public.staff_student_allocation;
CREATE POLICY "Staff delete allocations" ON public.staff_student_allocation 
  FOR DELETE USING (true);

-- 7. Create RLS Policies for Attendance
DROP POLICY IF EXISTS "Allow select attendance" ON public.attendance;
CREATE POLICY "Allow select attendance" ON public.attendance 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert attendance" ON public.attendance;
CREATE POLICY "Allow insert attendance" ON public.attendance 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update attendance" ON public.attendance;
CREATE POLICY "Allow update attendance" ON public.attendance 
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete attendance" ON public.attendance;
CREATE POLICY "Allow delete attendance" ON public.attendance 
  FOR DELETE USING (true);
`;
}
