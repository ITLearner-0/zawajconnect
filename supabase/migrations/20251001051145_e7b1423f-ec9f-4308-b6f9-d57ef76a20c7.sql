-- Fix security audit log trigger to handle NULL auth.uid()
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log high-security operations
  IF TG_TABLE_NAME IN ('family_contact_secure', 'family_members', 'user_verifications') THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action_type,
      table_name,
      record_id,
      additional_data
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'timestamp', now(),
        'operation', TG_OP,
        'table', TG_TABLE_NAME
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Now run the corrected migration
-- 1. CREATE SECURE FAMILY CONTACT TABLE
CREATE TABLE IF NOT EXISTS public.family_contact_secure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL UNIQUE REFERENCES public.family_members(id) ON DELETE CASCADE,
  encrypted_email TEXT,
  encrypted_phone TEXT,
  contact_visibility TEXT NOT NULL DEFAULT 'wali_only' CHECK (contact_visibility IN ('wali_only', 'family', 'private')),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.family_contact_secure ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies
DROP POLICY IF EXISTS "Ultra secure family contact access with definer functions" ON public.family_contact_secure;
DROP POLICY IF EXISTS "Wali can update secure contact info" ON public.family_contact_secure;

CREATE POLICY "Ultra secure family contact access with definer functions"
ON public.family_contact_secure
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_members fm,
         get_user_verification_status_secure(auth.uid()) v1,
         LATERAL get_user_verification_status_secure(fm.user_id) v2
    WHERE fm.id = family_contact_secure.family_member_id
    AND (fm.user_id = auth.uid() OR fm.invited_user_id = auth.uid())
    AND fm.is_wali = true
    AND fm.invitation_status = 'accepted'
    AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
    AND v1.email_verified = true
    AND v1.id_verified = true
    AND v1.verification_score >= 85
    AND v2.email_verified = true
    AND v2.verification_score >= 60
    AND family_contact_secure.contact_visibility = 'wali_only'
  )
);

CREATE POLICY "Wali can update secure contact info"
ON public.family_contact_secure
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_members fm,
         public.user_verifications uv
    WHERE fm.id = family_contact_secure.family_member_id
    AND fm.user_id = auth.uid()
    AND fm.is_wali = true
    AND uv.user_id = auth.uid()
    AND uv.id_verified = true
    AND uv.verification_score >= 90
    AND fm.created_at > (now() - INTERVAL '90 days')
  )
);

-- 2. CREATE AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.family_contact_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL,
  access_details JSONB NOT NULL,
  access_timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_contact_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view family contact audit logs" ON public.family_contact_audit_log;

CREATE POLICY "Only admins can view family contact audit logs"
ON public.family_contact_audit_log
FOR SELECT
USING (is_admin(auth.uid()));

-- 3. UPDATE FAMILY_MEMBERS RLS POLICIES
DROP POLICY IF EXISTS "Family members secure access with contact protection" ON public.family_members;
DROP POLICY IF EXISTS "Users can create family member invitations" ON public.family_members;
DROP POLICY IF EXISTS "Users can update own family member records" ON public.family_members;

CREATE POLICY "Family members secure access with contact protection"
ON public.family_members
FOR SELECT
USING (
  (auth.uid() = user_id OR auth.uid() = invited_user_id)
  AND invitation_status = 'accepted'
  AND invitation_accepted_at > (now() - INTERVAL '14 days')
  AND EXISTS (
    SELECT 1 FROM get_user_verification_status_secure(auth.uid()) v
    WHERE v.email_verified = true
    AND v.verification_score >= 60
  )
);

CREATE POLICY "Users can create family member invitations"
ON public.family_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND invitation_sent_at > (now() - INTERVAL '1 hour')
  AND (email IS NULL OR email = '')
  AND (phone IS NULL OR phone = '')
);

CREATE POLICY "Users can update own family member records"
ON public.family_members
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND invitation_sent_at > (now() - INTERVAL '30 days')
);

-- 4. FIX VERIFICATION SCORE CALCULATION
DROP TRIGGER IF EXISTS auto_calculate_verification_score ON public.user_verifications;

CREATE OR REPLACE FUNCTION public.calculate_verification_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_score INTEGER := 0;
BEGIN
  new_score := 0;
  
  IF NEW.email_verified = true THEN
    new_score := new_score + 20;
  END IF;
  
  IF NEW.phone_verified = true THEN
    new_score := new_score + 25;
  END IF;
  
  IF NEW.id_verified = true THEN
    new_score := new_score + 35;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.user_id = NEW.user_id
    AND fm.is_wali = true
    AND fm.invitation_status = 'accepted'
  ) THEN
    new_score := new_score + 20;
  END IF;
  
  NEW.verification_score := new_score;
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_calculate_verification_score
BEFORE INSERT OR UPDATE ON public.user_verifications
FOR EACH ROW
EXECUTE FUNCTION public.calculate_verification_score();

-- Update existing scores
UPDATE public.user_verifications
SET email_verified = email_verified;

-- 5. ENHANCED RATE LIMITING
CREATE TABLE IF NOT EXISTS public.family_operation_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  operation_count INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, operation_type)
);

ALTER TABLE public.family_operation_limits ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS track_family_invitation_trigger ON public.family_members;

CREATE TRIGGER track_family_invitation_trigger
AFTER INSERT ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.track_family_invitation();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_family_contact_secure_member_id ON public.family_contact_secure(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_contact_audit_accessed_by ON public.family_contact_audit_log(accessed_by);
CREATE INDEX IF NOT EXISTS idx_family_contact_audit_timestamp ON public.family_contact_audit_log(access_timestamp);
CREATE INDEX IF NOT EXISTS idx_family_operation_limits_user ON public.family_operation_limits(user_id, operation_type);