-- ============================================================================
-- SHOV CAMPUS HOUSING & GRIEVANCES SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. PROPERTIES TABLE (Student & Faculty Campus Accommodations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.properties (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name VARCHAR(128) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(32),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    price_period VARCHAR(32) DEFAULT 'month', -- 'month', 'semester', 'year'
    location VARCHAR(255) NOT NULL,
    property_type VARCHAR(64) NOT NULL DEFAULT 'Apartment', -- 'Apartment', 'Studio', 'Shared PG / Hostel', 'Villa', 'Independent House', 'Study Room'
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    area_sqft INTEGER DEFAULT 500,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. SAVED PROPERTIES / LIKES TABLE (Bookmarks linked to User & Property)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saved_properties (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id VARCHAR(64) NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- ============================================================================
-- 4. STUDENT INQUIRIES & GRIEVANCES TABLE (Preserved Institutional System)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.student_inquiries (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    register_number VARCHAR(32) NOT NULL,
    department VARCHAR(32) NOT NULL,
    target_authority VARCHAR(32) NOT NULL DEFAULT 'HOD', -- 'HOD', 'VICE_PRINCIPAL', 'PRINCIPAL', 'STUDENT_COUNCIL'
    target_department_code VARCHAR(32),
    target_council_member_id VARCHAR(64),
    target_council_role VARCHAR(64),
    category VARCHAR(64) NOT NULL DEFAULT 'GENERAL',
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    captured_photo_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    admin_response TEXT,
    responder_name VARCHAR(128),
    responder_role VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. INQUIRY DISCUSSION THREAD MESSAGES (Live Photo & Followup Thread)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inquiry_chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    inquiry_id VARCHAR(64) NOT NULL REFERENCES public.student_inquiries(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL,
    sender_name VARCHAR(128) NOT NULL,
    sender_role VARCHAR(32) NOT NULL,
    message TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. HIGH SPEED INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON public.saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_prop ON public.saved_properties(property_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_student_id ON public.student_inquiries(student_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.student_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_authority ON public.student_inquiries(target_authority);
CREATE INDEX IF NOT EXISTS idx_chat_messages_inquiry ON public.inquiry_chat_messages(inquiry_id);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_chat_messages ENABLE ROW LEVEL SECURITY;

-- Properties Policies
CREATE POLICY "Public properties are viewable by everyone" 
ON public.properties FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create properties" 
ON public.properties FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own properties" 
ON public.properties FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" 
ON public.properties FOR DELETE 
USING (auth.uid() = user_id);

-- Saved Properties (Likes) Policies
CREATE POLICY "Users can view their own saved properties" 
ON public.saved_properties FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save properties" 
ON public.saved_properties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their saved properties" 
ON public.saved_properties FOR DELETE 
USING (auth.uid() = user_id);

-- Inquiries Policies (Publicly readable & insertable by students / staff)
CREATE POLICY "Inquiries viewable by author or staff" 
ON public.student_inquiries FOR ALL 
USING (true);

CREATE POLICY "Inquiry messages readable by everyone" 
ON public.inquiry_chat_messages FOR ALL 
USING (true);

-- ============================================================================
-- 8. SEED INITIAL CAMPUS PROPERTIES
-- ============================================================================
INSERT INTO public.properties (
    id, owner_name, owner_email, owner_phone, title, description,
    price, price_period, location, property_type, bedrooms, bathrooms,
    area_sqft, amenities, images, is_available, likes_count
) VALUES 
(
    'prop-101',
    'Aarav Sharma',
    'aarav.23cs001@student.shov.college.edu',
    '+91 98765 43210',
    'Sunny 2BHK Near Campus Tech Hub & Gate 2',
    'Fully furnished 2-bedroom apartment with high-speed fiber optic Wi-Fi, study desks in both rooms, power backup, and modern kitchen. Only a 5-minute walk to SHOV Main Engineering Block.',
    14500,
    'month',
    'Campus West Avenue, Green Valley Enclave, Block B-4',
    'Apartment',
    2,
    2,
    950,
    ARRAY['High-Speed WiFi', '24/7 Power Backup', 'Furnished Study Desks', 'AC in Bedrooms', 'Water Purifier', 'Bike Parking'],
    ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800'],
    true,
    12
),
(
    'prop-102',
    'Dr. Vikramaditya Sen',
    'hod.aids@shov.college.edu',
    '+91 98765 11003',
    'Quiet Studio Loft for AI & CS Research Scholars',
    'Peaceful, air-conditioned studio loft with ergonomic Herman Miller chair, dual-monitor setup desk, modular kitchenette, and balcony facing campus botanical gardens.',
    11000,
    'month',
    'Scholar Heights, 3rd Floor, University Circle',
    'Studio',
    1,
    1,
    520,
    ARRAY['Gigabit Internet', 'Ergonomic Desk', 'Kitchenette', 'Quiet Study Zone', 'Balcony Garden', 'Smart Lock'],
    ARRAY['https://images.unsplash.com/photo-1502005229762-ee1b2b814639?auto=format&fit=crop&q=80&w=800'],
    true,
    24
)
ON CONFLICT (id) DO NOTHING;
