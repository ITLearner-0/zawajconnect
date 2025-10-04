-- CRITICAL SECURITY FIX: Migrate family contact data to secure table
-- This migration moves email and phone from family_members to family_contact_secure
-- which has much stricter RLS protection (wali status, verification_score>=85, id_verified)

-- Step 1: Migrate existing contact data to family_contact_secure table
INSERT INTO public.family_contact_secure (
  family_member_id,
  encrypted_email,
  encrypted_phone,
  contact_visibility
)
SELECT 
  fm.id,
  fm.email,
  fm.phone,
  'wali_only'::text
FROM public.family_members fm
WHERE (fm.email IS NOT NULL AND fm.email != '') 
   OR (fm.phone IS NOT NULL AND fm.phone != '')
ON CONFLICT (family_member_id) DO UPDATE SET
  encrypted_email = EXCLUDED.encrypted_email,
  encrypted_phone = EXCLUDED.encrypted_phone,
  updated_at = now();

-- Step 2: Drop the email and phone columns from family_members table
-- This ensures all future contact access goes through the secure table
ALTER TABLE public.family_members DROP COLUMN IF EXISTS email;
ALTER TABLE public.family_members DROP COLUMN IF EXISTS phone;

-- Step 3: Add security event log
DO $$
BEGIN
  PERFORM log_security_event(
    '00000000-0000-0000-0000-000000000000'::uuid,
    'contact_data_migration',
    'high',
    'Family contact data migrated from family_members to family_contact_secure table'
  );
EXCEPTION WHEN OTHERS THEN
  -- Ignore if log function doesn't exist or fails
  NULL;
END $$;