-- ============================================================================
-- SECURITY FIX: Implement actual encryption for family_contact_secure table
-- ============================================================================
-- This migration implements column-level encryption using pgcrypto for PII.
-- 
-- CRITICAL: After running this migration, you MUST set the encryption key:
-- Run in Supabase SQL Editor:
-- ALTER DATABASE postgres SET app.encryption_key = 'your-secure-random-key-here';
-- 
-- Generate a secure key with: openssl rand -base64 32
-- ============================================================================

-- Ensure pgcrypto is available (should already be installed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- Step 1: Update create_family_invitation function to ENCRYPT data
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_family_invitation(
    p_user_id uuid, 
    p_full_name text, 
    p_email text, 
    p_relationship text, 
    p_is_wali boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    invitation_token UUID;
    family_member_id UUID;
    encryption_key TEXT;
BEGIN
    -- Get encryption key from database settings
    BEGIN
        encryption_key := current_setting('app.encryption_key');
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Encryption key not configured. Run: ALTER DATABASE postgres SET app.encryption_key = ''your-key'';';
    END;
    
    -- Create family member record WITHOUT email
    INSERT INTO public.family_members (
        user_id,
        full_name,
        relationship,
        is_wali,
        invitation_sent_at,
        invitation_status,
        invitation_token,
        can_view_profile,
        can_communicate
    ) VALUES (
        p_user_id,
        p_full_name,
        p_relationship,
        p_is_wali,
        now(),
        'pending',
        gen_random_uuid(),
        true,
        true
    ) RETURNING id, invitation_token INTO family_member_id, invitation_token;
    
    -- Store email ENCRYPTED in family_contact_secure
    INSERT INTO public.family_contact_secure (
        family_member_id,
        encrypted_email,
        encrypted_phone
    ) VALUES (
        family_member_id,
        pgp_sym_encrypt(p_email, encryption_key),  -- ACTUAL ENCRYPTION
        NULL
    );
    
    RETURN invitation_token;
END;
$function$;

-- ============================================================================
-- Step 2: Update get_family_contact_secure function to DECRYPT data
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_family_contact_secure(family_member_uuid uuid)
RETURNS TABLE(contact_type text, contact_value text, last_verified timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    access_allowed boolean := false;
    audit_info jsonb;
    encryption_key TEXT;
BEGIN
    -- Get encryption key
    BEGIN
        encryption_key := current_setting('app.encryption_key');
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Encryption key not configured';
    END;
    
    -- Ultra-strict security verification
    SELECT EXISTS (
        SELECT 1 
        FROM public.family_members fm,
             public.user_verifications uv1,
             public.user_verifications uv2,
             public.family_contact_secure fcs
        WHERE fm.id = family_member_uuid
        AND fcs.family_member_id = fm.id
        -- Triple identity verification
        AND uv1.user_id = auth.uid()
        AND uv1.email_verified = true
        AND uv1.id_verified = true
        AND uv1.verification_score >= 85
        -- Must be wali
        AND fm.is_wali = true
        AND fm.invitation_status = 'accepted'
        AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
        -- Supervised user also verified
        AND uv2.user_id = fm.user_id
        AND uv2.verification_score >= 60
        -- Explicit authorization
        AND fcs.contact_visibility = 'wali_only'
        AND (auth.uid() = fm.user_id OR auth.uid() = fm.invited_user_id)
    ) INTO access_allowed;
    
    IF NOT access_allowed THEN
        RAISE EXCEPTION 'Access denied: Insufficient verification level for family contact access';
    END IF;
    
    -- Audit logging
    audit_info := jsonb_build_object(
        'accessed_by', auth.uid(),
        'family_member_id', family_member_uuid,
        'access_time', now(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    );
    
    INSERT INTO public.family_contact_audit_log (
        family_member_id, 
        accessed_by, 
        access_details, 
        access_timestamp
    ) VALUES (
        family_member_uuid,
        auth.uid(),
        audit_info,
        now()
    );
    
    -- Update access tracking
    UPDATE public.family_contact_secure 
    SET 
        last_accessed_at = now(),
        access_count = access_count + 1
    WHERE family_member_id = family_member_uuid;
    
    -- Return DECRYPTED data
    RETURN QUERY
    SELECT 
        'email'::text as contact_type,
        pgp_sym_decrypt(fcs.encrypted_email::bytea, encryption_key)::text as contact_value,
        fcs.updated_at as last_verified
    FROM public.family_contact_secure fcs
    WHERE fcs.family_member_id = family_member_uuid
    AND fcs.encrypted_email IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'phone'::text as contact_type,
        pgp_sym_decrypt(fcs.encrypted_phone::bytea, encryption_key)::text as contact_value,
        fcs.updated_at as last_verified
    FROM public.family_contact_secure fcs
    WHERE fcs.family_member_id = family_member_uuid
    AND fcs.encrypted_phone IS NOT NULL;
    
END;
$function$;

-- ============================================================================
-- Step 3: Migrate existing PLAINTEXT data to ENCRYPTED format
-- ============================================================================
DO $$
DECLARE
    rec RECORD;
    encryption_key TEXT;
    plaintext_count INTEGER := 0;
    encrypted_count INTEGER := 0;
BEGIN
    -- Try to get encryption key
    BEGIN
        encryption_key := current_setting('app.encryption_key');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Encryption key not set. Existing data will remain plaintext until key is configured.';
        RAISE NOTICE 'To set key: ALTER DATABASE postgres SET app.encryption_key = ''your-secure-key'';';
        RETURN;
    END;
    
    -- Count records with plaintext data
    SELECT COUNT(*) INTO plaintext_count
    FROM public.family_contact_secure
    WHERE encrypted_email IS NOT NULL;
    
    RAISE NOTICE 'Found % records with contact data to encrypt', plaintext_count;
    
    -- Encrypt existing plaintext emails
    FOR rec IN 
        SELECT family_member_id, encrypted_email, encrypted_phone
        FROM public.family_contact_secure
        WHERE encrypted_email IS NOT NULL OR encrypted_phone IS NOT NULL
    LOOP
        BEGIN
            -- Check if already encrypted (will fail pgp_sym_decrypt if not)
            IF rec.encrypted_email IS NOT NULL THEN
                BEGIN
                    PERFORM pgp_sym_decrypt(rec.encrypted_email::bytea, encryption_key);
                    -- Already encrypted, skip
                    CONTINUE;
                EXCEPTION WHEN OTHERS THEN
                    -- Not encrypted, proceed with encryption
                END;
            END IF;
            
            -- Encrypt plaintext data
            UPDATE public.family_contact_secure
            SET 
                encrypted_email = CASE 
                    WHEN rec.encrypted_email IS NOT NULL 
                    THEN pgp_sym_encrypt(rec.encrypted_email, encryption_key)
                    ELSE NULL
                END,
                encrypted_phone = CASE 
                    WHEN rec.encrypted_phone IS NOT NULL 
                    THEN pgp_sym_encrypt(rec.encrypted_phone, encryption_key)
                    ELSE NULL
                END
            WHERE family_member_id = rec.family_member_id;
            
            encrypted_count := encrypted_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to encrypt record %: %', rec.family_member_id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Successfully encrypted % records', encrypted_count;
END $$;

-- ============================================================================
-- IMPORTANT: After this migration runs, you MUST configure the encryption key
-- ============================================================================
-- Run this in Supabase SQL Editor (replace with your own secure key):
-- 
-- ALTER DATABASE postgres SET app.encryption_key = 'YOUR-SECURE-RANDOM-KEY-HERE';
-- 
-- Generate a secure key:
-- openssl rand -base64 32
-- 
-- Store this key securely! If lost, encrypted data cannot be recovered.
-- ============================================================================