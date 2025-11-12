-- CRITICAL SECURITY FIX: Add authorization checks to SECURITY DEFINER functions
-- These functions currently allow ANY user to query information about ANY other user
-- which is a major security vulnerability.

-- ============================================================================
-- 1. FIX: is_user_in_active_conversation - Add auth check
-- ============================================================================
-- BEFORE: Anyone could check if any user is in an active conversation
-- AFTER: Only the user themselves or admins can check conversation status

CREATE OR REPLACE FUNCTION public.is_user_in_active_conversation(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY: Verify the authenticated user can access this information
  -- Only allow:
  -- 1. The user checking their own status
  -- 2. Admins
  IF check_user_id != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot check conversation status of other users';
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user1_id = check_user_id OR user2_id = check_user_id)
    AND conversation_status = 'active'
  );
END;
$function$;

COMMENT ON FUNCTION public.is_user_in_active_conversation(uuid) IS 
'SECURITY DEFINER: Checks if a user is in an active conversation. Restricted to self or admins only.';

-- ============================================================================
-- 2. FIX: has_previous_conversation - Add auth check
-- ============================================================================
-- BEFORE: Anyone could check if any two users have had a conversation
-- AFTER: Only participants or admins can check conversation history

CREATE OR REPLACE FUNCTION public.has_previous_conversation(u1_id uuid, u2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY: The authenticated user must be one of the two participants or an admin
  -- This prevents mapping the social graph by unauthorized users
  IF auth.uid() != u1_id AND auth.uid() != u2_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own conversation history';
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_match_pairs
    WHERE (user1_id = u1_id AND user2_id = u2_id)
       OR (user1_id = u2_id AND user2_id = u1_id)
  );
END;
$function$;

COMMENT ON FUNCTION public.has_previous_conversation(uuid, uuid) IS 
'SECURITY DEFINER: Checks if two users have had a previous conversation. Restricted to participants or admins only.';

-- ============================================================================
-- 3. FIX: get_user_verification_status_secure - Add auth check
-- ============================================================================
-- BEFORE: Anyone could check any user's verification status
-- AFTER: Only allowed for self, admins, family members, or mutual matches

CREATE OR REPLACE FUNCTION public.get_user_verification_status_secure(target_user_id uuid)
RETURNS TABLE(email_verified boolean, id_verified boolean, verification_score integer)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY: Restrict access to verification status
  -- Allow only:
  -- 1. The user themselves
  -- 2. Admins
  -- 3. Family members with accepted invitation (within 14 days)
  -- 4. Mutual matches
  IF target_user_id != auth.uid() 
     AND NOT is_admin(auth.uid())
     AND NOT EXISTS (
       -- Check if requester is an accepted family member
       SELECT 1 FROM public.family_members fm
       WHERE ((fm.user_id = target_user_id AND fm.invited_user_id = auth.uid())
              OR (fm.invited_user_id = target_user_id AND fm.user_id = auth.uid()))
       AND fm.invitation_status = 'accepted'
       AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')
     )
     AND NOT EXISTS (
       -- Check if requester is in a mutual match
       SELECT 1 FROM public.matches m
       WHERE ((m.user1_id = auth.uid() AND m.user2_id = target_user_id)
              OR (m.user2_id = auth.uid() AND m.user1_id = target_user_id))
       AND m.is_mutual = true
     ) THEN
    -- Log unauthorized access attempt
    PERFORM log_security_event(
      auth.uid(),
      'unauthorized_verification_status_access',
      'high',
      'Attempted to access verification status without authorization',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'timestamp', now()
      )
    );
    
    RAISE EXCEPTION 'Unauthorized: Cannot access verification status of this user';
  END IF;
  
  -- Log legitimate access for audit purposes
  PERFORM log_security_event(
    auth.uid(),
    'verification_status_accessed',
    'low',
    'Accessed user verification status',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'timestamp', now()
    )
  );
  
  RETURN QUERY
  SELECT 
    uv.email_verified,
    uv.id_verified,
    uv.verification_score
  FROM public.user_verifications uv
  WHERE uv.user_id = target_user_id;
END;
$function$;

COMMENT ON FUNCTION public.get_user_verification_status_secure(uuid) IS 
'SECURITY DEFINER: Returns user verification status. Restricted to self, admins, family members, or mutual matches. Logs all access attempts.';

-- ============================================================================
-- 4. IMPROVE: is_premium_active - Add auth check
-- ============================================================================
-- BEFORE: Anyone could check any user's premium status
-- AFTER: Only the user themselves or admins can check premium status

CREATE OR REPLACE FUNCTION public.is_premium_active(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY: Only allow checking own premium status or admins
  IF user_uuid != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own premium status';
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$function$;

COMMENT ON FUNCTION public.is_premium_active(uuid) IS 
'SECURITY DEFINER: Checks if a user has an active premium subscription. Restricted to self or admins only.';

-- ============================================================================
-- 5. IMPROVE: check_family_access_rate_limit - Add auth check
-- ============================================================================
-- BEFORE: Anyone could check any user's rate limit status
-- AFTER: Only the user themselves or admins can check rate limits

CREATE OR REPLACE FUNCTION public.check_family_access_rate_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  access_count integer;
BEGIN
  -- SECURITY: Only allow checking own rate limit or admins
  IF user_uuid != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own rate limit';
  END IF;
  
  -- Check access attempts in the last hour
  SELECT COUNT(*) INTO access_count
  FROM public.family_access_audit 
  WHERE accessed_by = user_uuid 
  AND access_timestamp > (now() - INTERVAL '1 hour');
  
  -- Allow max 50 family member access per hour to prevent scraping
  RETURN access_count < 50;
END;
$function$;

COMMENT ON FUNCTION public.check_family_access_rate_limit(uuid) IS 
'SECURITY DEFINER: Checks if user has exceeded family access rate limit. Restricted to self or admins only.';