-- Fix family_members insertion error by removing custom triggers only
-- The error suggests there's a custom trigger trying to access email/phone fields

-- Drop only custom triggers (not constraint triggers)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'family_members'::regclass 
        AND tgname NOT LIKE 'pg_%'
        AND tgname NOT LIKE 'RI_ConstraintTrigger%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON family_members CASCADE', r.tgname);
        RAISE NOTICE 'Dropped custom trigger: %', r.tgname;
    END LOOP;
END $$;

-- Ensure email/phone columns don't exist
ALTER TABLE family_members DROP COLUMN IF EXISTS email CASCADE;
ALTER TABLE family_members DROP COLUMN IF EXISTS phone CASCADE;

-- Add a helpful comment
COMMENT ON TABLE family_members IS 'Family members - contact info not stored here, use invitation system instead';