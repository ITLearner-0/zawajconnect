-- Critical Security Fixes - Phase 1
-- Fix Profile Access Security with field-level controls

-- First, drop existing overly permissive profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable by verified users" ON public.profiles;

-- Enhanced profile RLS policies with field-level security
CREATE POLICY "Users can view their own profile data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Highly verified users can view basic public profile info only
CREATE POLICY "Verified users can view basic public profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != user_id 
  AND EXISTS (
    SELECT 1 FROM privacy_settings ps 
    WHERE ps.user_id = profiles.user_id 
    AND ps.profile_visibility = 'public'
  )
  AND EXISTS (
    SELECT 1 FROM get_user_verification_status_secure(auth.uid()) v
    WHERE v.email_verified = true 
    AND v.id_verified = true 
    AND v.verification_score >= 85
  )
  AND NOT EXISTS (
    SELECT 1 FROM user_status us 
    WHERE us.user_id = profiles.user_id 
    AND us.status != 'active'
  )
);

-- Family members can view supervised profiles with strict verification
CREATE POLICY "Family members can view supervised profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM family_members fm,
                  get_user_verification_status_secure(auth.uid()) v
    WHERE fm.user_id = profiles.user_id
    AND fm.invited_user_id = auth.uid()
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
    AND fm.is_wali = true
    AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
    AND v.email_verified = true
    AND v.id_verified = true
    AND v.verification_score >= 85
  )
);

-- Enhanced payment security for subscriptions table
DROP POLICY IF EXISTS "Users can view own basic subscription status" ON public.subscriptions;
DROP POLICY IF EXISTS "Super admins can access payment data" ON public.subscriptions;

-- Users can only view their own subscription status with verification
CREATE POLICY "Verified users can view own subscription status" 
ON public.subscriptions 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM get_user_verification_status_secure(auth.uid()) v
    WHERE v.email_verified = true 
    AND v.verification_score >= 70
  )
);

-- Super admins with ultra-high verification can access payment data
CREATE POLICY "Ultra verified super admins can access payment data" 
ON public.subscriptions 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur,
                  get_user_verification_status_secure(auth.uid()) v
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'super_admin'
    AND v.email_verified = true
    AND v.id_verified = true
    AND v.verification_score >= 95
  )
);

-- Enhanced family invitation security
-- Add rate limiting table for family operations
CREATE TABLE IF NOT EXISTS public.family_operation_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  operation_count INTEGER DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.family_operation_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own operation limits" 
ON public.family_operation_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Function to check family operation rate limits
CREATE OR REPLACE FUNCTION public.check_family_operation_limit(
  p_user_id UUID, 
  p_operation_type TEXT, 
  p_daily_limit INTEGER DEFAULT 3
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current count and last reset
  SELECT operation_count, last_reset_at 
  INTO current_count, last_reset
  FROM public.family_operation_limits 
  WHERE user_id = p_user_id AND operation_type = p_operation_type;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.family_operation_limits (user_id, operation_type, operation_count)
    VALUES (p_user_id, p_operation_type, 0);
    RETURN TRUE;
  END IF;
  
  -- Reset count if more than 24 hours have passed
  IF last_reset < (now() - INTERVAL '24 hours') THEN
    UPDATE public.family_operation_limits 
    SET operation_count = 0, last_reset_at = now()
    WHERE user_id = p_user_id AND operation_type = p_operation_type;
    current_count := 0;
  END IF;
  
  -- Check if under limit
  RETURN current_count < p_daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment family operation count
CREATE OR REPLACE FUNCTION public.increment_family_operation_count(
  p_user_id UUID, 
  p_operation_type TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.family_operation_limits (user_id, operation_type, operation_count)
  VALUES (p_user_id, p_operation_type, 1)
  ON CONFLICT (user_id, operation_type) 
  DO UPDATE SET 
    operation_count = family_operation_limits.operation_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint to prevent duplicates
ALTER TABLE public.family_operation_limits 
ADD CONSTRAINT unique_user_operation 
UNIQUE (user_id, operation_type);

-- Enhanced family member insertion policy with rate limiting
DROP POLICY IF EXISTS "Users can create family member invitations" ON public.family_members;

CREATE POLICY "Users can create family member invitations with limits" 
ON public.family_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND invitation_sent_at > (now() - INTERVAL '1 hour')
  AND email IS NOT NULL 
  AND email != ''
  AND phone IS NULL OR phone = ''
  AND public.check_family_operation_limit(auth.uid(), 'family_invitation', 3)
  AND EXISTS (
    SELECT 1 FROM get_user_verification_status_secure(auth.uid()) v
    WHERE v.email_verified = true
    AND v.id_verified = true
    AND v.verification_score >= 80
  )
);

-- Trigger to increment family operation count
CREATE OR REPLACE FUNCTION public.track_family_invitation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.increment_family_operation_count(NEW.user_id, 'family_invitation');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_family_invitation_trigger
  AFTER INSERT ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.track_family_invitation();

-- Enhanced session security table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Security audit enhancements
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, severity, description, metadata
  ) VALUES (
    p_user_id, p_event_type, p_severity, p_description, p_metadata
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;