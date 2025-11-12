-- Drop the existing check constraint that's too restrictive
ALTER TABLE public.islamic_preferences 
DROP CONSTRAINT islamic_preferences_beard_preference_check;

-- Add a new constraint that allows null values and empty strings
ALTER TABLE public.islamic_preferences 
ADD CONSTRAINT islamic_preferences_beard_preference_check 
CHECK (beard_preference IS NULL OR beard_preference = '' OR beard_preference IN (
  'full_beard', 'trimmed_beard', 'goatee', 'mustache_only', 
  'clean_shaven', 'not_applicable', 'yes', 'no', 'sometimes', 
  'prefer_not_to_say'
));