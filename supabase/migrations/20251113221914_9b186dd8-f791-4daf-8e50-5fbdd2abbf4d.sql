-- =====================================================
-- CONSOLIDATED WALI SYSTEM MIGRATION
-- Creates Wali tables and adds necessary columns to existing tables
-- =====================================================

-- =====================================================
-- PART 1: CREATE WALI TABLES
-- =====================================================

-- Create wali_registrations table
CREATE TABLE IF NOT EXISTS public.wali_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship_to_members TEXT,
  id_document_url TEXT,
  proof_of_relationship_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create wali_onboarding_progress table
CREATE TABLE IF NOT EXISTS public.wali_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  step_personal_info BOOLEAN NOT NULL DEFAULT false,
  step_verification BOOLEAN NOT NULL DEFAULT false,
  step_training BOOLEAN NOT NULL DEFAULT false,
  step_agreement BOOLEAN NOT NULL DEFAULT false,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wali_id)
);

-- Create wali_suspensions table
CREATE TABLE IF NOT EXISTS public.wali_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  suspension_type TEXT NOT NULL CHECK (suspension_type IN ('warning', 'temporary', 'permanent')),
  suspended_by UUID NOT NULL REFERENCES auth.users(id),
  lifted_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  lifted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PART 2: ADD COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add Wali-related columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS wali_registration_id UUID REFERENCES public.wali_registrations(id),
  ADD COLUMN IF NOT EXISTS is_wali BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS supervised_by_wali_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS wali_approval_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS wali_supervision_level TEXT CHECK (wali_supervision_level IN ('none', 'basic', 'standard', 'strict'));

-- Add Wali-related columns to family_members table
ALTER TABLE public.family_members 
  ADD COLUMN IF NOT EXISTS wali_registration_id UUID REFERENCES public.wali_registrations(id),
  ADD COLUMN IF NOT EXISTS can_approve_matches BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_view_messages BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_supervise_calls BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS supervision_level TEXT DEFAULT 'basic' CHECK (supervision_level IN ('basic', 'standard', 'strict'));

-- =====================================================
-- PART 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for wali_registrations
CREATE INDEX IF NOT EXISTS idx_wali_registrations_user_id ON public.wali_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_wali_registrations_status ON public.wali_registrations(status);
CREATE INDEX IF NOT EXISTS idx_wali_registrations_email ON public.wali_registrations(email);

-- Indexes for wali_onboarding_progress
CREATE INDEX IF NOT EXISTS idx_wali_onboarding_wali_id ON public.wali_onboarding_progress(wali_id);
CREATE INDEX IF NOT EXISTS idx_wali_onboarding_status ON public.wali_onboarding_progress(status);

-- Indexes for wali_suspensions
CREATE INDEX IF NOT EXISTS idx_wali_suspensions_wali_id ON public.wali_suspensions(wali_id);
CREATE INDEX IF NOT EXISTS idx_wali_suspensions_is_active ON public.wali_suspensions(is_active);

-- Indexes for new profile columns
CREATE INDEX IF NOT EXISTS idx_profiles_wali_registration ON public.profiles(wali_registration_id) WHERE wali_registration_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_is_wali ON public.profiles(is_wali) WHERE is_wali = true;
CREATE INDEX IF NOT EXISTS idx_profiles_supervised_by ON public.profiles(supervised_by_wali_id) WHERE supervised_by_wali_id IS NOT NULL;

-- Indexes for new family_members columns
CREATE INDEX IF NOT EXISTS idx_family_wali_registration ON public.family_members(wali_registration_id) WHERE wali_registration_id IS NOT NULL;

-- =====================================================
-- PART 4: CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER set_wali_registrations_updated_at
  BEFORE UPDATE ON public.wali_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_wali_onboarding_updated_at
  BEFORE UPDATE ON public.wali_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_wali_suspensions_updated_at
  BEFORE UPDATE ON public.wali_suspensions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PART 5: ENABLE RLS
-- =====================================================

ALTER TABLE public.wali_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_suspensions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 6: CREATE RLS POLICIES
-- =====================================================

-- Policies for wali_registrations
CREATE POLICY "Users can view their own wali registration"
  ON public.wali_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wali registration"
  ON public.wali_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending registration"
  ON public.wali_registrations FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all wali registrations"
  ON public.wali_registrations FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update wali registrations"
  ON public.wali_registrations FOR UPDATE
  USING (is_admin(auth.uid()));

-- Policies for wali_onboarding_progress
CREATE POLICY "Walis can view their own onboarding progress"
  ON public.wali_onboarding_progress FOR SELECT
  USING (auth.uid() = wali_id);

CREATE POLICY "Walis can manage their own onboarding progress"
  ON public.wali_onboarding_progress FOR ALL
  USING (auth.uid() = wali_id);

CREATE POLICY "Admins can view all onboarding progress"
  ON public.wali_onboarding_progress FOR SELECT
  USING (is_admin(auth.uid()));

-- Policies for wali_suspensions
CREATE POLICY "Walis can view their own suspensions"
  ON public.wali_suspensions FOR SELECT
  USING (auth.uid() = wali_id);

CREATE POLICY "Admins can manage all suspensions"
  ON public.wali_suspensions FOR ALL
  USING (is_admin(auth.uid()));

-- =====================================================
-- PART 7: CREATE HELPER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_wali_suspended(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.wali_suspensions
    WHERE wali_id = p_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;