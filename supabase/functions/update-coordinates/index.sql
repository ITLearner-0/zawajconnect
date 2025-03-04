
-- This file is for reference only and should be manually added to the Supabase SQL Editor

-- Function to update a user's coordinates in the profiles table
CREATE OR REPLACE FUNCTION update_user_coordinates(
  user_id UUID,
  lat FLOAT,
  lng FLOAT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET coordinates = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
