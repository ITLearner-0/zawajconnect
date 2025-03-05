
-- This file is for reference only and should be manually added to the Supabase SQL Editor

-- Function to find nearby profiles within a certain distance
CREATE OR REPLACE FUNCTION find_nearby_profiles(
  user_id UUID,
  max_distance_km FLOAT
) RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  practice_level TEXT,
  education TEXT,
  distance FLOAT,
  latitude FLOAT,
  longitude FLOAT
) AS $$
DECLARE
  user_location GEOGRAPHY;
BEGIN
  -- Get the user's coordinates
  SELECT coordinates INTO user_location
  FROM profiles
  WHERE profiles.id = user_id;
  
  -- If user has no coordinates, return empty result
  IF user_location IS NULL THEN
    RETURN;
  END IF;
  
  -- Find nearby profiles
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date::date))::INTEGER AS age,
    p.religious_practice_level AS practice_level,
    p.education_level AS education,
    ST_Distance(user_location, p.coordinates) / 1000 AS distance,
    ST_Y(p.coordinates::geometry) AS latitude,
    ST_X(p.coordinates::geometry) AS longitude
  FROM profiles p
  WHERE 
    p.id <> user_id
    AND ST_DWithin(user_location, p.coordinates, max_distance_km * 1000)
    AND p.coordinates IS NOT NULL
    AND p.visibility_settings->>'public_profile' = 'true'
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;
