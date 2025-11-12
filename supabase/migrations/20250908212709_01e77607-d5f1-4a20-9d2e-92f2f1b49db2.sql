-- Update desired_partner_sect constraint to include all values used in the component
ALTER TABLE islamic_preferences 
DROP CONSTRAINT IF EXISTS islamic_preferences_desired_partner_sect_check;

ALTER TABLE islamic_preferences 
ADD CONSTRAINT islamic_preferences_desired_partner_sect_check 
CHECK (desired_partner_sect = ANY (ARRAY[
  'same_sect'::text,
  'sunni'::text, 
  'shia'::text, 
  'any'::text, 
  'other'::text,
  'open_discussion'::text
]));