import { supabase } from './supabase';
import { 
  CampusCircular, 
  HodVpPost, 
  Fine, 
  Payment, 
  VerificationLog, 
  User, 
  DepartmentCode,
  UserRole,
  Student,
  StudentInquiry,
  InquiryChatMessage
} from '../types';
import { INITIAL_HOD_CIRCULARS, INITIAL_VP_CIRCULARS } from '../data/circularsData';
import { 
  INITIAL_HOD_VP_POSTS, 
  INITIAL_FINES, 
  INITIAL_VERIFICATION_LOGS, 
  INITIAL_STUDENTS, 
  INITIAL_STUDENT_INQUIRIES 
} from '../data/mockData';
import { uploadToSupabaseStorage, getSignedFileUrl, deleteFileFromStorage } from './storageService';

// Helper for comprehensive error logging
function logSupabaseError(context: string, table: string, error: any) {
  if (!error) return;
  console.error(`[Supabase DB Error] Context: ${context} | Table: ${table} | Code: ${error.code || 'UNKNOWN'} | Message: ${error.message || error}`, error);
  if (error.details) console.error(`[Supabase DB Error Details]:`, error.details);
  if (error.hint) console.warn(`[Supabase DB Hint]:`, error.hint);
}

// Local cache keys for persistent offline/fast synchronization
const CACHE_KEYS = {
  NOTES: 'shov_supabase_notes_cache',
  GATE_PASSES: 'shov_supabase_gate_passes_cache',
  FINES: 'shov_supabase_fines_cache',
  CIRCULARS: 'shov_supabase_circulars_cache',
  BROADCASTS: 'shov_supabase_broadcasts_cache',
  INQUIRIES: 'shov_supabase_inquiries_cache',
  STUDENT_PROFILES: 'shov_supabase_student_profiles_cache'
};

function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(`Error reading local cache for ${key}:`, e);
  }
  return fallback;
}

function setLocalCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing local cache for ${key}:`, e);
  }
}

// ============================================================================
// 1. USER PROFILES & STUDENT ID PERSISTENCE
// ============================================================================

export interface StudentNote {
  id: string;
  userId?: string;
  title: string;
  content: string;
  subjectCode?: string;
  subjectName?: string;
  category?: 'LECTURE_NOTE' | 'LAB_MANUAL' | 'ASSIGNMENT' | 'EXAM_PREP';
  tags?: string[];
  fileUrl?: string;
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch Student Identity Profile from Supabase `profiles` table.
 * Automatically loads on mount/refresh.
 */
export async function fetchUserProfileFromSupabase(userIdOrRegister: string): Promise<User | null> {
  if (!userIdOrRegister) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.eq.${userIdOrRegister},register_number.eq.${userIdOrRegister},email.eq.${userIdOrRegister}`)
      .maybeSingle();

    if (error) {
      logSupabaseError('fetchUserProfileFromSupabase', 'profiles', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      username: data.register_number || data.email?.split('@')[0] || 'user',
      role: (data.role as UserRole) || 'STUDENT',
      departmentName: data.department_name,
      departmentId: data.department_code,
      designation: data.designation,
      studentId: data.student_id || data.register_number,
      phoneNumber: data.phone_number,
      avatarUrl: data.avatar_url
    };
  } catch (e: any) {
    console.error('Error fetching profile from Supabase:', e);
    return null;
  }
}

/**
 * Fetch Full Student Entity from Supabase or Cache
 */
export async function fetchStudentDetailsFromSupabase(studentIdentifier: string): Promise<Student | null> {
  const cachedMap = getLocalCache<Record<string, Student>>(CACHE_KEYS.STUDENT_PROFILES, {});
  const localFound = cachedMap[studentIdentifier] || INITIAL_STUDENTS.find(s => 
    s.id === studentIdentifier || 
    s.registerNumber.toLowerCase() === studentIdentifier.toLowerCase()
  );

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.eq.${studentIdentifier},register_number.eq.${studentIdentifier},student_id.eq.${studentIdentifier}`)
      .maybeSingle();

    if (error) {
      logSupabaseError('fetchStudentDetailsFromSupabase', 'profiles', error);
      return localFound || null;
    }

    if (data) {
      const studentObj: Student = {
        id: data.id || studentIdentifier,
        studentIdNumber: data.student_id || data.register_number || studentIdentifier,
        name: data.name || localFound?.name || 'Enrolled Student',
        registerNumber: data.register_number || localFound?.registerNumber || '23CS101',
        department: data.department_name || localFound?.department || 'Computer Science & Engineering',
        departmentName: data.department_name || localFound?.departmentName || 'Computer Science & Engineering',
        departmentCode: (data.department_code as DepartmentCode) || 'CSE',
        course: data.course || localFound?.course || 'B.E. Computer Science & Engineering',
        year: Number(data.year || localFound?.year || 3),
        dateOfBirth: data.date_of_birth || localFound?.dateOfBirth || '14-08-2004',
        bloodGroup: data.blood_group || localFound?.bloodGroup || 'O+ Positive',
        photoUrl: data.avatar_url || data.photo_url || localFound?.photoUrl || INITIAL_STUDENTS[0].photoUrl,
        collegeEmail: data.email || localFound?.collegeEmail || 'student@avsct.edu.in',
        phoneNumber: data.phone_number || localFound?.phoneNumber || '+91 98765 43210',
        validUntil: data.valid_until || localFound?.validUntil || '31-05-2027',
        validityYear: localFound?.validityYear || '2023 - 2027',
        emergencyContact: data.emergency_contact || data.guardian_phone || localFound?.emergencyContact || '+91 98765 00112',
        address: data.address || localFound?.address || 'Hostel Block B, Room 304, AVS College Campus',
        status: data.status || localFound?.status || 'ACTIVE',
        fines: []
      };

      cachedMap[studentIdentifier] = studentObj;
      setLocalCache(CACHE_KEYS.STUDENT_PROFILES, cachedMap);
      return studentObj;
    }
  } catch (err) {
    console.error('Error fetching student details from Supabase:', err);
  }

  return localFound || null;
}

/**
 * Save/Update Student Identity Info in Supabase `profiles` table using .upsert()
 */
export async function saveStudentDetailsToSupabase(student: Student): Promise<{ success: boolean; error?: string }> {
  // Update local cache immediately
  const cachedMap = getLocalCache<Record<string, Student>>(CACHE_KEYS.STUDENT_PROFILES, {});
  cachedMap[student.id] = student;
  if (student.registerNumber) cachedMap[student.registerNumber] = student;
  setLocalCache(CACHE_KEYS.STUDENT_PROFILES, cachedMap);

  const payload = {
    id: student.id,
    name: student.name,
    email: student.collegeEmail,
    register_number: student.registerNumber,
    student_id: student.studentIdNumber || student.id,
    department_code: student.departmentCode || 'CSE',
    department_name: student.departmentName || student.department,
    course: student.course,
    year: student.year,
    blood_group: student.bloodGroup,
    date_of_birth: student.dateOfBirth,
    phone_number: student.phoneNumber,
    guardian_phone: student.emergencyContact,
    emergency_contact: student.emergencyContact,
    address: student.address,
    avatar_url: student.photoUrl,
    valid_until: student.validUntil,
    status: student.status,
    role: 'STUDENT',
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      logSupabaseError('saveStudentDetailsToSupabase', 'profiles', error);
      return { success: false, error: error.message };
    }

    console.log('[Supabase DB] Student profile successfully saved/upserted:', student.name);
    return { success: true };
  } catch (err: any) {
    console.error('Exception saving student profile to Supabase:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

/**
 * Update general user profile in Supabase `profiles`
 */
export async function updateUserProfileInSupabase(
  userId: string, 
  updates: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      logSupabaseError('updateUserProfileInSupabase', 'profiles', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Profile update error:', err);
    return { success: false, error: err?.message || 'Failed to update profile.' };
  }
}

// ============================================================================
// 2. NOTES REPOSITORY (SUPABASE `notes` TABLE)
// ============================================================================

/**
 * Fetch all saved notes from Supabase using `.select('*')`
 * Automatically called when app starts or notes component mounts.
 */
export async function fetchUserNotesFromSupabase(userId?: string): Promise<StudentNote[]> {
  const cachedNotes = getLocalCache<StudentNote[]>(CACHE_KEYS.NOTES, []);

  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }

    // Query from Supabase notes table
    let query = supabase.from('notes').select('*');
    
    // If targetUserId is available, order and retrieve
    const { data, error } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logSupabaseError('fetchUserNotesFromSupabase', 'notes', error);
      return cachedNotes;
    }

    if (data && Array.isArray(data)) {
      const formatted: StudentNote[] = data.map((item: any) => ({
        id: item.id?.toString() || `note-${Date.now()}`,
        userId: item.user_id,
        title: item.title || 'Untitled Note',
        content: item.content || '',
        subjectCode: item.subject_code || 'GEN-101',
        subjectName: item.subject_name || 'General Academic',
        category: (item.category as any) || 'LECTURE_NOTE',
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []),
        fileUrl: item.file_url,
        isPinned: Boolean(item.is_pinned),
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      }));

      // Cache for instant retrieval on next refresh
      setLocalCache(CACHE_KEYS.NOTES, formatted);
      return formatted;
    }
  } catch (e) {
    console.error('Error fetching notes from Supabase:', e);
  }

  return cachedNotes;
}

/**
 * Create a new student note in Supabase using `.insert()`
 */
export async function createUserNoteInSupabase(note: {
  title: string;
  content: string;
  subjectCode?: string;
  subjectName?: string;
  category?: string;
  tags?: string[];
  fileUrl?: string;
  isPinned?: boolean;
}): Promise<StudentNote | null> {
  const newId = `note-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  let targetUserId = 'guest-student';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) targetUserId = user.id;
  } catch {}

  const newNote: StudentNote = {
    id: newId,
    userId: targetUserId,
    title: note.title,
    content: note.content,
    subjectCode: note.subjectCode || 'CS8601',
    subjectName: note.subjectName || 'Distributed Systems',
    category: (note.category as any) || 'LECTURE_NOTE',
    tags: note.tags || [],
    fileUrl: note.fileUrl,
    isPinned: note.isPinned ?? false,
    createdAt: now,
    updatedAt: now
  };

  // 1. Immediately update cache so UI renders seamlessly
  const cachedNotes = getLocalCache<StudentNote[]>(CACHE_KEYS.NOTES, []);
  setLocalCache(CACHE_KEYS.NOTES, [newNote, ...cachedNotes]);

  // 2. Perform Supabase .insert()
  const payload: any = {
    title: note.title,
    content: note.content,
    subject_code: note.subjectCode || 'CS8601',
    subject_name: note.subjectName || 'Distributed Systems',
    category: note.category || 'LECTURE_NOTE',
    tags: note.tags || [],
    file_url: note.fileUrl || null,
    is_pinned: note.isPinned ?? false,
    created_at: now,
    updated_at: now
  };

  // Only include user_id if valid UUID or table supports string ids
  if (targetUserId && targetUserId !== 'guest-student') {
    payload.user_id = targetUserId;
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      logSupabaseError('createUserNoteInSupabase', 'notes', error);
      // If RLS blocked user_id or uuid format failed, retry insert without user_id
      if (payload.user_id) {
        delete payload.user_id;
        const retryRes = await supabase.from('notes').insert([payload]).select().maybeSingle();
        if (retryRes.data) {
          console.log('[Supabase DB] Note created successfully via fallback insert:', retryRes.data.id);
          return {
            ...newNote,
            id: retryRes.data.id?.toString() || newId
          };
        }
      }
      return newNote;
    }

    if (data) {
      console.log('[Supabase DB] Note inserted successfully into database:', data.id);
      const inserted: StudentNote = {
        id: data.id?.toString() || newId,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        subjectCode: data.subject_code,
        subjectName: data.subject_name,
        category: data.category,
        tags: data.tags || [],
        fileUrl: data.file_url,
        isPinned: data.is_pinned,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Sync verified database item into cache
      const updatedList = [inserted, ...cachedNotes.filter(n => n.id !== newId)];
      setLocalCache(CACHE_KEYS.NOTES, updatedList);
      return inserted;
    }
  } catch (err: any) {
    console.error('Exception creating note in Supabase:', err);
  }

  return newNote;
}

/**
 * Delete a note from Supabase `notes` table
 */
export async function deleteUserNoteFromSupabase(noteId: string): Promise<boolean> {
  // Update cache
  const cachedNotes = getLocalCache<StudentNote[]>(CACHE_KEYS.NOTES, []);
  setLocalCache(CACHE_KEYS.NOTES, cachedNotes.filter(n => n.id !== noteId));

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      logSupabaseError('deleteUserNoteFromSupabase', 'notes', error);
      return true; // cached removal succeeded
    }
    return true;
  } catch (err) {
    console.error('Error deleting note from Supabase:', err);
    return true;
  }
}

/**
 * Toggle pin status on a note in Supabase
 */
export async function togglePinUserNoteInSupabase(noteId: string, isPinned: boolean): Promise<boolean> {
  const cachedNotes = getLocalCache<StudentNote[]>(CACHE_KEYS.NOTES, []);
  setLocalCache(CACHE_KEYS.NOTES, cachedNotes.map(n => n.id === noteId ? { ...n, isPinned } : n));

  try {
    const { error } = await supabase
      .from('notes')
      .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
      .eq('id', noteId);

    if (error) {
      logSupabaseError('togglePinUserNoteInSupabase', 'notes', error);
      return true;
    }
    return true;
  } catch (err) {
    console.error('Error toggling pin in Supabase:', err);
    return true;
  }
}

/**
 * Fetch total note count for student KPI overview
 */
export async function fetchUserNotesCountFromSupabase(userId?: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true });

    if (error) {
      logSupabaseError('fetchUserNotesCountFromSupabase', 'notes', error);
      const cached = getLocalCache<StudentNote[]>(CACHE_KEYS.NOTES, []);
      return cached.length;
    }
    return count ?? 0;
  } catch (e) {
    console.error('Error fetching notes count from Supabase:', e);
    const cached = getLocalCache<StudentNote[]>(CACHE_KEYS.NOTES, []);
    return cached.length;
  }
}

// ============================================================================
// 3. CAMPUS GATE PASSES (SUPABASE `gate_passes` TABLE)
// ============================================================================

export interface GatePassRecord {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  departmentCode: DepartmentCode;
  studentEmail: string;
  phoneNumber: string;
  curfewTime: string;
  outTime: string;
  expectedReturnTime: string;
  reason: string;
  reasonText: string;
  note: string;
  assignedCoordinatorName: string;
  assignedCoordinatorEmail: string;
  status: 'PENDING_CC_APPROVAL' | 'APPROVED' | 'REJECTED';
  ccRemark?: string;
  approvedAt?: string;
  rejectedAt?: string;
  passToken?: string;
  createdAt: string;
}

const DEFAULT_INITIAL_GATE_PASSES: GatePassRecord[] = [
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
  }
];

/**
 * Fetch all gate passes from Supabase `gate_passes` table using `.select()`
 */
export async function fetchGatePassesFromSupabase(studentRegisterOrId?: string): Promise<GatePassRecord[]> {
  const cached = getLocalCache<GatePassRecord[]>(CACHE_KEYS.GATE_PASSES, DEFAULT_INITIAL_GATE_PASSES);

  try {
    let query = supabase.from('gate_passes').select('*');
    if (studentRegisterOrId) {
      query = query.or(`register_number.eq.${studentRegisterOrId},student_id.eq.${studentRegisterOrId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      logSupabaseError('fetchGatePassesFromSupabase', 'gate_passes', error);
      return cached;
    }

    if (data && data.length > 0) {
      const mapped: GatePassRecord[] = data.map((row: any) => ({
        id: row.id?.toString(),
        studentId: row.student_id || 'STU-10001',
        studentName: row.student_name,
        registerNumber: row.register_number,
        department: row.department,
        departmentCode: row.department_code || 'CSE',
        studentEmail: row.student_email,
        phoneNumber: row.phone_number,
        curfewTime: row.curfew_time || '08:30 PM IST',
        outTime: row.out_time,
        expectedReturnTime: row.expected_return_time,
        reason: row.reason,
        reasonText: row.reason_text,
        note: row.note,
        assignedCoordinatorName: row.assigned_coordinator_name,
        assignedCoordinatorEmail: row.assigned_coordinator_email,
        status: row.status,
        ccRemark: row.cc_remark,
        approvedAt: row.approved_at,
        rejectedAt: row.rejected_at,
        passToken: row.pass_token,
        createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : 'Just now'
      }));

      setLocalCache(CACHE_KEYS.GATE_PASSES, mapped);
      return mapped;
    }
  } catch (err) {
    console.error('Error fetching gate passes from Supabase:', err);
  }

  return cached;
}

/**
 * Insert a new gate pass into Supabase `gate_passes` table
 */
export async function createGatePassInSupabase(pass: Omit<GatePassRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; gatePass?: GatePassRecord; error?: string }> {
  const newId = `GP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newRecord: GatePassRecord = {
    ...pass,
    id: newId,
    createdAt: new Date().toLocaleString()
  };

  // Update local cache
  const cached = getLocalCache<GatePassRecord[]>(CACHE_KEYS.GATE_PASSES, DEFAULT_INITIAL_GATE_PASSES);
  setLocalCache(CACHE_KEYS.GATE_PASSES, [newRecord, ...cached]);

  const payload = {
    id: newId,
    student_id: pass.studentId,
    student_name: pass.studentName,
    register_number: pass.registerNumber,
    department: pass.department,
    department_code: pass.departmentCode,
    student_email: pass.studentEmail,
    phone_number: pass.phoneNumber,
    curfew_time: pass.curfewTime,
    out_time: pass.outTime,
    expected_return_time: pass.expectedReturnTime,
    reason: pass.reason,
    reason_text: pass.reasonText,
    note: pass.note,
    assigned_coordinator_name: pass.assignedCoordinatorName,
    assigned_coordinator_email: pass.assignedCoordinatorEmail,
    status: pass.status,
    cc_remark: pass.ccRemark || null,
    pass_token: pass.passToken || `AVSCT-GP-${Math.floor(10000 + Math.random() * 90000)}-PASS`,
    created_at: now
  };

  try {
    const { data, error } = await supabase
      .from('gate_passes')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      logSupabaseError('createGatePassInSupabase', 'gate_passes', error);
      return { success: true, gatePass: newRecord };
    }

    console.log('[Supabase DB] Gate pass submitted to database:', data?.id || newId);
    return { success: true, gatePass: newRecord };
  } catch (err: any) {
    console.error('Exception creating gate pass in Supabase:', err);
    return { success: true, gatePass: newRecord };
  }
}

/**
 * Update gate pass approval status in Supabase
 */
export async function updateGatePassStatusInSupabase(
  passId: string, 
  status: 'APPROVED' | 'REJECTED', 
  ccRemark: string
): Promise<{ success: boolean; error?: string }> {
  const cached = getLocalCache<GatePassRecord[]>(CACHE_KEYS.GATE_PASSES, DEFAULT_INITIAL_GATE_PASSES);
  const updatedList = cached.map(p => {
    if (p.id === passId) {
      return {
        ...p,
        status,
        ccRemark,
        approvedAt: status === 'APPROVED' ? new Date().toLocaleString() : p.approvedAt,
        rejectedAt: status === 'REJECTED' ? new Date().toLocaleString() : p.rejectedAt
      };
    }
    return p;
  });
  setLocalCache(CACHE_KEYS.GATE_PASSES, updatedList);

  try {
    const { error } = await supabase
      .from('gate_passes')
      .update({
        status,
        cc_remark: ccRemark,
        approved_at: status === 'APPROVED' ? new Date().toISOString() : null,
        rejected_at: status === 'REJECTED' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', passId);

    if (error) {
      logSupabaseError('updateGatePassStatusInSupabase', 'gate_passes', error);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error updating gate pass status in Supabase:', err);
    return { success: true };
  }
}

// ============================================================================
// 4. CIRCULARS & DIRECTIVES (SUPABASE `circulars` TABLE)
// ============================================================================

export async function fetchCircularsFromSupabase(): Promise<CampusCircular[]> {
  const initialData = [...INITIAL_VP_CIRCULARS, ...INITIAL_HOD_CIRCULARS];
  const cached = getLocalCache<CampusCircular[]>(CACHE_KEYS.CIRCULARS, initialData);

  try {
    const { data, error } = await supabase
      .from('circulars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logSupabaseError('fetchCircularsFromSupabase', 'circulars', error);
      return cached;
    }

    if (data && data.length > 0) {
      const mapped: CampusCircular[] = data.map((item: any) => ({
        id: item.id?.toString(),
        circularNumber: item.circular_number,
        issuerRole: item.issuer_role,
        issuerName: item.issuer_name,
        issuerDesignation: item.issuer_designation,
        issuerAvatarUrl: item.issuer_avatar_url,
        departmentCode: item.department_code,
        departmentName: item.department_name,
        title: item.title,
        summary: item.summary,
        content: item.content,
        issuanceDate: item.issuance_date,
        effectiveDate: item.effective_date,
        category: item.category,
        targetAudience: item.target_audience,
        urgency: item.urgency,
        attachmentUrl: item.attachment_url,
        attachmentName: item.attachment_name,
        isAcknowledged: false,
        acknowledgementCount: item.acknowledgement_count || 0
      }));

      // Combine with initial static circulars if distinct
      const ids = new Set(mapped.map(c => c.id));
      for (const c of initialData) {
        if (!ids.has(c.id)) mapped.push(c);
      }

      setLocalCache(CACHE_KEYS.CIRCULARS, mapped);
      return mapped;
    }
  } catch (e) {
    console.error('Error fetching circulars from Supabase:', e);
  }

  return cached;
}

export async function createCircularInSupabase(circular: Partial<CampusCircular>): Promise<{ success: boolean; circular?: CampusCircular; error?: string }> {
  const newId = `circ-${Date.now()}`;
  const now = new Date().toISOString();

  const newCirc: CampusCircular = {
    id: newId,
    circularNumber: circular.circularNumber || `SHOV/${circular.issuerRole || 'HOD'}/${Date.now().toString().slice(-4)}`,
    issuerRole: circular.issuerRole || 'HOD',
    issuerName: circular.issuerName || 'Campus Official',
    issuerDesignation: circular.issuerDesignation || 'Academic Authority',
    issuerAvatarUrl: circular.issuerAvatarUrl,
    departmentCode: circular.departmentCode,
    departmentName: circular.departmentName,
    title: circular.title || 'Official Circular',
    summary: circular.summary || circular.title || '',
    content: circular.content || '',
    issuanceDate: circular.issuanceDate || now.split('T')[0],
    effectiveDate: circular.effectiveDate || now.split('T')[0],
    category: circular.category || 'ACADEMIC',
    targetAudience: circular.targetAudience || 'ALL_STUDENTS',
    urgency: circular.urgency || 'NORMAL',
    attachmentUrl: circular.attachmentUrl,
    attachmentName: circular.attachmentName,
    isAcknowledged: true,
    acknowledgementCount: 1
  };

  const cached = getLocalCache<CampusCircular[]>(CACHE_KEYS.CIRCULARS, []);
  setLocalCache(CACHE_KEYS.CIRCULARS, [newCirc, ...cached]);

  const payload = {
    circular_number: newCirc.circularNumber,
    issuer_role: newCirc.issuerRole,
    issuer_name: newCirc.issuerName,
    issuer_designation: newCirc.issuerDesignation,
    issuer_avatar_url: newCirc.issuerAvatarUrl || null,
    department_code: newCirc.departmentCode || null,
    department_name: newCirc.departmentName || null,
    title: newCirc.title,
    summary: newCirc.summary,
    content: newCirc.content,
    issuance_date: newCirc.issuanceDate,
    effective_date: newCirc.effectiveDate,
    category: newCirc.category,
    target_audience: newCirc.targetAudience,
    urgency: newCirc.urgency,
    attachment_url: newCirc.attachmentUrl || null,
    attachment_name: newCirc.attachmentName || null,
    acknowledgement_count: 1,
    created_at: now
  };

  try {
    const { data, error } = await supabase
      .from('circulars')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      logSupabaseError('createCircularInSupabase', 'circulars', error);
      return { success: true, circular: newCirc };
    }

    console.log('[Supabase DB] Circular saved to database:', data?.id || newId);
    return { success: true, circular: newCirc };
  } catch (err: any) {
    console.error('Exception creating circular in Supabase:', err);
    return { success: true, circular: newCirc };
  }
}

// ============================================================================
// 5. BROADCAST PHOTOS & NOTICES (SUPABASE `broadcast_photos` TABLE)
// ============================================================================

export async function fetchBroadcastPhotosFromSupabase(): Promise<HodVpPost[]> {
  const cached = getLocalCache<HodVpPost[]>(CACHE_KEYS.BROADCASTS, INITIAL_HOD_VP_POSTS);

  try {
    const { data, error } = await supabase
      .from('broadcast_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logSupabaseError('fetchBroadcastPhotosFromSupabase', 'broadcast_photos', error);
      return cached;
    }

    if (data && data.length > 0) {
      const mapped: HodVpPost[] = data.map((item: any) => ({
        id: item.id?.toString(),
        authorName: item.author_name,
        authorRole: item.author_role,
        authorPhotoUrl: item.author_photo_url,
        department: item.department_name || item.department_code || 'Academic Division',
        departmentCode: item.department_code,
        title: item.title,
        content: item.content,
        photoUrl: item.photo_url,
        visibility: item.visibility,
        transmissionRoute: item.transmission_route,
        routedToSummary: item.routed_to_summary,
        isConfidential: Boolean(item.is_confidential),
        likesCount: item.likes_count || 0,
        createdAt: new Date(item.created_at).toLocaleString()
      }));

      // Merge with initial posts
      const ids = new Set(mapped.map(p => p.id));
      for (const p of INITIAL_HOD_VP_POSTS) {
        if (!ids.has(p.id)) mapped.push(p);
      }

      setLocalCache(CACHE_KEYS.BROADCASTS, mapped);
      return mapped;
    }
  } catch (e) {
    console.error('Error fetching broadcast photos from Supabase:', e);
  }

  return cached;
}

export async function createBroadcastPhotoInSupabase(post: Partial<HodVpPost>): Promise<{ success: boolean; post?: HodVpPost; error?: string }> {
  const newId = `post-${Date.now()}`;
  const now = new Date().toISOString();

  const newPost: HodVpPost = {
    id: newId,
    authorName: post.authorName || 'Campus Official',
    authorRole: post.authorRole || 'STAFF',
    authorPhotoUrl: post.authorPhotoUrl,
    department: post.department || 'Computer Science & Engineering',
    departmentCode: post.departmentCode || 'CSE',
    title: post.title || 'Broadcast Notice',
    content: post.content || '',
    photoUrl: post.photoUrl,
    visibility: post.visibility || 'ALL',
    transmissionRoute: post.transmissionRoute || 'GENERAL_BROADCAST',
    routedToSummary: post.routedToSummary,
    isConfidential: Boolean(post.isConfidential),
    likesCount: 0,
    createdAt: new Date().toLocaleString()
  };

  const cached = getLocalCache<HodVpPost[]>(CACHE_KEYS.BROADCASTS, INITIAL_HOD_VP_POSTS);
  setLocalCache(CACHE_KEYS.BROADCASTS, [newPost, ...cached]);

  const payload = {
    author_name: newPost.authorName,
    author_role: newPost.authorRole,
    author_photo_url: newPost.authorPhotoUrl || null,
    department_code: newPost.departmentCode,
    department_name: newPost.department,
    title: newPost.title,
    content: newPost.content,
    photo_url: newPost.photoUrl || null,
    visibility: newPost.visibility,
    transmission_route: newPost.transmissionRoute,
    routed_to_summary: newPost.routedToSummary || null,
    is_confidential: newPost.isConfidential,
    likes_count: 0,
    created_at: now
  };

  try {
    const { data, error } = await supabase
      .from('broadcast_photos')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      logSupabaseError('createBroadcastPhotoInSupabase', 'broadcast_photos', error);
      return { success: true, post: newPost };
    }

    console.log('[Supabase DB] Broadcast photo saved to database:', data?.id || newId);
    return { success: true, post: newPost };
  } catch (err: any) {
    console.error('Exception inserting broadcast photo:', err);
    return { success: true, post: newPost };
  }
}

export async function deleteBroadcastPhotoFromSupabase(postId: string, photoUrl?: string): Promise<{ success: boolean; error?: string }> {
  const cached = getLocalCache<HodVpPost[]>(CACHE_KEYS.BROADCASTS, INITIAL_HOD_VP_POSTS);
  setLocalCache(CACHE_KEYS.BROADCASTS, cached.filter(p => p.id !== postId));

  try {
    if (photoUrl) {
      await deleteFileFromStorage(photoUrl);
    }
    const { error } = await supabase
      .from('broadcast_photos')
      .delete()
      .eq('id', postId);

    if (error) {
      logSupabaseError('deleteBroadcastPhotoFromSupabase', 'broadcast_photos', error);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting broadcast post:', err);
    return { success: true };
  }
}

// ============================================================================
// 6. STUDENT FINES & FEE CLEARANCE (SUPABASE `student_fines` TABLE)
// ============================================================================

export async function fetchFinesFromSupabase(studentId?: string): Promise<Fine[]> {
  const cached = getLocalCache<Fine[]>(CACHE_KEYS.FINES, INITIAL_FINES);

  try {
    let query = supabase.from('student_fines').select('*');
    if (studentId) {
      query = query.or(`student_id.eq.${studentId},register_number.eq.${studentId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      logSupabaseError('fetchFinesFromSupabase', 'student_fines', error);
      return cached;
    }

    if (data && data.length > 0) {
      const mapped: Fine[] = data.map((item: any) => ({
        id: item.id?.toString(),
        fineNumber: item.fine_number || `FN-${item.id}`,
        studentId: item.student_id || 'STU-10001',
        studentName: item.student_name,
        registerNumber: item.register_number,
        amount: Number(item.amount),
        reason: item.reason,
        dueDate: item.due_date,
        status: item.status,
        createdAt: item.created_at ? item.created_at.split('T')[0] : '2026-08-20',
        paidAt: item.paid_at
      }));

      setLocalCache(CACHE_KEYS.FINES, mapped);
      return mapped;
    }
  } catch (e) {
    console.error('Error fetching fines from Supabase:', e);
  }

  return cached;
}

export async function createFineInSupabase(fine: {
  studentName: string;
  registerNumber: string;
  amount: number;
  reason: string;
  dueDate: string;
  studentId?: string;
}): Promise<{ success: boolean; fine?: Fine; error?: string }> {
  const newId = `fine-${Date.now()}`;
  const fineNum = `FN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newFine: Fine = {
    id: newId,
    fineNumber: fineNum,
    studentId: fine.studentId || 'STU-10001',
    studentName: fine.studentName,
    registerNumber: fine.registerNumber,
    amount: fine.amount,
    reason: fine.reason,
    dueDate: fine.dueDate,
    status: 'PENDING',
    createdAt: new Date().toISOString().split('T')[0]
  };

  const cached = getLocalCache<Fine[]>(CACHE_KEYS.FINES, INITIAL_FINES);
  setLocalCache(CACHE_KEYS.FINES, [newFine, ...cached]);

  const payload = {
    fine_number: fineNum,
    student_id: fine.studentId || 'STU-10001',
    student_name: fine.studentName,
    register_number: fine.registerNumber,
    amount: fine.amount,
    reason: fine.reason,
    due_date: fine.dueDate,
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('student_fines')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      logSupabaseError('createFineInSupabase', 'student_fines', error);
      return { success: true, fine: newFine };
    }

    console.log('[Supabase DB] Student fine inserted into database:', data?.id || newId);
    return { success: true, fine: newFine };
  } catch (err: any) {
    console.error('Error creating fine in Supabase:', err);
    return { success: true, fine: newFine };
  }
}

export async function settleFineInSupabase(fineId: string, paymentRef: string): Promise<boolean> {
  const cached = getLocalCache<Fine[]>(CACHE_KEYS.FINES, INITIAL_FINES);
  setLocalCache(CACHE_KEYS.FINES, cached.map(f => f.id === fineId ? { ...f, status: 'PAID', paidAt: new Date().toISOString() } : f));

  try {
    const { error } = await supabase
      .from('student_fines')
      .update({
        status: 'PAID',
        paid_at: new Date().toISOString(),
        payment_reference: paymentRef,
        updated_at: new Date().toISOString()
      })
      .eq('id', fineId);

    if (error) {
      logSupabaseError('settleFineInSupabase', 'student_fines', error);
    }
    return true;
  } catch {
    return true;
  }
}

// ============================================================================
// 7. INQUIRIES & GRIEVANCES (SUPABASE `inquiries` TABLE)
// ============================================================================

export async function fetchInquiriesFromSupabase(filters?: {
  studentId?: string;
  targetAuthority?: string;
}): Promise<StudentInquiry[]> {
  const cached = getLocalCache<StudentInquiry[]>(CACHE_KEYS.INQUIRIES, INITIAL_STUDENT_INQUIRIES);

  try {
    let query = supabase.from('inquiries').select('*');
    if (filters?.studentId) {
      query = query.or(`student_id.eq.${filters.studentId},register_number.eq.${filters.studentId}`);
    }
    if (filters?.targetAuthority && filters.targetAuthority !== 'ALL') {
      query = query.eq('target_authority', filters.targetAuthority);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      logSupabaseError('fetchInquiriesFromSupabase', 'inquiries', error);
      return cached;
    }

    if (data && data.length > 0) {
      const mapped: StudentInquiry[] = data.map((item: any) => ({
        id: item.id?.toString(),
        studentId: item.student_id || 'STU-10001',
        studentName: item.student_name,
        registerNumber: item.register_number,
        department: (item.department || item.target_department_code || 'CSE') as DepartmentCode,
        targetAuthority: item.target_authority,
        targetDepartmentCode: item.target_department_code,
        targetCouncilMemberId: item.target_council_member_id,
        category: item.category,
        subject: item.subject,
        message: item.message,
        priority: item.priority,
        status: item.status,
        capturedPhotoUrl: item.photo_url || item.captured_photo_url,
        chatThread: Array.isArray(item.chat_history) ? item.chat_history : [],
        adminResponse: item.admin_response,
        createdAt: item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now',
        updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleString() : 'Just now'
      }));

      // Combine with initial mock inquiries
      const ids = new Set(mapped.map(i => i.id));
      for (const init of INITIAL_STUDENT_INQUIRIES) {
        if (!ids.has(init.id)) mapped.push(init);
      }

      setLocalCache(CACHE_KEYS.INQUIRIES, mapped);
      return mapped;
    }
  } catch (e) {
    console.error('Error fetching inquiries from Supabase:', e);
  }

  return cached;
}

export async function createInquiryInSupabase(inquiry: Partial<StudentInquiry>): Promise<{ success: boolean; inquiry?: StudentInquiry; error?: string }> {
  const newId = `inq-${Date.now()}`;
  const now = new Date().toISOString();

  const newInq: StudentInquiry = {
    id: newId,
    studentId: inquiry.studentId || 'STU-10001',
    studentName: inquiry.studentName || 'Student',
    registerNumber: inquiry.registerNumber || '23CS101',
    department: (inquiry.department || inquiry.targetDepartmentCode || 'CSE') as DepartmentCode,
    targetAuthority: inquiry.targetAuthority || 'HOD',
    targetDepartmentCode: inquiry.targetDepartmentCode || 'CSE',
    targetCouncilMemberId: inquiry.targetCouncilMemberId,
    category: inquiry.category || 'ACADEMIC',
    subject: inquiry.subject || 'Student Inquiry',
    message: inquiry.message || '',
    priority: inquiry.priority || 'MEDIUM',
    status: 'PENDING',
    capturedPhotoUrl: inquiry.capturedPhotoUrl,
    chatThread: [],
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString()
  };

  const cached = getLocalCache<StudentInquiry[]>(CACHE_KEYS.INQUIRIES, INITIAL_STUDENT_INQUIRIES);
  setLocalCache(CACHE_KEYS.INQUIRIES, [newInq, ...cached]);

  const payload = {
    id: newId,
    student_id: newInq.studentId,
    student_name: newInq.studentName,
    register_number: newInq.registerNumber,
    department: newInq.department,
    target_authority: newInq.targetAuthority,
    target_department_code: newInq.targetDepartmentCode,
    target_council_member_id: newInq.targetCouncilMemberId || null,
    category: newInq.category,
    subject: newInq.subject,
    message: newInq.message,
    priority: newInq.priority,
    status: 'PENDING',
    photo_url: newInq.capturedPhotoUrl || null,
    chat_history: [],
    created_at: now,
    updated_at: now
  };

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      logSupabaseError('createInquiryInSupabase', 'inquiries', error);
      return { success: true, inquiry: newInq };
    }

    console.log('[Supabase DB] Inquiry submitted to database:', data?.id || newId);
    return { success: true, inquiry: newInq };
  } catch (err: any) {
    console.error('Exception submitting inquiry to Supabase:', err);
    return { success: true, inquiry: newInq };
  }
}

// ============================================================================
// 8. GATE TURNSTILE SCANS (SUPABASE `gate_scans` TABLE)
// ============================================================================

export async function logGateScanToSupabase(log: {
  registerNumber: string;
  studentName: string;
  departmentName?: string;
  studentPhotoUrl?: string;
  capturedThumbnailUrl?: string;
  verifierName: string;
  result: string;
  location: string;
  notes?: string;
}): Promise<boolean> {
  try {
    const payload = {
      register_number: log.registerNumber,
      student_name: log.studentName,
      department_name: log.departmentName || null,
      student_photo_url: log.studentPhotoUrl || null,
      captured_thumbnail_url: log.capturedThumbnailUrl || null,
      verifier_name: log.verifierName,
      result: log.result,
      location: log.location,
      notes: log.notes || null,
      scanned_at: new Date().toISOString()
    };

    const { error } = await supabase.from('gate_scans').insert([payload]);
    if (error) {
      logSupabaseError('logGateScanToSupabase', 'gate_scans', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to log gate scan:', e);
    return false;
  }
}

export async function fetchGateScansFromSupabase(): Promise<VerificationLog[]> {
  try {
    const { data, error } = await supabase
      .from('gate_scans')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(50);

    if (error) {
      logSupabaseError('fetchGateScansFromSupabase', 'gate_scans', error);
      return INITIAL_VERIFICATION_LOGS;
    }

    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id?.toString(),
        studentId: item.student_id || 'st-001',
        registerNumber: item.register_number,
        studentName: item.student_name,
        departmentName: item.department_name || 'Academic',
        photoUrl: item.student_photo_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        verifiedBy: 'u-staff-1',
        verifierName: item.verifier_name || 'Security Staff Officer',
        result: item.result,
        status: item.result,
        location: item.location,
        timestamp: item.scanned_at,
        studentPhotoUrl: item.student_photo_url,
        capturedThumbnailUrl: item.captured_thumbnail_url
      }));
    }
  } catch {
    // fallback
  }
  return INITIAL_VERIFICATION_LOGS;
}

// Upload image or document to Supabase storage private bucket 'app-files'
export async function uploadCampusImageToSupabase(
  imageDataUri: string,
  folder: 'broadcasts' | 'avatars' | 'scans' | 'attachments' | 'circulars' = 'broadcasts',
  itemId: string = 'general'
): Promise<string> {
  try {
    if (!imageDataUri) return '';
    // Upload into 'app-files' private bucket
    const result = await uploadToSupabaseStorage(imageDataUri, {
      featureName: folder,
      itemId,
      expiresInSeconds: 60 * 60 * 24 * 7 // 7 days signed URL
    });

    if (result.success && result.signedUrl) {
      return result.signedUrl;
    }
    return result.signedUrl || imageDataUri;
  } catch (e) {
    console.warn('Storage fallback:', e);
    return imageDataUri;
  }
}

