-- RADICAL FIX: Make all Islamic preferences constraints flexible to allow empty values
-- This prevents constraint violations when users haven't filled all fields

-- Drop and recreate all check constraints to allow NULL and empty strings

-- Hijab preference
ALTER TABLE public.islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_hijab_preference_check;

ALTER TABLE public.islamic_preferences 
ADD CONSTRAINT islamic_preferences_hijab_preference_check 
CHECK (hijab_preference IS NULL OR hijab_preference = '' OR hijab_preference IN (
  'always', 'most_times', 'sometimes', 'never', 'not_applicable', 
  'yes', 'no', 'prefer_not_to_say'
));

-- Desired partner sect
ALTER TABLE public.islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_desired_partner_sect_check;

ALTER TABLE public.islamic_preferences 
ADD CONSTRAINT islamic_preferences_desired_partner_sect_check 
CHECK (desired_partner_sect IS NULL OR desired_partner_sect = '' OR desired_partner_sect IN (
  'same_sect', 'sunni', 'shia', 'any', 'other', 'open_discussion'
));

-- Importance of religion
ALTER TABLE public.islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_importance_of_religion_check;

ALTER TABLE public.islamic_preferences 
ADD CONSTRAINT islamic_preferences_importance_of_religion_check 
CHECK (importance_of_religion IS NULL OR importance_of_religion = '' OR importance_of_religion IN (
  'very_important', 'important', 'somewhat_important', 'not_important', 'extremely_important'
));

-- Prayer frequency
ALTER TABLE public.islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_prayer_frequency_check;

ALTER TABLE public.islamic_preferences 
ADD CONSTRAINT islamic_preferences_prayer_frequency_check 
CHECK (prayer_frequency IS NULL OR prayer_frequency = '' OR prayer_frequency IN (
  '5_times_daily', 'often', 'sometimes', 'fridays_only', 'occasionally', 'rarely', 'never'
));

-- Quran reading
ALTER TABLE public.islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_quran_reading_check;

ALTER TABLE public.islamic_preferences 
ADD CONSTRAINT islamic_preferences_quran_reading_check 
CHECK (quran_reading IS NULL OR quran_reading = '' OR quran_reading IN (
  'daily', 'weekly', 'monthly', 'occasionally', 'rarely', 'learning'
));

-- Sect
ALTER TABLE public.islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_sect_check;

ALTER TABLE public.islamic_preferences 
ADD CONSTRAINT islamic_preferences_sect_check 
CHECK (sect IS NULL OR sect = '' OR sect IN (
  'sunni', 'shia', 'other', 'prefer_not_to_say'
));

-- Smoking
ALTER TABLE public.islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_smoking_check;

ALTER TABLE public.islamic_preferences 
ADD CONSTRAINT islamic_preferences_smoking_check 
CHECK (smoking IS NULL OR smoking = '' OR smoking IN (
  'never', 'occasionally', 'regularly', 'trying_to_quit'
));