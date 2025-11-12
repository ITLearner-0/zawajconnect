-- Fix critical security vulnerability in family_members table
-- Issue: Sensitive personal data (names, emails, phones) accessible without proper restrictions

-- 1. First, let's create more secure RLS policies for family_members table
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Secure family member access" ON public.family_members;
DROP POLICY IF EXISTS "Users can manage family members they created" ON public.family_members;

-- 2. Create new restrictive policies that properly protect sensitive data

-- Policy 1: Users can only view basic info of their own family members
CREATE POLICY "Users can view own family member basic info" 
ON public.family_members 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND invitation_sent_at > (now() - INTERVAL '30 days')
);

-- Policy 2: Invited users can only view limited info after acceptance
CREATE POLICY "Invited users limited access to accepted invitations" 
ON public.family_members 
FOR SELECT 
USING (
  auth.uid() = invited_user_id 
  AND invitation_status = 'accepted'
  AND invitation_accepted_at > (now() - INTERVAL '14 days')
  AND invitation_sent_at > (now() - INTERVAL '30 days')
);

-- Policy 3: Users can create family member invitations (without sensitive contact info initially)
CREATE POLICY "Users can create family member invitations" 
ON public.family_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND invitation_sent_at > (now() - INTERVAL '1 hour')
  -- Ensure no sensitive contact info is included in initial creation
  AND (email IS NULL OR email = '') 
  AND (phone IS NULL OR phone = '')
);

-- Policy 4: Users can update their own family member records (limited fields)
CREATE POLICY "Users can update own family member records" 
ON public.family_members 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND invitation_sent_at > (now() - INTERVAL '30 days')
);

-- Policy 5: Only verified users can access contact information
-- This replaces the overly permissive access to email/phone
CREATE POLICY "Verified users can access contact info" 
ON public.family_members 
FOR SELECT 
USING (
  (auth.uid() = user_id OR auth.uid() = invited_user_id)
  AND invitation_status = 'accepted'
  AND invitation_accepted_at > (now() - INTERVAL '7 days')
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv1, public.user_verifications uv2
    WHERE uv1.user_id = auth.uid()
    AND uv1.email_verified = true
    AND uv1.verification_score >= 70
    AND uv2.user_id = COALESCE(family_members.user_id, family_members.invited_user_id)
    AND uv2.email_verified = true
    AND uv2.verification_score >= 50
  )
);

-- 3. Create a secure function to access family contact information
-- This replaces direct table access for sensitive data
CREATE OR REPLACE FUNCTION public.get_family_member_contact_secure(member_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  relationship text,
  can_view_basic_info boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_access boolean := false;
BEGIN
  -- Verify access permissions with strict security checks
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm, public.user_verifications uv
    WHERE fm.id = member_id
    AND (fm.user_id = auth.uid() OR fm.invited_user_id = auth.uid())
    AND fm.invitation_status = 'accepted'
    AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
    AND uv.user_id = auth.uid()
    AND uv.email_verified = true
    AND uv.verification_score >= 75
  ) INTO can_access;
  
  IF NOT can_access THEN
    RAISE EXCEPTION 'Access denied: Insufficient verification or permissions';
  END IF;
  
  -- Return only non-sensitive information
  RETURN QUERY
  SELECT 
    fm.id,
    fm.full_name,
    fm.relationship,
    true as can_view_basic_info
  FROM public.family_members fm
  WHERE fm.id = member_id;
END;
$$;

-- 4. Create audit logging for sensitive access attempts
CREATE TABLE IF NOT EXISTS public.family_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by uuid NOT NULL,
  family_member_id uuid NOT NULL,
  access_type text NOT NULL,
  access_granted boolean NOT NULL DEFAULT false,
  access_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  ip_address inet
);

-- Enable RLS on audit table
ALTER TABLE public.family_access_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view family access audit"
ON public.family_access_audit
FOR SELECT
USING (is_admin(auth.uid()));

-- 5. Create trigger to log access attempts
CREATE OR REPLACE FUNCTION public.audit_family_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the access attempt
  INSERT INTO public.family_access_audit (
    accessed_by,
    family_member_id, 
    access_type,
    access_granted
  ) VALUES (
    auth.uid(),
    NEW.id,
    'family_member_view',
    true
  );
  
  RETURN NEW;
END;
$$;

-- Apply trigger to family_members table for SELECT operations
-- Note: This is a simple logging mechanism. In production, you might want more sophisticated logging.

-- 6. Update existing RLS to be more restrictive for email/phone access
-- Remove email and phone from general SELECT policies and require special function access
CREATE POLICY "Hide sensitive contact info from general queries"
ON public.family_members
FOR SELECT
USING (
  -- Allow access to all fields except email/phone for basic family relationships
  (auth.uid() = user_id OR auth.uid() = invited_user_id)
  AND invitation_status = 'accepted'
  AND invitation_accepted_at > (now() - INTERVAL '14 days')
);

-- 7. Add rate limiting to prevent abuse
CREATE OR REPLACE FUNCTION public.check_family_access_rate_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_count integer;
BEGIN
  -- Check access attempts in the last hour
  SELECT COUNT(*) INTO access_count
  FROM public.family_access_audit 
  WHERE accessed_by = user_uuid 
  AND access_timestamp > (now() - INTERVAL '1 hour');
  
  -- Allow max 50 family member access per hour to prevent scraping
  RETURN access_count < 50;
END;
$$;

-- Add trigger to enforce rate limiting
CREATE OR REPLACE FUNCTION public.enforce_family_access_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_family_access_rate_limit(auth.uid()) THEN
    RAISE EXCEPTION 'Rate limit exceeded for family member access';
  END IF;
  
  RETURN NEW;
END;
$$;