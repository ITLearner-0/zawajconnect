-- Update the messages RLS policy to allow family supervisors to send messages
DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.messages;

CREATE POLICY "Users and family supervisors can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  (auth.uid() = sender_id) AND (
    -- Original condition: user is part of the match
    (EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id 
      AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid())) 
      AND matches.is_mutual = true
    ))
    OR
    -- New condition: user is a family member supervising this match
    (EXISTS (
      SELECT 1 FROM family_members fm
      JOIN matches m ON ((fm.user_id = m.user1_id) OR (fm.user_id = m.user2_id))
      WHERE m.id = messages.match_id 
      AND fm.invited_user_id = auth.uid()
      AND fm.invitation_status = 'accepted'
      AND fm.can_communicate = true
      AND fm.is_wali = true
    ))
  )
);

-- Also update the SELECT policy to allow family supervisors to read messages
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.messages;

CREATE POLICY "Users and family supervisors can view messages"
ON public.messages
FOR SELECT
USING (
  -- Original condition: user is part of the match
  (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id 
    AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid()))
  ))
  OR
  -- New condition: user is a family member supervising this match
  (EXISTS (
    SELECT 1 FROM family_members fm
    JOIN matches m ON ((fm.user_id = m.user1_id) OR (fm.user_id = m.user2_id))
    WHERE m.id = messages.match_id 
    AND fm.invited_user_id = auth.uid()
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
  ))
);