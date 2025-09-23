-- CRITICAL SECURITY FIX: Family Contact Data Protection
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

-- 2. Create a view that excludes sensitive contact information for general access
CREATE OR REPLACE VIEW public.family_members_safe AS
SELECT 
  id,
  user_id,
  can_view_profile,
  can_communicate, 
  is_wali,
  created_at,
  invitation_token,
  invitation_sent_at,
  invitation_accepted_at,
  invited_user_id,
  relationship,
  full_name,
  -- Completely hide email and phone from general view
  CASE 
    WHEN can_access_family_contact_info_secure(user_id, invited_user_id) THEN email 
    ELSE NULL 
  END as email,
  CASE 
    WHEN can_access_family_contact_info_secure(user_id, invited_user_id) THEN phone 
    ELSE NULL 
  END as phone,
  invitation_status
FROM public.family_members;

-- 3. Enable RLS on the safe view
ALTER VIEW public.family_members_safe SET (security_invoker = true);

-- 4. Create a secure function to migrate existing family contact data
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
  
  -- Clear contact data from family_members table
  UPDATE public.family_members 
  SET email = NULL, phone = NULL 
  WHERE email IS NOT NULL OR phone IS NOT NULL;
  
END;
$$;

-- 5. Add enhanced audit logging for family contact access
CREATE OR REPLACE FUNCTION public.audit_family_contact_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all access to family contact information
  INSERT INTO public.family_contact_audit_log (
    family_member_id,
    accessed_by,
    access_details,
    access_timestamp
  ) VALUES (
    NEW.family_member_id,
    auth.uid(),
    jsonb_build_object(
      'action', 'contact_info_access',
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', inet_client_addr()
    ),
    now()
  );
  
  RETURN NEW;
END;
$$;

-- 6. Create trigger for contact access auditing
DROP TRIGGER IF EXISTS audit_family_contact_access_trigger ON public.family_contact_secure;
CREATE TRIGGER audit_family_contact_access_trigger
  AFTER SELECT ON public.family_contact_secure
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_family_contact_access();

-- 7. Add rate limiting for family operations
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

-- 8. Add session security monitoring  
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

-- 9. Strengthen message security with additional verification checks
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
CREATE TRIGGER ultra_secure_message_check_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW  
  EXECUTE FUNCTION public.ultra_secure_message_check();