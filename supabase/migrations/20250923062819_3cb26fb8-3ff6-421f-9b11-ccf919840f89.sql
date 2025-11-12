-- CRITICAL SECURITY FIX: Family Contact Data Protection (Fixed Version)
-- This migration addresses the critical vulnerability where family contact information was exposed

-- 1. First, strengthen the RLS policy for family_members to completely block email/phone access for unauthorized users
DROP POLICY IF EXISTS "Family members basic access with verification" ON public.family_members;

CREATE POLICY "Family members secure access with contact protection" 
ON public.family_members 
FOR SELECT 
USING (
  -- User can see their own family member records (without sensitive contact info)
  (auth.uid() = user_id OR auth.uid() = invited_user_id) 
  AND invitation_status = 'accepted'
  AND invitation_accepted_at > (now() - INTERVAL '14 days')
  AND EXISTS (
    SELECT 1 FROM get_user_verification_status_secure(auth.uid()) v
    WHERE v.email_verified = true AND v.verification_score >= 60
  )
);

-- 2. Create a secure function to migrate existing family contact data
CREATE OR REPLACE FUNCTION public.migrate_family_contact_data_secure()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_record RECORD;
BEGIN
  -- Only run if user has super admin privileges
  IF get_current_user_role_secure() != 'super_admin' THEN
    RAISE EXCEPTION 'Insufficient privileges for data migration';
  END IF;
  
  -- Migrate existing contact data to secure table
  FOR family_record IN 
    SELECT id, email, phone 
    FROM family_members 
    WHERE (email IS NOT NULL AND email != '') 
       OR (phone IS NOT NULL AND phone != '')
  LOOP
    -- Insert into secure table if contact info exists
    INSERT INTO public.family_contact_secure (
      family_member_id,
      encrypted_email,
      encrypted_phone,
      contact_visibility
    ) VALUES (
      family_record.id,
      family_record.email, -- Will be encrypted in production
      family_record.phone, -- Will be encrypted in production  
      'wali_only'
    ) ON CONFLICT (family_member_id) DO UPDATE SET
      encrypted_email = EXCLUDED.encrypted_email,
      encrypted_phone = EXCLUDED.encrypted_phone;
  END LOOP;
  
  -- Clear contact data from family_members table after migration
  UPDATE public.family_members 
  SET email = NULL, phone = NULL 
  WHERE email IS NOT NULL OR phone IS NOT NULL;
  
END;
$$;

-- 3. Add enhanced rate limiting for family operations
CREATE OR REPLACE FUNCTION public.enhanced_family_rate_limit_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
  operation_count integer;
  verification_score integer;
BEGIN
  -- Get user verification score
  SELECT v.verification_score INTO verification_score
  FROM get_user_verification_status_secure(auth.uid()) v;
  
  -- Check family member creation rate (max 3 per day for unverified, 10 for verified)
  SELECT COUNT(*) INTO operation_count
  FROM public.family_members 
  WHERE user_id = auth.uid() 
  AND created_at > (now() - INTERVAL '24 hours');
  
  IF verification_score < 70 AND operation_count >= 3 THEN
    RAISE EXCEPTION 'Daily family member invitation limit exceeded. Please verify your account for higher limits.';
  ELSIF verification_score >= 70 AND operation_count >= 10 THEN
    RAISE EXCEPTION 'Daily family member invitation limit exceeded.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply rate limiting to family_members
DROP TRIGGER IF EXISTS family_operation_rate_limit_trigger ON public.family_members;
CREATE TRIGGER family_operation_rate_limit_trigger
  BEFORE INSERT ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_family_rate_limit_check();

-- 4. Add session security monitoring  
CREATE OR REPLACE FUNCTION public.log_suspicious_family_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  
AS $$
DECLARE
  recent_invitations integer;
BEGIN
  -- Check for rapid family invitations (potential abuse)
  SELECT COUNT(*) INTO recent_invitations
  FROM public.family_members
  WHERE user_id = NEW.user_id
  AND created_at > (now() - INTERVAL '1 hour');
  
  -- Log suspicious activity if more than 3 invitations per hour
  IF recent_invitations >= 3 THEN
    PERFORM log_security_event(
      NEW.user_id,
      'rapid_family_invitations', 
      'medium',
      'User created multiple family invitations in short time period',
      jsonb_build_object(
        'invitation_count', recent_invitations,
        'timeframe', '1 hour',
        'family_member_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply suspicious activity monitoring
DROP TRIGGER IF EXISTS suspicious_family_activity_trigger ON public.family_members;
CREATE TRIGGER suspicious_family_activity_trigger
  AFTER INSERT ON public.family_members
  FOR each ROW
  EXECUTE FUNCTION public.log_suspicious_family_activity();

-- 5. Strengthen message security with additional verification checks
CREATE OR REPLACE FUNCTION public.ultra_secure_message_check()
RETURNS trigger  
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_verification RECORD;
  recipient_id uuid;
  recipient_verification RECORD;
  match_record RECORD;
BEGIN
  -- Get match and participant details
  SELECT * INTO match_record FROM public.matches WHERE id = NEW.match_id;
  
  -- Determine recipient
  recipient_id := CASE 
    WHEN match_record.user1_id = NEW.sender_id THEN match_record.user2_id
    ELSE match_record.user1_id
  END;
  
  -- Get detailed verification status for both users
  SELECT * INTO sender_verification 
  FROM get_user_verification_status_secure(NEW.sender_id) v;
  
  SELECT * INTO recipient_verification 
  FROM get_user_verification_status_secure(recipient_id) v;
  
  -- Block messages if verification is insufficient
  IF COALESCE(sender_verification.verification_score, 0) < 60 THEN
    RAISE EXCEPTION 'Sender verification insufficient for messaging (score: %)', 
      COALESCE(sender_verification.verification_score, 0);
  END IF;
  
  IF COALESCE(recipient_verification.verification_score, 0) < 50 THEN
    RAISE EXCEPTION 'Recipient verification insufficient for secure messaging';
  END IF;
  
  -- Require email verification for both parties
  IF NOT COALESCE(sender_verification.email_verified, false) OR 
     NOT COALESCE(recipient_verification.email_verified, false) THEN
    RAISE EXCEPTION 'Email verification required for both parties before messaging';
  END IF;
  
  -- Log all messaging attempts for audit
  INSERT INTO public.sensitive_operations_audit (
    user_id, operation_type, table_accessed, record_id, 
    verification_score, success, risk_level
  ) VALUES (
    NEW.sender_id, 'secure_message_send', 'messages', NEW.match_id,
    sender_verification.verification_score, true, 
    CASE WHEN sender_verification.verification_score < 75 THEN 'high' ELSE 'medium' END
  );
  
  RETURN NEW;
END;
$$;

-- Replace existing message security with enhanced version
DROP TRIGGER IF EXISTS enhanced_message_security_check_trigger ON public.messages;
DROP TRIGGER IF EXISTS ultra_secure_message_check_trigger ON public.messages;
CREATE TRIGGER ultra_secure_message_check_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW  
  EXECUTE FUNCTION public.ultra_secure_message_check();

-- 6. Add enhanced profile view rate limiting
CREATE OR REPLACE FUNCTION public.enhanced_profile_view_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  view_count integer;
  verification_score integer;
BEGIN
  -- Get user verification score
  SELECT v.verification_score INTO verification_score
  FROM get_user_verification_status_secure(NEW.viewer_id) v;
  
  -- Check profile views in the last hour (stricter limits for unverified users)
  SELECT COUNT(*) INTO view_count
  FROM public.profile_views 
  WHERE viewer_id = NEW.viewer_id 
  AND created_at > (now() - INTERVAL '1 hour');
  
  -- Apply limits based on verification level
  IF verification_score < 70 AND view_count >= 5 THEN
    RAISE EXCEPTION 'Hourly profile view limit exceeded for unverified users. Please verify your account for higher limits.';
  ELSIF verification_score >= 70 AND view_count >= 15 THEN
    RAISE EXCEPTION 'Hourly profile view limit exceeded.';
  END IF;
  
  -- Log suspicious activity if approaching limits
  IF view_count >= 10 THEN
    PERFORM log_security_event(
      NEW.viewer_id,
      'high_profile_view_activity', 
      'medium',
      'User approaching profile view limits',
      jsonb_build_object(
        'view_count', view_count,
        'verification_score', verification_score,
        'viewed_user', NEW.viewed_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply enhanced rate limiting to profile views
DROP TRIGGER IF EXISTS enforce_profile_view_rate_limit_trigger ON public.profile_views;
CREATE TRIGGER enhanced_profile_view_rate_limit_trigger
  BEFORE INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_profile_view_rate_limit();

-- 7. Create table for session monitoring if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  device_fingerprint text,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  last_activity timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_sessions
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage their own sessions" 
ON public.user_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Add input validation triggers for sensitive content
CREATE OR REPLACE FUNCTION public.validate_family_input()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    IF NOT NEW.email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format provided';
    END IF;
  END IF;
  
  -- Validate phone format if provided (basic validation)
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NOT NEW.phone ~* '^\+?[1-9]\d{7,14}$' THEN
      RAISE EXCEPTION 'Invalid phone format provided';
    END IF;
  END IF;
  
  -- Validate name length and characters
  IF LENGTH(NEW.full_name) < 2 OR LENGTH(NEW.full_name) > 100 THEN
    RAISE EXCEPTION 'Full name must be between 2 and 100 characters';
  END IF;
  
  -- Block potentially malicious input
  IF NEW.full_name ~* '(script|javascript|onclick|onerror|eval)' THEN
    RAISE EXCEPTION 'Invalid characters in name field';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply input validation to family_members
DROP TRIGGER IF EXISTS validate_family_input_trigger ON public.family_members;
CREATE TRIGGER validate_family_input_trigger
  BEFORE INSERT OR UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_family_input();

-- 9. Create comprehensive audit log for all security events
CREATE OR REPLACE FUNCTION public.comprehensive_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all operations on sensitive tables
  IF TG_TABLE_NAME IN ('family_members', 'family_contact_secure', 'user_verifications', 'messages') THEN
    INSERT INTO public.security_audit_log (
      user_id, action_type, table_name, record_id, additional_data
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'timestamp', now(),
        'operation', TG_OP,
        'table', TG_TABLE_NAME,
        'ip_address', inet_client_addr(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply comprehensive audit to all sensitive tables
DROP TRIGGER IF EXISTS comprehensive_security_audit_trigger_family_members ON public.family_members;
CREATE TRIGGER comprehensive_security_audit_trigger_family_members
  AFTER INSERT OR UPDATE OR DELETE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.comprehensive_security_audit();

DROP TRIGGER IF EXISTS comprehensive_security_audit_trigger_messages ON public.messages;
CREATE TRIGGER comprehensive_security_audit_trigger_messages
  AFTER INSERT OR UPDATE OR DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.comprehensive_security_audit();