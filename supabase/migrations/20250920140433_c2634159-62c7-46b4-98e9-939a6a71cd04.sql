-- Fix infinite recursion in RLS policies by creating security definer functions
-- Phase 1: Create security definer functions to break recursion cycles

-- Function to get current user's role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role_secure()
RETURNS app_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
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
$$;

-- Function to check if user has family relationship safely
CREATE OR REPLACE FUNCTION public.has_family_relationship_security_definer(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.family_members fm
    WHERE (fm.user_id = target_user_id AND fm.invited_user_id = auth.uid())
    OR (fm.invited_user_id = target_user_id AND fm.user_id = auth.uid())
    AND fm.invitation_status = 'accepted'
    AND fm.invitation_accepted_at > (now() - INTERVAL '30 days')
  );
END;
$$;

-- Function to check if user can access match safely
CREATE OR REPLACE FUNCTION public.can_access_match_security_definer(match_user1_id uuid, match_user2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Direct match participant
  IF auth.uid() = match_user1_id OR auth.uid() = match_user2_id THEN
    RETURN true;
  END IF;
  
  -- Family member with supervision rights
  RETURN EXISTS (
    SELECT 1
    FROM public.family_members fm
    WHERE fm.invited_user_id = auth.uid()
    AND (fm.user_id = match_user1_id OR fm.user_id = match_user2_id)
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
    AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')
  );
END;
$$;

-- Function to get user verification status safely
CREATE OR REPLACE FUNCTION public.get_user_verification_status_secure(target_user_id uuid)
RETURNS TABLE(email_verified boolean, id_verified boolean, verification_score integer)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uv.email_verified,
    uv.id_verified,
    uv.verification_score
  FROM public.user_verifications uv
  WHERE uv.user_id = target_user_id;
END;
$$;

-- Phase 2: Fix existing problematic policies by replacing them with function-based ones
-- Drop existing problematic policies first

-- Fix matches table policies
DROP POLICY IF EXISTS "Family members can view supervised user matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;

-- Recreate matches policies using security definer functions
CREATE POLICY "Users can view accessible matches" 
ON public.matches 
FOR SELECT 
USING (public.can_access_match_security_definer(user1_id, user2_id));

CREATE POLICY "Match participants can update matches" 
ON public.matches 
FOR UPDATE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Fix family_members policies - drop problematic ones
DROP POLICY IF EXISTS "Hide sensitive contact info from general queries" ON public.family_members;
DROP POLICY IF EXISTS "Users can view own family member basic info" ON public.family_members;
DROP POLICY IF EXISTS "Verified users can access contact info" ON public.family_members;

-- Recreate family_members policies with verification requirements
CREATE POLICY "Family members basic access with verification" 
ON public.family_members 
FOR SELECT 
USING (
  (auth.uid() = user_id OR auth.uid() = invited_user_id)
  AND invitation_status = 'accepted'
  AND invitation_accepted_at > (now() - INTERVAL '14 days')
  AND EXISTS (
    SELECT 1 FROM public.get_user_verification_status_secure(auth.uid()) v
    WHERE v.email_verified = true AND v.verification_score >= 60
  )
);

-- Phase 3: Add missing RLS policies for exposed tables

-- 1. compatibility_questions - should be readable by verified users only
CREATE POLICY "Verified users can access active compatibility questions" 
ON public.compatibility_questions 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.get_user_verification_status_secure(auth.uid()) v
    WHERE v.email_verified = true AND v.verification_score >= 50
  )
);

-- 2. supervision_logs - only family members can view logs for supervised users
CREATE POLICY "Family members can view supervision logs with verification" 
ON public.supervision_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_members fm,
         public.get_user_verification_status_secure(auth.uid()) v
    WHERE fm.user_id = supervision_logs.supervised_user_id
    AND fm.invited_user_id = auth.uid()
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
    AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
    AND v.email_verified = true
    AND v.verification_score >= 70
  )
);

-- Only allow system/admins to insert supervision logs
CREATE POLICY "System can create supervision logs" 
ON public.supervision_logs 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role_secure() IN ('admin', 'super_admin', 'moderator')
  OR auth.uid() = supervised_user_id
);

-- 3. conversation_participants - restrict to match participants and verified family
CREATE POLICY "Match participants can manage conversation participants" 
ON public.conversation_participants 
FOR ALL 
USING (public.can_access_match_security_definer(
  (SELECT user1_id FROM matches WHERE id = match_id),
  (SELECT user2_id FROM matches WHERE id = match_id)
))
WITH CHECK (public.can_access_match_security_definer(
  (SELECT user1_id FROM matches WHERE id = match_id),
  (SELECT user2_id FROM matches WHERE id = match_id)
));

-- 4. Add table for family_notifications (seems to be missing from schema)
CREATE TABLE IF NOT EXISTS public.family_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id uuid NOT NULL,
  match_id uuid,
  notification_type text NOT NULL,
  content text NOT NULL,
  original_message text,
  severity text NOT NULL DEFAULT 'medium',
  is_read boolean DEFAULT false,
  action_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

ALTER TABLE public.family_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for family_notifications
CREATE POLICY "Family members can access their notifications" 
ON public.family_notifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_members fm,
         public.get_user_verification_status_secure(auth.uid()) v
    WHERE fm.id = family_notifications.family_member_id
    AND fm.invited_user_id = auth.uid()
    AND fm.invitation_status = 'accepted'
    AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')
    AND v.email_verified = true
    AND v.verification_score >= 60
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.family_members fm,
         public.get_user_verification_status_secure(auth.uid()) v
    WHERE fm.id = family_notifications.family_member_id
    AND fm.invited_user_id = auth.uid()
    AND fm.invitation_status = 'accepted'
    AND v.email_verified = true
    AND v.verification_score >= 60
  )
);

-- 5. family_reviews - only family members can manage reviews
CREATE POLICY "Family members can manage reviews with high verification" 
ON public.family_reviews 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_members fm,
         public.matches m,
         public.get_user_verification_status_secure(auth.uid()) v
    WHERE fm.id = family_reviews.family_member_id
    AND m.id = family_reviews.match_id
    AND fm.invited_user_id = auth.uid()
    AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
    AND fm.invitation_status = 'accepted'
    AND fm.is_wali = true
    AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
    AND v.email_verified = true
    AND v.id_verified = true
    AND v.verification_score >= 80
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.family_members fm,
         public.matches m,
         public.get_user_verification_status_secure(auth.uid()) v
    WHERE fm.id = family_reviews.family_member_id
    AND m.id = family_reviews.match_id
    AND fm.invited_user_id = auth.uid()
    AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
    AND fm.invitation_status = 'accepted'
    AND fm.is_wali = true
    AND v.email_verified = true
    AND v.id_verified = true
    AND v.verification_score >= 80
  )
);

-- 6. video_calls - restrict to match participants with verification
CREATE POLICY "Verified match participants can manage video calls" 
ON public.video_calls 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.matches m,
         public.get_user_verification_status_secure(auth.uid()) v
    WHERE m.id = video_calls.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    AND m.can_communicate = true
    AND v.email_verified = true
    AND v.verification_score >= 70
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.matches m,
         public.get_user_verification_status_secure(auth.uid()) v
    WHERE m.id = video_calls.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    AND m.can_communicate = true
    AND v.email_verified = true
    AND v.verification_score >= 70
  )
);

-- 7. family_contact_secure - ultra-strict access
CREATE POLICY "Ultra secure family contact access with definer functions" 
ON public.family_contact_secure 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_members fm,
         public.get_user_verification_status_secure(auth.uid()) v1,
         public.get_user_verification_status_secure(fm.user_id) v2
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

-- Phase 4: Create rate limiting triggers for sensitive operations
CREATE OR REPLACE FUNCTION public.check_family_operation_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  operation_count integer;
BEGIN
  -- Check operations in the last hour based on table
  IF TG_TABLE_NAME = 'family_members' THEN
    SELECT COUNT(*) INTO operation_count
    FROM public.family_members 
    WHERE user_id = auth.uid() 
    AND created_at > (now() - INTERVAL '1 hour');
    
    IF operation_count >= 10 THEN
      RAISE EXCEPTION 'Rate limit exceeded for family member operations';
    END IF;
    
  ELSIF TG_TABLE_NAME = 'family_contact_secure' THEN
    SELECT COUNT(*) INTO operation_count
    FROM public.family_contact_audit_log 
    WHERE accessed_by = auth.uid() 
    AND access_timestamp > (now() - INTERVAL '1 hour');
    
    IF operation_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded for family contact access';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create rate limiting triggers
CREATE TRIGGER family_members_rate_limit
  BEFORE INSERT OR UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_family_operation_rate_limit();

CREATE TRIGGER family_contact_rate_limit
  BEFORE SELECT ON public.family_contact_secure
  FOR EACH ROW
  EXECUTE FUNCTION public.check_family_operation_rate_limit();

-- Phase 5: Create audit logging for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  ip_address inet,
  user_agent text,
  additional_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Only super admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.get_current_user_role_secure() = 'super_admin');

-- Create logging function
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
      auth.uid(),
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

-- Create security logging triggers for sensitive tables
CREATE TRIGGER family_contact_security_log
  AFTER INSERT OR UPDATE OR DELETE ON public.family_contact_secure
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event();

CREATE TRIGGER family_members_security_log
  AFTER INSERT OR UPDATE OR DELETE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event();

CREATE TRIGGER user_verifications_security_log
  AFTER INSERT OR UPDATE OR DELETE ON public.user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event();