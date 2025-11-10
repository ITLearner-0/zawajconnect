-- Fix SECURITY DEFINER functions that act like views
-- These bypass RLS and need proper security validations

-- ============================================================================
-- 1. FIX: assign_daily_quests_to_user
-- CRITICAL: No search_path, no auth validation, allows manipulation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.assign_daily_quests_to_user(p_user_id uuid)
 RETURNS TABLE(quest_id uuid, quest_type text, title text, description text, target_value integer, xp_reward integer, icon text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_quest_date DATE := CURRENT_DATE;
BEGIN
  -- SECURITY: Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- SECURITY: User can only assign quests to themselves
  IF p_user_id != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only assign quests to your own account';
  END IF;

  -- Check if user already has quests for today
  IF EXISTS (
    SELECT 1 FROM user_daily_quest_progress 
    WHERE user_id = p_user_id AND quest_date = v_quest_date
  ) THEN
    -- Return existing quests
    RETURN QUERY
    SELECT dq.id, dq.quest_type, dq.title, dq.description, dq.target_value, dq.xp_reward, dq.icon
    FROM daily_quests dq
    INNER JOIN user_daily_quest_progress udqp ON dq.id = udqp.quest_id
    WHERE udqp.user_id = p_user_id AND udqp.quest_date = v_quest_date;
  ELSE
    -- Assign 3 random active quests
    INSERT INTO user_daily_quest_progress (user_id, quest_id, quest_date)
    SELECT p_user_id, dq.id, v_quest_date
    FROM daily_quests dq
    WHERE dq.is_active = true
    ORDER BY RANDOM()
    LIMIT 3;
    
    -- Return assigned quests
    RETURN QUERY
    SELECT dq.id, dq.quest_type, dq.title, dq.description, dq.target_value, dq.xp_reward, dq.icon
    FROM daily_quests dq
    INNER JOIN user_daily_quest_progress udqp ON dq.id = udqp.quest_id
    WHERE udqp.user_id = p_user_id AND udqp.quest_date = v_quest_date;
  END IF;
END;
$function$;

COMMENT ON FUNCTION public.assign_daily_quests_to_user(uuid) IS 
'SECURITY DEFINER: Assigns daily quests to authenticated user
Restrictions: User can only assign to their own account (or admin)
Security: Validates auth.uid() and ownership
Logging: No logging (low-risk operation)';

-- ============================================================================
-- 2. FIX: get_family_approval_status
-- HIGH RISK: Exposes match family approval status without authorization
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_family_approval_status(match_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user1_id uuid;
  v_user2_id uuid;
  v_status text;
BEGIN
  -- SECURITY: Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get match participants
  SELECT user1_id, user2_id INTO v_user1_id, v_user2_id
  FROM matches
  WHERE id = match_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;
  
  -- SECURITY: Only match participants or their family members can check status
  IF auth.uid() != v_user1_id 
     AND auth.uid() != v_user2_id
     AND NOT is_admin(auth.uid())
     AND NOT EXISTS (
       SELECT 1 FROM public.family_members fm
       WHERE ((fm.user_id = v_user1_id OR fm.user_id = v_user2_id)
              AND fm.invited_user_id = auth.uid())
       AND fm.invitation_status = 'accepted'
       AND fm.is_wali = true
     ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access family approval status for this match';
  END IF;
  
  -- Return approval status
  SELECT 
    CASE 
      WHEN family_approved = true THEN 'approved'
      WHEN family_approved = false THEN 'rejected'
      ELSE 'pending'
    END INTO v_status
  FROM matches 
  WHERE id = match_uuid;
  
  RETURN v_status;
END;
$function$;

COMMENT ON FUNCTION public.get_family_approval_status(uuid) IS 
'SECURITY DEFINER: Returns family approval status for a match
Restrictions: Only match participants, their walis, or admins
Security: Validates auth.uid() and relationship to match
Logging: No logging (medium-risk operation)';

-- ============================================================================
-- 3. FIX: get_onboarding_funnel
-- MEDIUM RISK: Exposes aggregate analytics without admin check
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_onboarding_funnel(days_back integer DEFAULT 30)
 RETURNS TABLE(step_number integer, step_name text, users_started bigint, users_completed bigint, completion_rate numeric, avg_time_seconds numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY: Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- SECURITY: Only admins can access aggregate analytics
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required for analytics';
  END IF;

  RETURN QUERY
  SELECT 
    oa.step_number,
    oa.step_name,
    COUNT(DISTINCT CASE WHEN oa.event_type = 'step_started' THEN oa.user_id END) as users_started,
    COUNT(DISTINCT CASE WHEN oa.event_type = 'step_completed' THEN oa.user_id END) as users_completed,
    ROUND(
      (COUNT(DISTINCT CASE WHEN oa.event_type = 'step_completed' THEN oa.user_id END)::numeric / 
       NULLIF(COUNT(DISTINCT CASE WHEN oa.event_type = 'step_started' THEN oa.user_id END), 0) * 100
      ), 2
    ) as completion_rate,
    ROUND(AVG(oa.time_spent_seconds)::numeric, 2) as avg_time_seconds
  FROM onboarding_analytics oa
  WHERE oa.created_at >= now() - (days_back || ' days')::interval
    AND oa.step_number IS NOT NULL
  GROUP BY oa.step_number, oa.step_name
  ORDER BY oa.step_number;
END;
$function$;

COMMENT ON FUNCTION public.get_onboarding_funnel(integer) IS 
'SECURITY DEFINER: Returns onboarding funnel analytics
Restrictions: Admin access only
Security: Validates auth.uid() and admin role
Logging: No logging (low-risk operation for admins)';

-- ============================================================================
-- 4. FIX: get_user_role
-- MEDIUM RISK: Exposes user roles without validation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY: Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- SECURITY: User can only check their own role (or admin can check anyone's)
  IF _user_id != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own role';
  END IF;
  
  RETURN (
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY 
      CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'moderator' THEN 3
        WHEN 'user' THEN 4
      END
    LIMIT 1
  );
END;
$function$;

COMMENT ON FUNCTION public.get_user_role(uuid) IS 
'SECURITY DEFINER: Returns user role
Restrictions: User can only check their own role (or admin)
Security: Validates auth.uid() and ownership
Logging: No logging (low-risk operation)';

-- ============================================================================
-- 5. FIX: get_validation_error_stats
-- MEDIUM RISK: Exposes analytics without admin check
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_validation_error_stats(days_back integer DEFAULT 30)
 RETURNS TABLE(field_name text, error_count bigint, error_percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY: Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- SECURITY: Only admins can access validation error statistics
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required for error statistics';
  END IF;

  RETURN QUERY
  SELECT 
    error_detail->>'field' as field_name,
    COUNT(*) as error_count,
    ROUND(
      (COUNT(*)::numeric / 
       (SELECT COUNT(*) FROM onboarding_analytics 
        WHERE event_type = 'validation_error' 
        AND created_at >= now() - (days_back || ' days')::interval) * 100
      ), 2
    ) as error_percentage
  FROM onboarding_analytics,
       jsonb_array_elements(validation_errors) as error_detail
  WHERE event_type = 'validation_error'
    AND created_at >= now() - (days_back || ' days')::interval
  GROUP BY error_detail->>'field'
  ORDER BY error_count DESC;
END;
$function$;

COMMENT ON FUNCTION public.get_validation_error_stats(integer) IS 
'SECURITY DEFINER: Returns validation error statistics
Restrictions: Admin access only
Security: Validates auth.uid() and admin role
Logging: No logging (low-risk operation for admins)';

-- ============================================================================
-- 6. FIX: select_ab_test_variant
-- LOW-MEDIUM RISK: Add auth verification for A/B test selection
-- ============================================================================
CREATE OR REPLACE FUNCTION public.select_ab_test_variant(p_reminder_type text)
 RETURNS TABLE(ab_test_id uuid, variant_name text, subject_line text, offer_percentage integer, promo_code text, email_tone text, cta_text text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_random INTEGER;
  v_cumulative INTEGER := 0;
  v_variant RECORD;
BEGIN
  -- SECURITY: Verify authentication (system functions can call without auth)
  -- Allow service role to call this function for email sending
  IF auth.uid() IS NULL AND current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Generate random number between 1 and 100
  v_random := floor(random() * 100 + 1)::INTEGER;
  
  -- Get variants ordered by traffic allocation
  FOR v_variant IN 
    SELECT 
      id,
      variant_name,
      subject_line,
      offer_percentage,
      promo_code,
      email_tone,
      cta_text,
      traffic_allocation
    FROM public.email_ab_tests
    WHERE reminder_type = p_reminder_type 
      AND is_active = true
    ORDER BY created_at
  LOOP
    v_cumulative := v_cumulative + v_variant.traffic_allocation;
    
    IF v_random <= v_cumulative THEN
      RETURN QUERY SELECT 
        v_variant.id,
        v_variant.variant_name,
        v_variant.subject_line,
        v_variant.offer_percentage,
        v_variant.promo_code,
        v_variant.email_tone,
        v_variant.cta_text;
      RETURN;
    END IF;
  END LOOP;
  
  -- Fallback to first variant if no match
  RETURN QUERY 
  SELECT 
    id,
    variant_name,
    subject_line,
    offer_percentage,
    promo_code,
    email_tone,
    cta_text
  FROM public.email_ab_tests
  WHERE reminder_type = p_reminder_type 
    AND is_active = true
  LIMIT 1;
END;
$function$;

COMMENT ON FUNCTION public.select_ab_test_variant(text) IS 
'SECURITY DEFINER: Selects A/B test variant for email campaigns
Restrictions: Authenticated users or service role only
Security: Validates auth.uid() or service_role
Logging: No logging (low-risk operation)';
