-- Fix family_meetings table security vulnerabilities
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Family members can manage meetings for their supervised users" ON public.family_meetings;

-- Create restrictive policies for family_meetings table

-- 1. SELECT Policy - Only allow verified family members and organizers to view meetings
CREATE POLICY "Verified family members can view supervised meetings" ON public.family_meetings
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    -- Organizer can always view their own meetings
    auth.uid() = organizer_id
    OR
    -- Family members can view meetings for users they supervise (with verification)
    EXISTS (
      SELECT 1 
      FROM family_members fm,
           matches m,
           user_verifications uv
      WHERE m.id = family_meetings.match_id
      AND fm.invited_user_id = auth.uid()
      AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
      AND fm.invitation_status = 'accepted'
      AND fm.can_view_profile = true
      AND fm.is_wali = true
      AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')
      AND uv.user_id = auth.uid()
      AND uv.email_verified = true
      AND uv.verification_score >= 70
    )
    OR
    -- Users involved in the match can view meetings
    EXISTS (
      SELECT 1
      FROM matches m,
           user_verifications uv
      WHERE m.id = family_meetings.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND uv.user_id = auth.uid()
      AND uv.email_verified = true
      AND uv.verification_score >= 60
    )
  )
);

-- 2. INSERT Policy - Only verified wali and organizers can create meetings
CREATE POLICY "Verified wali can create meetings" ON public.family_meetings
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid() = organizer_id
  AND (
    -- Must be a verified wali for the users in the match
    EXISTS (
      SELECT 1 
      FROM family_members fm,
           matches m,
           user_verifications uv
      WHERE m.id = family_meetings.match_id
      AND fm.invited_user_id = auth.uid()
      AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
      AND fm.invitation_status = 'accepted'
      AND fm.is_wali = true
      AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
      AND uv.user_id = auth.uid()
      AND uv.email_verified = true
      AND uv.id_verified = true
      AND uv.verification_score >= 80
    )
    OR
    -- Or be one of the users in the match (with verification)
    EXISTS (
      SELECT 1
      FROM matches m,
           user_verifications uv
      WHERE m.id = family_meetings.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND uv.user_id = auth.uid()
      AND uv.email_verified = true
      AND uv.verification_score >= 70
    )
  )
  -- Rate limiting: max 5 meetings per day
  AND (
    SELECT COUNT(*) 
    FROM family_meetings fm_count 
    WHERE fm_count.organizer_id = auth.uid()
    AND fm_count.created_at > (now() - INTERVAL '24 hours')
  ) < 5
);

-- 3. UPDATE Policy - Only organizers and authorized family members can update
CREATE POLICY "Organizers and wali can update meetings" ON public.family_meetings
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    -- Organizer can update their meetings
    auth.uid() = organizer_id
    OR
    -- Verified wali can update meetings for supervised users
    EXISTS (
      SELECT 1 
      FROM family_members fm,
           matches m,
           user_verifications uv
      WHERE m.id = family_meetings.match_id
      AND fm.invited_user_id = auth.uid()
      AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
      AND fm.invitation_status = 'accepted'
      AND fm.is_wali = true
      AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')
      AND uv.user_id = auth.uid()
      AND uv.email_verified = true
      AND uv.verification_score >= 75
    )
  )
) WITH CHECK (
  -- Cannot change organizer_id or match_id after creation
  organizer_id = family_meetings.organizer_id
  AND match_id = family_meetings.match_id
);

-- 4. DELETE Policy - Only organizers and verified wali can delete recent meetings
CREATE POLICY "Organizers and wali can delete recent meetings" ON public.family_meetings
FOR DELETE USING (
  auth.uid() IS NOT NULL AND (
    -- Organizer can delete their own meetings
    auth.uid() = organizer_id
    OR
    -- Verified wali can delete meetings (with restrictions)
    EXISTS (
      SELECT 1 
      FROM family_members fm,
           matches m,
           user_verifications uv
      WHERE m.id = family_meetings.match_id
      AND fm.invited_user_id = auth.uid()
      AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
      AND fm.invitation_status = 'accepted'
      AND fm.is_wali = true
      AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
      AND uv.user_id = auth.uid()
      AND uv.email_verified = true
      AND uv.id_verified = true
      AND uv.verification_score >= 85
    )
  )
  -- Only allow deletion of future meetings or very recent ones (within 2 hours)
  AND (
    scheduled_datetime > now()
    OR created_at > (now() - INTERVAL '2 hours')
  )
);

-- Create audit table for meeting access (same pattern as family members)
CREATE TABLE IF NOT EXISTS public.family_meetings_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid NOT NULL,
  accessed_by uuid NOT NULL,
  access_type text NOT NULL,
  access_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit table
ALTER TABLE public.family_meetings_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view meeting audit logs" ON public.family_meetings_audit
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('super_admin', 'admin', 'moderator')
  )
);

-- Create function to check meeting access rate limit
CREATE OR REPLACE FUNCTION public.check_meeting_access_rate_limit(user_uuid uuid)
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
  FROM public.family_meetings_audit 
  WHERE accessed_by = user_uuid 
  AND access_timestamp > (now() - INTERVAL '1 hour');
  
  -- Allow max 20 meeting accesses per hour
  RETURN access_count < 20;
END;
$$;

-- Create trigger to audit meeting access
CREATE OR REPLACE FUNCTION public.audit_meeting_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check rate limit first
  IF NOT public.check_meeting_access_rate_limit(auth.uid()) THEN
    RAISE EXCEPTION 'Rate limit exceeded for meeting access';
  END IF;
  
  -- Log the access attempt
  INSERT INTO public.family_meetings_audit (
    meeting_id,
    accessed_by, 
    access_type
  ) VALUES (
    NEW.id,
    auth.uid(),
    'meeting_view'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for meeting access auditing
CREATE TRIGGER audit_family_meeting_access
  AFTER SELECT ON public.family_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_meeting_access();

-- Create updated_at trigger for family meetings
CREATE TRIGGER update_family_meetings_updated_at
  BEFORE UPDATE ON public.family_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();