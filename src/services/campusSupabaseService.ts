import { supabase } from './supabase';
import { 
  CampusCircular, 
  HodVpPost, 
  Fine, 
  Payment, 
  VerificationLog, 
  User, 
  DepartmentCode,
  UserRole
} from '../types';
import { INITIAL_HOD_CIRCULARS, INITIAL_VP_CIRCULARS } from '../data/circularsData';
import { INITIAL_HOD_VP_POSTS, INITIAL_FINES, INITIAL_VERIFICATION_LOGS } from '../data/mockData';

// ============================================================================
// 1. USER PROFILES & PROFILE UPDATES
// ============================================================================

export async function fetchUserProfileFromSupabase(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      username: data.register_number || data.email.split('@')[0],
      role: data.role as UserRole,
      departmentName: data.department_name,
      departmentId: data.department_code,
      designation: data.designation,
      studentId: data.student_id || data.register_number,
      phoneNumber: data.phone_number,
      avatarUrl: data.avatar_url
    };
  } catch (e) {
    console.warn('Error fetching profile from Supabase:', e);
    return null;
  }
}

export async function updateUserProfileInSupabase(
  userId: string, 
  updates: Partial<{
    name: string;
    phone_number: string;
    avatar_url: string;
    department_code: string;
    department_name: string;
    designation: string;
    register_number: string;
    blood_group: string;
    guardian_phone: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.warn('Profile update error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update profile.' };
  }
}

// ============================================================================
// 2. CIRCULARS & DIRECTIVES (VP & HOD)
// ============================================================================

export async function fetchCircularsFromSupabase(): Promise<CampusCircular[]> {
  try {
    const { data, error } = await supabase
      .from('circulars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [...INITIAL_VP_CIRCULARS, ...INITIAL_HOD_CIRCULARS];
    }

    return data.map((item: any) => ({
      id: item.id,
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
  } catch (e) {
    console.warn('Fallback to local circulars:', e);
    return [...INITIAL_VP_CIRCULARS, ...INITIAL_HOD_CIRCULARS];
  }
}

export async function createCircularInSupabase(circular: Partial<CampusCircular>): Promise<{ success: boolean; circular?: CampusCircular; error?: string }> {
  try {
    const payload = {
      circular_number: circular.circularNumber || `SHOV/${circular.issuerRole}/${Date.now().toString().slice(-4)}`,
      issuer_role: circular.issuerRole || 'HOD',
      issuer_name: circular.issuerName || 'Campus Official',
      issuer_designation: circular.issuerDesignation || 'Academic Authority',
      issuer_avatar_url: circular.issuerAvatarUrl,
      department_code: circular.departmentCode,
      department_name: circular.departmentName,
      title: circular.title,
      summary: circular.summary || circular.title,
      content: circular.content,
      issuance_date: circular.issuanceDate || new Date().toISOString().split('T')[0],
      effective_date: circular.effectiveDate || new Date().toISOString().split('T')[0],
      category: circular.category || 'ACADEMIC',
      target_audience: circular.targetAudience || 'ALL_STUDENTS',
      urgency: circular.urgency || 'NORMAL',
      attachment_url: circular.attachmentUrl,
      attachment_name: circular.attachmentName,
      acknowledgement_count: 1
    };

    const { data, error } = await supabase
      .from('circulars')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Failed to insert circular:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      circular: {
        id: data.id,
        circularNumber: data.circular_number,
        issuerRole: data.issuer_role,
        issuerName: data.issuer_name,
        issuerDesignation: data.issuer_designation,
        issuerAvatarUrl: data.issuer_avatar_url,
        departmentCode: data.department_code,
        departmentName: data.department_name,
        title: data.title,
        summary: data.summary,
        content: data.content,
        issuanceDate: data.issuance_date,
        effectiveDate: data.effective_date,
        category: data.category,
        targetAudience: data.target_audience,
        urgency: data.urgency,
        attachmentName: data.attachment_name,
        isAcknowledged: true,
        acknowledgementCount: data.acknowledgement_count
      }
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error publishing circular to Supabase.' };
  }
}

// ============================================================================
// 3. BROADCAST PHOTOS & LIVE CAMERA DISPATCHES
// ============================================================================

export async function fetchBroadcastPhotosFromSupabase(): Promise<HodVpPost[]> {
  try {
    const { data, error } = await supabase
      .from('broadcast_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_HOD_VP_POSTS;
    }

    return data.map((item: any) => ({
      id: item.id,
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
      isConfidential: item.is_confidential,
      likesCount: item.likes_count || 0,
      createdAt: new Date(item.created_at).toLocaleString()
    }));
  } catch (e) {
    console.warn('Fallback to local posts:', e);
    return INITIAL_HOD_VP_POSTS;
  }
}

export async function createBroadcastPhotoInSupabase(post: Partial<HodVpPost>): Promise<{ success: boolean; post?: HodVpPost; error?: string }> {
  try {
    const payload = {
      author_name: post.authorName || 'Campus Official',
      author_role: post.authorRole || 'STAFF',
      author_photo_url: post.authorPhotoUrl,
      department_code: post.departmentCode,
      department_name: post.department,
      title: post.title,
      content: post.content,
      photo_url: post.photoUrl,
      visibility: post.visibility || 'ALL',
      transmission_route: post.transmissionRoute || 'GENERAL_BROADCAST',
      routed_to_summary: post.routedToSummary,
      is_confidential: Boolean(post.isConfidential),
      likes_count: 0
    };

    const { data, error } = await supabase
      .from('broadcast_photos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Failed to insert broadcast photo:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      post: {
        id: data.id,
        authorName: data.author_name,
        authorRole: data.author_role,
        authorPhotoUrl: data.author_photo_url,
        department: data.department_name || data.department_code,
        departmentCode: data.department_code,
        title: data.title,
        content: data.content,
        photoUrl: data.photo_url,
        visibility: data.visibility,
        transmissionRoute: data.transmission_route,
        routedToSummary: data.routed_to_summary,
        isConfidential: data.is_confidential,
        likesCount: data.likes_count,
        createdAt: new Date(data.created_at).toLocaleString()
      }
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error inserting broadcast photo.' };
  }
}

// Upload base64 / blob image to Supabase storage or return optimized data URI
export async function uploadCampusImageToSupabase(
  imageDataUri: string,
  folder: 'broadcasts' | 'avatars' | 'scans' = 'broadcasts'
): Promise<string> {
  try {
    // If not a data URI, return as is
    if (!imageDataUri.startsWith('data:')) return imageDataUri;

    // Convert data URI to Blob
    const response = await fetch(imageDataUri);
    const blob = await response.blob();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('campus-dispatches')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.warn('Supabase storage upload notice (using direct payload):', uploadError.message);
      return imageDataUri; // Graceful fallback
    }

    const { data } = supabase.storage.from('campus-dispatches').getPublicUrl(fileName);
    return data.publicUrl || imageDataUri;
  } catch (e) {
    console.warn('Storage fallback:', e);
    return imageDataUri;
  }
}

// ============================================================================
// 4. STUDENT FINES & PAYMENT SETTLEMENT
// ============================================================================

export async function fetchFinesFromSupabase(): Promise<Fine[]> {
  try {
    const { data, error } = await supabase
      .from('student_fines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_FINES;
    }

    return data.map((item: any) => ({
      id: item.id,
      fineNumber: item.fine_number,
      studentId: item.student_id || 'st-001',
      studentName: item.student_name,
      registerNumber: item.register_number,
      amount: Number(item.amount),
      reason: item.reason,
      dueDate: item.due_date,
      status: item.status,
      createdAt: new Date(item.created_at).toISOString().split('T')[0],
      paidAt: item.paid_at
    }));
  } catch (e) {
    return INITIAL_FINES;
  }
}

export async function createFineInSupabase(fine: {
  studentName: string;
  registerNumber: string;
  amount: number;
  reason: string;
  dueDate: string;
}): Promise<{ success: boolean; fine?: Fine; error?: string }> {
  try {
    const payload = {
      fine_number: `FN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      student_name: fine.studentName,
      register_number: fine.registerNumber,
      amount: fine.amount,
      reason: fine.reason,
      due_date: fine.dueDate,
      status: 'PENDING'
    };

    const { data, error } = await supabase
      .from('student_fines')
      .insert([payload])
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      fine: {
        id: data.id,
        fineNumber: data.fine_number,
        studentId: data.student_id || 'st-custom',
        studentName: data.student_name,
        registerNumber: data.register_number,
        amount: Number(data.amount),
        reason: data.reason,
        dueDate: data.due_date,
        status: data.status,
        createdAt: data.created_at.split('T')[0]
      }
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error inserting fine.' };
  }
}

export async function settleFineInSupabase(fineId: string, paymentRef: string): Promise<boolean> {
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

    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// 5. GATE SCANS & TURNSTILE LOGGING
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
      department_name: log.departmentName,
      student_photo_url: log.studentPhotoUrl,
      captured_thumbnail_url: log.capturedThumbnailUrl,
      verifier_name: log.verifierName,
      result: log.result,
      location: log.location,
      notes: log.notes,
      scanned_at: new Date().toISOString()
    };

    const { error } = await supabase.from('gate_scans').insert([payload]);
    if (error) {
      console.warn('Gate scan logging note:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Failed to log gate scan:', e);
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

    if (error || !data || data.length === 0) {
      return INITIAL_VERIFICATION_LOGS;
    }

    return data.map((item: any) => ({
      id: item.id,
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
  } catch {
    return INITIAL_VERIFICATION_LOGS;
  }
}
