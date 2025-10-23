-- Ajouter une policy pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));