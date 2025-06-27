
-- Create missing compatibility_scores table first
CREATE TABLE IF NOT EXISTS public.compatibility_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  compatibility_factors jsonb DEFAULT '{}',
  calculated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS on compatibility_scores
ALTER TABLE public.compatibility_scores ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for compatibility_scores
DROP POLICY IF EXISTS "Users can view their own compatibility scores as user1" ON public.compatibility_scores;
CREATE POLICY "Users can view their own compatibility scores as user1"
  ON public.compatibility_scores
  FOR SELECT
  USING (user1_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own compatibility scores as user2" ON public.compatibility_scores;
CREATE POLICY "Users can view their own compatibility scores as user2"
  ON public.compatibility_scores
  FOR SELECT
  USING (user2_id = auth.uid());

DROP POLICY IF EXISTS "Users can create compatibility scores they participate in" ON public.compatibility_scores;
CREATE POLICY "Users can create compatibility scores they participate in"
  ON public.compatibility_scores
  FOR INSERT
  WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Fix subscribers table policies
DROP POLICY IF EXISTS "System can create subscription records" ON public.subscribers;
DROP POLICY IF EXISTS "Users can create their own subscription records" ON public.subscribers;
CREATE POLICY "Users can create their own subscription records"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add missing RLS policies for security_events
DROP POLICY IF EXISTS "Users can view their own security events" ON public.security_events;
CREATE POLICY "Users can view their own security events"
  ON public.security_events
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own security events" ON public.security_events;
CREATE POLICY "Users can create their own security events"
  ON public.security_events
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add missing RLS policies for user_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own sessions" ON public.user_sessions;
CREATE POLICY "Users can create their own sessions"
  ON public.user_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions
  FOR UPDATE
  USING (user_id = auth.uid());

-- Add missing RLS policies for document_verifications
DROP POLICY IF EXISTS "Users can view their own document verifications" ON public.document_verifications;
CREATE POLICY "Users can view their own document verifications"
  ON public.document_verifications
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own document verifications" ON public.document_verifications;
CREATE POLICY "Users can create their own document verifications"
  ON public.document_verifications
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  attempt_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.rate_limits;
CREATE POLICY "Users can view their own rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
CREATE POLICY "System can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (true);

-- Add security audit improvements
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_audit_log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.security_audit_log;
CREATE POLICY "Users can view their own audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create audit logs" ON public.security_audit_log;
CREATE POLICY "System can create audit logs"
  ON public.security_audit_log
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can view all audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create function for secure password validation
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}';
  score integer := 0;
  issues text[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    issues := array_append(issues, 'Password must be at least 8 characters long');
  ELSE
    score := score + 1;
  END IF;
  
  -- Check for uppercase
  IF password ~ '[A-Z]' THEN
    score := score + 1;
  ELSE
    issues := array_append(issues, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase
  IF password ~ '[a-z]' THEN
    score := score + 1;
  ELSE
    issues := array_append(issues, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for numbers
  IF password ~ '[0-9]' THEN
    score := score + 1;
  ELSE
    issues := array_append(issues, 'Password must contain at least one number');
  END IF;
  
  -- Check for special characters
  IF password ~ '[^A-Za-z0-9]' THEN
    score := score + 1;
  ELSE
    issues := array_append(issues, 'Password must contain at least one special character');
  END IF;
  
  result := jsonb_build_object(
    'score', score,
    'max_score', 5,
    'is_strong', score >= 4,
    'issues', issues
  );
  
  RETURN result;
END;
$$;

-- Create function for logging security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_risk_level text DEFAULT 'low',
  p_details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    success,
    risk_level,
    details
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_success,
    p_risk_level,
    p_details
  );
END;
$$;
