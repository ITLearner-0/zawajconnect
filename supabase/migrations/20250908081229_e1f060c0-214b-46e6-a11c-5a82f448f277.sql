-- Allow family members to add themselves as participants to supervised conversations
CREATE POLICY "Family members can add themselves as participants" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 
  FROM family_members fm 
  JOIN matches m ON (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
  WHERE fm.invited_user_id = auth.uid() 
    AND fm.invitation_status = 'accepted' 
    AND m.id = conversation_participants.match_id
    AND conversation_participants.participant_type = 'family_member'
    AND conversation_participants.family_member_id = fm.id
));