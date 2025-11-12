-- Allow family members to view conversation participants for supervised matches
CREATE POLICY "Family members can view supervised conversation participants" 
ON public.conversation_participants 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM family_members fm 
  JOIN matches m ON (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
  WHERE fm.invited_user_id = auth.uid() 
    AND fm.invitation_status = 'accepted' 
    AND fm.can_view_profile = true
    AND m.id = conversation_participants.match_id
));