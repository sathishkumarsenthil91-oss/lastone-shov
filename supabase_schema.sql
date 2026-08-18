-- ============================================================================
-- SHOV CAMPUS DIGITAL IDENTITY & GOVERNANCE SYSTEM
-- COMPLETE SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this in your Supabase Project -> SQL Editor
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE 1: PROFILES (User role, department, roll number, avatar)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'STAFF', 'HOD', 'VICE_PRINCIPAL', 'ADMIN', 'ELECTION_COUNCIL')),
  department_code TEXT DEFAULT 'CSE',
  department_name TEXT DEFAULT 'Computer Science & Engineering',
  designation TEXT,
  student_id TEXT,
  register_number TEXT,
  course TEXT,
  year_of_study INT,
  blood_group TEXT,
  guardian_phone TEXT,
  avatar_url TEXT,
  id_status TEXT DEFAULT 'ACTIVE' CHECK (id_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'EXPIRED')),
  council_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_dept ON public.profiles(department_code);
CREATE INDEX IF NOT EXISTS idx_profiles_reg ON public.profiles(register_number);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their profile on signup" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- Automatically creates a row in public.profiles when user signs up in auth.users
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone_number,
    role,
    department_code,
    department_name,
    designation,
    register_number,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phoneNumber',
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
    COALESCE(NEW.raw_user_meta_data->>'departmentCode', 'CSE'),
    COALESCE(NEW.raw_user_meta_data->>'departmentName', 'Computer Science & Engineering'),
    NEW.raw_user_meta_data->>'designation',
    NEW.raw_user_meta_data->>'registerNumber',
    COALESCE(NEW.raw_user_meta_data->>'avatarUrl', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300')
  )
  ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department_code = EXCLUDED.department_code;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- TABLE 2: CIRCULARS (Notices & Orders by Vice Principal, HOD, and Staff)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.circulars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circular_number TEXT NOT NULL UNIQUE,
  issuer_role TEXT NOT NULL CHECK (issuer_role IN ('VICE_PRINCIPAL', 'HOD', 'STAFF', 'ADMIN')),
  issuer_name TEXT NOT NULL,
  issuer_designation TEXT NOT NULL,
  issuer_avatar_url TEXT,
  department_code TEXT,
  department_name TEXT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  issuance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('ACADEMIC', 'DISCIPLINARY', 'EXAMINATION', 'GATE_SECURITY', 'FACILITY', 'POLICY', 'EVENT')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('ALL_STUDENTS', 'ALL_FACULTY', 'ALL_STAFF', 'DEPT_SPECIFIC', 'HODS_ONLY')),
  urgency TEXT NOT NULL DEFAULT 'NORMAL' CHECK (urgency IN ('NORMAL', 'URGENT', 'HIGH_PRIORITY', 'MANDATORY')),
  attachment_url TEXT,
  attachment_name TEXT,
  acknowledgement_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circulars_audience ON public.circulars(target_audience);
CREATE INDEX IF NOT EXISTS idx_circulars_dept ON public.circulars(department_code);
CREATE INDEX IF NOT EXISTS idx_circulars_created ON public.circulars(created_at DESC);

ALTER TABLE public.circulars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view circulars" 
ON public.circulars FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authorized roles can create circulars" 
ON public.circulars FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('VICE_PRINCIPAL', 'HOD', 'ADMIN', 'STAFF')
  )
);

CREATE POLICY "Issuers can update circulars" 
ON public.circulars FOR UPDATE 
TO authenticated 
USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('VICE_PRINCIPAL', 'ADMIN')
  )
);


-- ============================================================================
-- TABLE 3: BROADCAST_PHOTOS (Live Camera Transmission between VP, HOD, & Staff)
-- ============================================================================
-- Transmission Rules:
-- 1. HOD_TO_ALL_STAFF: Dispatches from HOD stream instantly to all gate/campus staff
-- 2. VP_TO_HOD_ONLY: Executive orders from VP route exclusively to HOD terminals
-- 3. STAFF_TO_STAFF_THEN_HOD: Turnstile alerts propagate to other staff and escalate to HOD
CREATE TABLE IF NOT EXISTS public.broadcast_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('VICE_PRINCIPAL', 'HOD', 'STAFF', 'ADMIN')),
  author_photo_url TEXT,
  department_code TEXT,
  department_name TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  attachment_name TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('ALL', 'FACULTY_ONLY', 'DEPT_ONLY', 'HOD_VP_CONFIDENTIAL')),
  transmission_route TEXT NOT NULL DEFAULT 'GENERAL_BROADCAST' CHECK (
    transmission_route IN ('HOD_TO_ALL_STAFF', 'VP_TO_HOD_ONLY', 'STAFF_TO_STAFF_THEN_HOD', 'GENERAL_BROADCAST')
  ),
  routed_to_summary TEXT,
  is_confidential BOOLEAN DEFAULT FALSE,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcast_route ON public.broadcast_photos(transmission_route);
CREATE INDEX IF NOT EXISTS idx_broadcast_created ON public.broadcast_photos(created_at DESC);

ALTER TABLE public.broadcast_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view broadcast photos per routing" 
ON public.broadcast_photos FOR SELECT 
TO authenticated 
USING (
  -- VP Confidential posts only for VP and HOD
  CASE 
    WHEN is_confidential = TRUE OR transmission_route = 'VP_TO_HOD_ONLY' THEN
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('VICE_PRINCIPAL', 'HOD', 'ADMIN'))
    ELSE TRUE
  END
);

CREATE POLICY "Faculty and staff can publish broadcast photos" 
ON public.broadcast_photos FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('VICE_PRINCIPAL', 'HOD', 'STAFF', 'ADMIN')
  )
);


-- ============================================================================
-- TABLE 4: STUDENT_FINES (Disciplinary Assessments, Fines & Payment Clearing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.student_fines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fine_number TEXT NOT NULL UNIQUE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  register_number TEXT NOT NULL,
  department_code TEXT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  reason TEXT NOT NULL,
  due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'WAIVED', 'CANCELLED')),
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_by_name TEXT,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fines_student ON public.student_fines(student_id);
CREATE INDEX IF NOT EXISTS idx_fines_reg ON public.student_fines(register_number);
CREATE INDEX IF NOT EXISTS idx_fines_status ON public.student_fines(status);

ALTER TABLE public.student_fines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own fines" 
ON public.student_fines FOR SELECT 
TO authenticated 
USING (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('STAFF', 'HOD', 'VICE_PRINCIPAL', 'ADMIN')
  )
);

CREATE POLICY "Staff, HODs and Admins can create fines" 
ON public.student_fines FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('STAFF', 'HOD', 'VICE_PRINCIPAL', 'ADMIN')
  )
);

CREATE POLICY "Staff, HODs, and Admins can update fine status" 
ON public.student_fines FOR UPDATE 
TO authenticated 
USING (
  student_id = auth.uid() OR -- allows payment receipt update
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('STAFF', 'HOD', 'VICE_PRINCIPAL', 'ADMIN')
  )
);


-- ============================================================================
-- TABLE 5: GATE_SCANS (Turnstile QR & Live Camera Verification Logs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gate_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  register_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  department_name TEXT,
  student_photo_url TEXT,
  captured_thumbnail_url TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verifier_name TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('SUCCESS', 'DENIED', 'LATE', 'EXPIRED', 'SUSPENDED', 'BANNED', 'INVALID_TOKEN', 'INACTIVE')),
  scan_status TEXT,
  scan_event TEXT DEFAULT 'ENTRY',
  location TEXT NOT NULL DEFAULT 'Main Campus Gate 1',
  notes TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gate_scans_reg ON public.gate_scans(register_number);
CREATE INDEX IF NOT EXISTS idx_gate_scans_time ON public.gate_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_gate_scans_result ON public.gate_scans(result);

ALTER TABLE public.gate_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and higher can view and log gate scans" 
ON public.gate_scans FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('STAFF', 'HOD', 'VICE_PRINCIPAL', 'ADMIN')
  )
);

CREATE POLICY "Students can view their own gate entries" 
ON public.gate_scans FOR SELECT 
TO authenticated 
USING (student_id = auth.uid());


-- ============================================================================
-- 6. ENABLE SUPABASE REALTIME REPLICATION
-- Allows instant live photo broadcasts & live scan updates without page refreshes
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circulars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gate_scans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_fines;
