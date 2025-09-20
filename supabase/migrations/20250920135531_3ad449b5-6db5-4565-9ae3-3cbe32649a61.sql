-- Fix family_meetings table security vulnerabilities (corrected)
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

-- Add updated_at trigger for family meetings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_family_meetings_updated_at') THEN
    CREATE TRIGGER update_family_meetings_updated_at
      BEFORE UPDATE ON public.family_meetings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;