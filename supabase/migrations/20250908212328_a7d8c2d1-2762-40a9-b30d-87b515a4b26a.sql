-- Update prayer_frequency constraint to include missing values
ALTER TABLE islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_prayer_frequency_check;

ALTER TABLE islamic_preferences 
ADD CONSTRAINT islamic_preferences_prayer_frequency_check 
CHECK (prayer_frequency = ANY (ARRAY[
  '5_times_daily'::text, 
  'often'::text,
  'sometimes'::text, 
  'fridays_only'::text, 
  'occasionally'::text,
  'rarely'::text,
  'never'::text
]));

-- Update other constraints to be more comprehensive
ALTER TABLE islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_quran_reading_check;

ALTER TABLE islamic_preferences 
ADD CONSTRAINT islamic_preferences_quran_reading_check 
CHECK (quran_reading = ANY (ARRAY[
  'daily'::text, 
  'weekly'::text, 
  'monthly'::text, 
  'occasionally'::text,
  'rarely'::text,
  'learning'::text
]));

-- Update hijab_preference constraint  
ALTER TABLE islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_hijab_preference_check;

ALTER TABLE islamic_preferences 
ADD CONSTRAINT islamic_preferences_hijab_preference_check 
CHECK (hijab_preference = ANY (ARRAY[
  'always'::text,
  'most_times'::text,
  'sometimes'::text,
  'never'::text,
  'not_applicable'::text,
  'yes'::text, 
  'no'::text, 
  'prefer_not_to_say'::text
]));

-- Update beard_preference constraint
ALTER TABLE islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_beard_preference_check;

ALTER TABLE islamic_preferences 
ADD CONSTRAINT islamic_preferences_beard_preference_check 
CHECK (beard_preference = ANY (ARRAY[
  'full_beard'::text,
  'trimmed_beard'::text,
  'goatee'::text,
  'mustache_only'::text,
  'clean_shaven'::text,
  'not_applicable'::text,
  'yes'::text, 
  'no'::text,
  'sometimes'::text,
  'prefer_not_to_say'::text
]));

-- Update smoking constraint
ALTER TABLE islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_smoking_check;

ALTER TABLE islamic_preferences 
ADD CONSTRAINT islamic_preferences_smoking_check 
CHECK (smoking = ANY (ARRAY[
  'never'::text,
  'occasionally'::text, 
  'regularly'::text,
  'trying_to_quit'::text
]));