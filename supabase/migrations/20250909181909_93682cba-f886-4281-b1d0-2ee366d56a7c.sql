-- Check current gender constraint and modify if needed
-- First, let's see what the current constraint looks like
DO $$
DECLARE
    constraint_exists boolean;
BEGIN
    -- Check if the constraint exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_gender_check'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        -- Drop the existing constraint
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_gender_check;
        RAISE NOTICE 'Dropped existing gender constraint';
    END IF;
    
    -- Add a new, more lenient constraint that handles potential whitespace or case issues
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_gender_check 
    CHECK (gender IS NULL OR TRIM(LOWER(gender)) IN ('male', 'female'));
    
    RAISE NOTICE 'Added new gender constraint that handles case and whitespace';
END $$;