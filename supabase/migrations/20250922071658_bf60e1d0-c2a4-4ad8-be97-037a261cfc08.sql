-- Critical Security Fixes for Identified Vulnerabilities
-- Fix 1: Strengthen profiles table RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- Ultra-secure profile access with verification requirements
CREATE POLICY "Users can view own profile with verification" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true 
    AND uv.verification_score >= 50
  )
);

-- Highly restricted profile viewing for other users
CREATE POLICY "Verified users can view public profiles with strict limits" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() != user_id AND
  auth.uid() IS NOT NULL AND
  -- Viewer must be highly verified
  EXISTS (
    SELECT 1 FROM public.user_verifications uv1, public.privacy_settings ps
    WHERE uv1.user_id = auth.uid() 
    AND uv1.email_verified = true 
    AND uv1.id_verified = true
    AND uv1.verification_score >= 85
    AND ps.user_id = profiles.user_id
    AND ps.profile_visibility = 'public'
    -- Target user must also be verified
    AND EXISTS (
      SELECT 1 FROM public.user_verifications uv2
      WHERE uv2.user_id = profiles.user_id
      AND uv2.email_verified = true
      AND uv2.verification_score >= 70
    )
    -- Rate limiting: max 5 profile views per hour
    AND (
      SELECT COUNT(*) FROM public.profile_views pv
      WHERE pv.viewer_id = auth.uid() 
      AND pv.created_at > (now() - INTERVAL '1 hour')
    ) < 5
  ) AND
  -- Must not already be matched
  NOT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id)
    OR (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
  )
);

-- Family members can view supervised profiles with enhanced verification
CREATE POLICY "Family members can view supervised profiles with ultra verification" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm, 
                  public.user_verifications uv1,
                  public.user_verifications uv2,
                  public.privacy_settings ps
    WHERE fm.user_id = profiles.user_id 
    AND fm.invited_user_id = auth.uid()
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
    AND fm.invitation_accepted_at > (now() - INTERVAL '7 days') -- Reduced from 14 days
    -- Family member must be ultra-verified
    AND uv1.user_id = auth.uid()
    AND uv1.email_verified = true
    AND uv1.id_verified = true
    AND uv1.verification_score >= 90
    -- Supervised user must allow family involvement
    AND ps.user_id = profiles.user_id
    AND ps.allow_family_involvement = true
    -- Supervised user must be verified
    AND uv2.user_id = profiles.user_id
    AND uv2.email_verified = true
    AND uv2.verification_score >= 60
  )
);

-- Users can update own profile with verification
CREATE POLICY "Users can update own profile with verification" 
ON public.profiles FOR UPDATE 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true
  )
);

-- Fix 2: Enhanced payment data protection in subscriptions
DROP POLICY IF EXISTS "Users can view own basic subscription status" ON public.subscriptions;

CREATE POLICY "Users can view own subscription with enhanced verification" 
ON public.subscriptions FOR SELECT 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true 
    AND uv.id_verified = true
    AND uv.verification_score >= 75
  )
);

-- Fix 3: Create secure admin audit table for sensitive operations
CREATE TABLE IF NOT EXISTS public.sensitive_operations_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  table_accessed TEXT NOT NULL,
  record_id UUID,
  ip_address INET,
  user_agent TEXT,
  verification_score INTEGER,
  success BOOLEAN NOT NULL DEFAULT false,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ultra-restrictive RLS for audit table
ALTER TABLE public.sensitive_operations_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can view sensitive operations audit" 
ON public.sensitive_operations_audit FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur, public.user_verifications uv
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
    AND uv.user_id = auth.uid()
    AND uv.email_verified = true
    AND uv.id_verified = true
    AND uv.verification_score >= 95
  )
);

-- Fix 4: Enhanced security events access control
DROP POLICY IF EXISTS "Only admins can view security events" ON public.security_events;

CREATE POLICY "Super admins only can view security events with ultra verification" 
ON public.security_events FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur, public.user_verifications uv
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
    AND uv.user_id = auth.uid()
    AND uv.email_verified = true
    AND uv.id_verified = true
    AND uv.verification_score >= 95
  )
);

-- Fix 5: Create function to audit sensitive profile access
CREATE OR REPLACE FUNCTION public.audit_sensitive_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all profile access attempts for security monitoring
  INSERT INTO public.sensitive_operations_audit (
    user_id,
    operation_type,
    table_accessed,
    record_id,
    verification_score,
    success,
    risk_level
  ) 
  SELECT 
    auth.uid(),
    'profile_view',
    'profiles',
    NEW.user_id,
    COALESCE(uv.verification_score, 0),
    true,
    CASE 
      WHEN auth.uid() = NEW.user_id THEN 'low'
      WHEN uv.verification_score >= 85 THEN 'medium'
      ELSE 'high'
    END
  FROM public.user_verifications uv
  WHERE uv.user_id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for profile access auditing
DROP TRIGGER IF EXISTS audit_profile_access ON public.profiles;
CREATE TRIGGER audit_profile_access
  AFTER SELECT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.audit_sensitive_profile_access();

-- Fix 6: Enhanced message content security
CREATE OR REPLACE FUNCTION public.enhanced_message_security_check()
RETURNS TRIGGER AS $$
DECLARE
  sender_verification INTEGER;
  recipient_verification INTEGER;
  match_record RECORD;
BEGIN
  -- Get match details
  SELECT * INTO match_record FROM public.matches WHERE id = NEW.match_id;
  
  -- Get verification scores
  SELECT verification_score INTO sender_verification 
  FROM public.user_verifications 
  WHERE user_id = NEW.sender_id;
  
  SELECT verification_score INTO recipient_verification 
  FROM public.user_verifications 
  WHERE user_id = CASE 
    WHEN match_record.user1_id = NEW.sender_id THEN match_record.user2_id
    ELSE match_record.user1_id
  END;
  
  -- Block messages if verification is too low
  IF COALESCE(sender_verification, 0) < 60 OR COALESCE(recipient_verification, 0) < 50 THEN
    RAISE EXCEPTION 'Insufficient verification level for messaging';
  END IF;
  
  -- Log high-risk messaging attempts
  IF COALESCE(sender_verification, 0) < 75 THEN
    INSERT INTO public.sensitive_operations_audit (
      user_id, operation_type, table_accessed, risk_level, success
    ) VALUES (
      NEW.sender_id, 'message_send', 'messages', 'high', true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for enhanced message security
DROP TRIGGER IF EXISTS enhanced_message_security_trigger ON public.messages;
CREATE TRIGGER enhanced_message_security_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW 
  EXECUTE FUNCTION public.enhanced_message_security_check();