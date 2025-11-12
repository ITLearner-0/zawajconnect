-- Corriger la politique RLS pour permettre aux utilisateurs invités de voir leurs invitations
DROP POLICY IF EXISTS "Users can manage their own family members" ON public.family_members;

-- Nouvelle politique qui permet :
-- 1. De gérer les family_members qu'on a créés (user_id = auth.uid())
-- 2. De voir les invitations qu'on a reçues (invited_user_id = auth.uid())
CREATE POLICY "Users can manage family members they created" 
ON public.family_members 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invitations" 
ON public.family_members 
FOR SELECT 
USING (auth.uid() = invited_user_id);

CREATE POLICY "Users can update their own invitation status" 
ON public.family_members 
FOR UPDATE 
USING (auth.uid() = invited_user_id);