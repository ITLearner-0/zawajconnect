-- Remove the existing check constraint that's causing the issue
ALTER TABLE public.family_members DROP CONSTRAINT IF EXISTS family_members_relationship_check;

-- Add a proper check constraint that allows the French relationship values
ALTER TABLE public.family_members ADD CONSTRAINT family_members_relationship_check 
CHECK (relationship IN (
  'Père', 'Mère', 'Frère', 'Sœur', 'Oncle', 'Tante', 
  'Grand-père', 'Grand-mère', 'Tuteur/Wali', 'Autre'
));