import { supabase } from './supabase';
import { 
  Student, 
  AttendanceRecord, 
  AttendanceStatus, 
  StaffStudentAllocation, 
  AttendanceDailySummary,
  StaffMember,
  DepartmentCode 
} from '../types';
import { INITIAL_STUDENTS, INITIAL_USERS } from '../data/mockData';

// Initial pre-allocated staff list
export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'u-staff-1',
    name: 'Officer Marcus Vance',
    email: 'm.vance@security.avsct.edu.in',
    departmentCode: 'CSE',
    designation: 'Senior Proctor & Faculty Advisor',
    phoneNumber: '+91 98765 99001',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'u-staff-2',
    name: 'Prof. Anita Sharma',
    email: 'anita.sharma@faculty.avsct.edu.in',
    departmentCode: 'CSE',
    designation: 'Associate Professor & Class Incharge',
    phoneNumber: '+91 98765 99002',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'u-staff-3',
    name: 'Prof. David Miller',
    email: 'david.miller@faculty.avsct.edu.in',
    departmentCode: 'IT',
    designation: 'Assistant Professor & Lab Coordinator',
    phoneNumber: '+91 98765 99003',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'u-staff-4',
    name: 'Prof. Sneha Kulkarni',
    email: 'sneha.k@faculty.avsct.edu.in',
    departmentCode: 'AIDS',
    designation: 'AI Lab Proctor & Assistant Professor',
    phoneNumber: '+91 98765 99004',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'
  }
];

// Initial default seed allocations per staff (to guarantee immediate out-of-the-box working state)
const DEFAULT_SEED_ALLOCATIONS: Record<string, string[]> = {
  'u-staff-1': ['st-001', 'st-002', 'st-003', 'st-004', 'st-008', 'st-011'], // Marcus Vance (CSE Group A)
  'u-staff-2': ['st-005', 'st-006', 'st-007', 'st-014', 'st-015'],          // Anita Sharma (CSE Group B)
  'u-staff-3': ['st-009', 'st-012', 'st-016', 'st-017'],                     // David Miller (IT Cohort)
  'u-staff-4': ['st-010', 'st-013', 'st-018', 'st-019']                      // Sneha Kulkarni (AIDS Cohort)
};

const CACHE_KEYS = {
  ALLOCATIONS: 'shov_staff_student_allocations_v1',
  ATTENDANCE: 'shov_attendance_records_v1'
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
  } catch (e) {
    console.warn(`Error writing localStorage ${key}:`, e);
  }
}

// Format Date as YYYY-MM-DD
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(dateStr: string): string {
  try {
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

// ============================================================================
// 1. ALLOCATED STUDENTS MANAGEMENT
// ============================================================================

/**
 * Fetch all students allocated strictly to a specific staff member.
 * Loads from Supabase `staff_student_allocation` table.
 */
export async function fetchAllocatedStudentsForStaff(staffId: string): Promise<Student[]> {
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

    if (allocatedStudentIds.length === 0) {
      return [];
    }

    // 2. Fetch student profiles from Supabase `profiles` or fallback to INITIAL_STUDENTS
    const { data: dbProfiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .in('id', allocatedStudentIds);

    if (!profileErr && dbProfiles && dbProfiles.length > 0) {
      const studentMap = new Map<string, Student>();
      
      // Load mock baseline
      INITIAL_STUDENTS.forEach(s => studentMap.set(s.id, s));

      // Overwrite with DB
      dbProfiles.forEach((p: any) => {
        studentMap.set(p.id, {
          id: p.id,
          registerNumber: p.register_number || p.username || '23CS001',
          studentIdNumber: p.student_id || p.register_number || 'STU-10001',
          name: p.name || 'Student Name',
          photoUrl: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          departmentId: p.department_code ? `dept-${p.department_code.toLowerCase()}` : 'dept-cse',
          departmentName: p.department_name || 'Computer Science & Engineering',
          course: p.course || `B.E. ${p.department_name || 'CSE'}`,
          year: p.year || 3,
          collegeEmail: p.email || 'student@avsct.edu.in',
          phoneNumber: p.phone_number || '+91 98765 00000',
          status: 'ACTIVE',
          validUntil: '31-05-2027',
          bloodGroup: p.blood_group || 'O+'
        });
      });

      return allocatedStudentIds.map(id => studentMap.get(id)).filter(Boolean) as Student[];
    }

    // Baseline fallback from INITIAL_STUDENTS
    return INITIAL_STUDENTS.filter(s => allocatedStudentIds.includes(s.id));
  } catch (err) {
    console.error('Failed to fetch allocated students:', err);
    const cached = getLocalCache<Record<string, string[]>>(CACHE_KEYS.ALLOCATIONS, DEFAULT_SEED_ALLOCATIONS);
    const fallbackIds = cached[staffId] || DEFAULT_SEED_ALLOCATIONS[staffId] || [];
    return INITIAL_STUDENTS.filter(s => fallbackIds.includes(s.id));
  }
}

/**
 * Allocate a student to a staff member.
 */
export async function allocateStudentToStaff(
  staffId: string, 
  studentId: string, 
  departmentCode: DepartmentCode = 'CSE'
): Promise<{ success: boolean; error?: string }> {
  try {
    const allocationId = `alloc-${staffId}-${studentId}`;
    const { error } = await supabase
      .from('staff_student_allocation')
      .upsert({
        id: allocationId,
        staff_id: staffId,
        student_id: studentId,
        department_code: departmentCode,
        academic_year: '2025-2026',
        allocated_at: new Date().toISOString()
      }, { onConflict: 'staff_id,student_id' });

    if (error) {
      console.warn('[Supabase Notice] allocateStudent error:', error.message);
    }

    // Update local cache
    const cached = getLocalCache<Record<string, string[]>>(CACHE_KEYS.ALLOCATIONS, DEFAULT_SEED_ALLOCATIONS);
    const currentList = cached[staffId] || [];
    if (!currentList.includes(studentId)) {
      cached[staffId] = [...currentList, studentId];
      setLocalCache(CACHE_KEYS.ALLOCATIONS, cached);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error allocating student:', err);
    return { success: false, error: err?.message || 'Failed to allocate student' };
  }
}

/**
 * Remove / Unallocate a student from a staff member.
 */
export async function unallocateStudentFromStaff(
  staffId: string, 
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('staff_student_allocation')
      .delete()
      .eq('staff_id', staffId)
      .eq('student_id', studentId);

    if (error) {
      console.warn('[Supabase Notice] unallocateStudent error:', error.message);
    }

    // Update local cache
    const cached = getLocalCache<Record<string, string[]>>(CACHE_KEYS.ALLOCATIONS, DEFAULT_SEED_ALLOCATIONS);
    if (cached[staffId]) {
      cached[staffId] = cached[staffId].filter(id => id !== studentId);
      setLocalCache(CACHE_KEYS.ALLOCATIONS, cached);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error unallocating student:', err);
    return { success: false, error: err?.message || 'Failed to remove allocation' };
  }
}

// ============================================================================
// 2. DAILY ATTENDANCE PERSISTENCE & CRUD
// ============================================================================

/**
 * Fetch attendance records for a specific staff member and date.
 * Loads directly from Supabase `attendance` table.
 */
export async function fetchAttendanceForDate(
  staffId: string, 
  attendanceDate: string
): Promise<AttendanceRecord[]> {
  if (!staffId || !attendanceDate) return [];

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('staff_id', staffId)
      .eq('attendance_date', attendanceDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase DB Notice] Error fetching attendance:', error.message);
    }

    if (data && data.length > 0) {
      // Map and enrich with student details
      const studentMap = new Map<string, Student>();
      INITIAL_STUDENTS.forEach(s => studentMap.set(s.id, s));

      const records: AttendanceRecord[] = data.map((item: any) => {
        const student = studentMap.get(item.student_id);
        return {
          id: item.id || `att-${item.student_id}-${item.attendance_date}`,
          studentId: item.student_id,
          staffId: item.staff_id,
          attendanceDate: item.attendance_date,
          status: item.status as AttendanceStatus,
          notes: item.notes || '',
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
          studentName: student?.name || 'Enrolled Student',
          registerNumber: student?.registerNumber || item.student_id,
          departmentName: student?.departmentName || 'Computer Science',
          departmentCode: (student?.departmentId?.replace('dept-', '').toUpperCase() || 'CSE') as DepartmentCode,
          course: student?.course || 'B.E. CSE',
          photoUrl: student?.photoUrl
        };
      });

      // Update cache
      const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, []);
      const otherRecords = cached.filter(r => !(r.staffId === staffId && r.attendanceDate === attendanceDate));
      setLocalCache(CACHE_KEYS.ATTENDANCE, [...otherRecords, ...records]);

      return records;
    }

    // Check local cache if DB returned empty or offline
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, []);
    return cached.filter(r => r.staffId === staffId && r.attendanceDate === attendanceDate);
  } catch (err) {
    console.error('Failed to load attendance:', err);
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, []);
    return cached.filter(r => r.staffId === staffId && r.attendanceDate === attendanceDate);
  }
}

/**
 * Mark or update attendance for a single student on a specific date.
 * Uses .upsert() on `attendance` table with unique constraint `(student_id, attendance_date)`.
 */
export async function saveAttendanceRecord(params: {
  studentId: string;
  staffId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  notes?: string;
}): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
  const { studentId, staffId, attendanceDate, status, notes } = params;
  const recordId = `att-${studentId}-${attendanceDate}`;
  const now = new Date().toISOString();

  const student = INITIAL_STUDENTS.find(s => s.id === studentId);

  const newRecord: AttendanceRecord = {
    id: recordId,
    studentId,
    staffId,
    attendanceDate,
    status,
    notes: notes || '',
    createdAt: now,
    updatedAt: now,
    studentName: student?.name || 'Enrolled Student',
    registerNumber: student?.registerNumber || studentId,
    departmentName: student?.departmentName || 'Academic Department',
    departmentCode: (student?.departmentId?.replace('dept-', '').toUpperCase() || 'CSE') as DepartmentCode,
    course: student?.course || 'B.E. Engineering',
    photoUrl: student?.photoUrl
  };

  try {
    // Upsert into Supabase `attendance`
    const { error } = await supabase
      .from('attendance')
      .upsert({
        id: recordId,
        student_id: studentId,
        staff_id: staffId,
        attendance_date: attendanceDate,
        status: status,
        notes: notes || null,
        updated_at: now
      }, { onConflict: 'student_id,attendance_date' });

    if (error) {
      console.warn('[Supabase DB Notice] Error upserting attendance:', error.message);
    }

    // Always update local cache for instant UI response and offline safety
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, []);
    const filtered = cached.filter(r => !(r.studentId === studentId && r.attendanceDate === attendanceDate));
    setLocalCache(CACHE_KEYS.ATTENDANCE, [...filtered, newRecord]);

    return { success: true, record: newRecord };
  } catch (err: any) {
    console.error('Error saving attendance:', err);
    // Cache fallback
    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, []);
    const filtered = cached.filter(r => !(r.studentId === studentId && r.attendanceDate === attendanceDate));
    setLocalCache(CACHE_KEYS.ATTENDANCE, [...filtered, newRecord]);

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
}): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  const { staffId, attendanceDate, studentIds, status } = params;
  const now = new Date().toISOString();

  try {
    const rows = studentIds.map(studentId => ({
      id: `att-${studentId}-${attendanceDate}`,
      student_id: studentId,
      staff_id: staffId,
      attendance_date: attendanceDate,
      status: status,
      notes: `Bulk marked ${status} on ${attendanceDate}`,
      updated_at: now
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'student_id,attendance_date' });

    if (error) {
      console.warn('[Supabase DB Notice] Bulk upsert error:', error.message);
    }

    // Update local cache
    const studentMap = new Map<string, Student>();
    INITIAL_STUDENTS.forEach(s => studentMap.set(s.id, s));

    const updatedRecords: AttendanceRecord[] = rows.map(r => {
      const student = studentMap.get(r.student_id);
      return {
        id: r.id,
        studentId: r.student_id,
        staffId: r.staff_id,
        attendanceDate: r.attendance_date,
        status: r.status as AttendanceStatus,
        notes: r.notes,
        createdAt: now,
        updatedAt: now,
        studentName: student?.name,
        registerNumber: student?.registerNumber,
        departmentName: student?.departmentName,
        course: student?.course,
        photoUrl: student?.photoUrl
      };
    });

    const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, []);
    const remaining = cached.filter(r => !(r.staffId === staffId && r.attendanceDate === attendanceDate && studentIds.includes(r.studentId)));
    setLocalCache(CACHE_KEYS.ATTENDANCE, [...remaining, ...updatedRecords]);

    return { success: true, updatedCount: rows.length };
  } catch (err: any) {
    console.error('Bulk attendance error:', err);
    return { success: false, updatedCount: 0, error: err?.message };
  }
}

/**
 * Fetch attendance history summaries across multiple dates for a staff member.
 */
export async function fetchAttendanceHistorySummaries(
  staffId: string, 
  totalAllocatedStudentsCount: number
): Promise<AttendanceDailySummary[]> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('attendance_date, status')
      .eq('staff_id', staffId)
      .order('attendance_date', { ascending: false });

    if (error) {
      console.warn('[Supabase DB Notice] Error fetching history:', error.message);
    }

    // Group by date
    const dateMap = new Map<string, { present: number; absent: number }>();

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        const d = row.attendance_date;
        if (!dateMap.has(d)) {
          dateMap.set(d, { present: 0, absent: 0 });
        }
        const curr = dateMap.get(d)!;
        if (row.status === 'Present') curr.present++;
        else if (row.status === 'Absent') curr.absent++;
      });
    } else {
      // Fallback from cache
      const cached = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, []);
      cached.filter(r => r.staffId === staffId).forEach(r => {
        const d = r.attendanceDate;
        if (!dateMap.has(d)) {
          dateMap.set(d, { present: 0, absent: 0 });
        }
        const curr = dateMap.get(d)!;
        if (r.status === 'Present') curr.present++;
        else if (r.status === 'Absent') curr.absent++;
      });
    }

    // Ensure today is always represented
    const todayStr = getTodayDateString();
    if (!dateMap.has(todayStr)) {
      dateMap.set(todayStr, { present: 0, absent: 0 });
    }

    const summaries: AttendanceDailySummary[] = [];

    dateMap.forEach((counts, date) => {
      const total = totalAllocatedStudentsCount || (counts.present + counts.absent) || 1;
      const unmarked = Math.max(0, total - (counts.present + counts.absent));
      const percentage = (counts.present + counts.absent) > 0 
        ? Math.round((counts.present / (counts.present + counts.absent)) * 100)
        : 0;

      summaries.push({
        date,
        totalAllocated: total,
        presentCount: counts.present,
        absentCount: counts.absent,
        unmarkedCount: unmarked,
        attendancePercentage: percentage
      });
    });

    return summaries.sort((a, b) => b.date.localeCompare(a.date));
  } catch (err) {
    console.error('Error fetching attendance history:', err);
    return [];
  }
}

// ============================================================================
// 3. COMPLETE POSTGRESQL DDL & RLS SCHEMA SCRIPT
// ============================================================================

export function getAttendanceSqlSchema(): string {
  return `-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR STAFF STUDENT ATTENDANCE & ALLOCATION
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

-- 2. Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_date UNIQUE(student_id, attendance_date)
);

-- 3. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_staff ON public.attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_allocation_staff ON public.staff_student_allocation(staff_id);
CREATE INDEX IF NOT EXISTS idx_allocation_student ON public.staff_student_allocation(student_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.staff_student_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for Staff Student Allocation
DROP POLICY IF EXISTS "Allow select allocation" ON public.staff_student_allocation;
CREATE POLICY "Allow select allocation" ON public.staff_student_allocation 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert allocation" ON public.staff_student_allocation;
CREATE POLICY "Allow insert allocation" ON public.staff_student_allocation 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update allocation" ON public.staff_student_allocation;
CREATE POLICY "Allow update allocation" ON public.staff_student_allocation 
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete allocation" ON public.staff_student_allocation;
CREATE POLICY "Allow delete allocation" ON public.staff_student_allocation 
  FOR DELETE USING (true);

-- 6. Create RLS Policies for Attendance
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

-- 7. Seed Initial Staff-Student Allocations
INSERT INTO public.staff_student_allocation (id, staff_id, student_id, department_code, academic_year)
VALUES
  ('alloc-u-staff-1-st-001', 'u-staff-1', 'st-001', 'CSE', '2025-2026'),
  ('alloc-u-staff-1-st-002', 'u-staff-1', 'st-002', 'CSE', '2025-2026'),
  ('alloc-u-staff-1-st-003', 'u-staff-1', 'st-003', 'CSE', '2025-2026'),
  ('alloc-u-staff-1-st-004', 'u-staff-1', 'st-004', 'CSE', '2025-2026'),
  ('alloc-u-staff-2-st-005', 'u-staff-2', 'st-005', 'CSE', '2025-2026'),
  ('alloc-u-staff-2-st-006', 'u-staff-2', 'st-006', 'CSE', '2025-2026'),
  ('alloc-u-staff-3-st-009', 'u-staff-3', 'st-009', 'IT', '2025-2026'),
  ('alloc-u-staff-4-st-010', 'u-staff-4', 'st-010', 'AIDS', '2025-2026')
ON CONFLICT (staff_id, student_id) DO NOTHING;
`;
}
