-- Allow family members to view matches of supervised users
CREATE POLICY "Family members can view supervised user matches" 
ON public.matches 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM family_members fm 
  WHERE fm.invited_user_id = auth.uid() 
    AND fm.invitation_status = 'accepted' 
    AND fm.can_view_profile = true
    AND (fm.user_id = matches.user1_id OR fm.user_id = matches.user2_id)
));