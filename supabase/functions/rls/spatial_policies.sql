
-- Create policies for spatial_ref_sys table
CREATE OR REPLACE FUNCTION public.setup_spatial_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys;
  
  -- Create read-only policy for spatial_ref_sys
  -- This allows authenticated users to read the spatial reference data
  CREATE POLICY "Allow read access to spatial_ref_sys"
    ON public.spatial_ref_sys
    FOR SELECT
    USING (auth.role() = 'authenticated');
    
  RETURN true;
END;
$$;
