
-- Add the missing polygamy_stance column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS polygamy_stance TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.polygamy_stance IS 'User''s stance on polygamy: oui, non, or ouvert';
