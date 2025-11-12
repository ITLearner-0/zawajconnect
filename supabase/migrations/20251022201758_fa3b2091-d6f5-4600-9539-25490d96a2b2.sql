-- Fix ambiguous column reference in create_family_invitation function
-- The issue: invitation_token is both a column name and a variable name

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
    v_invitation_token UUID;  -- Renamed from invitation_token to avoid ambiguity
    family_member_id UUID;
    encryption_key TEXT;
    use_encryption BOOLEAN := false;
BEGIN
    -- Try to get encryption key (optional)
    BEGIN
        encryption_key := current_setting('app.encryption_key');
        use_encryption := true;
        RAISE NOTICE 'Encryption key found - using encrypted storage';
    EXCEPTION WHEN OTHERS THEN
        use_encryption := false;
        RAISE WARNING 'Encryption key not configured - storing data in plaintext. Configure with: ALTER DATABASE postgres SET app.encryption_key = ''your-key'';';
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
    ) RETURNING id, invitation_token INTO family_member_id, v_invitation_token;  -- Fixed ambiguity
    
    -- Store email (encrypted if key available, plaintext otherwise)
    IF use_encryption THEN
        INSERT INTO public.family_contact_secure (
            family_member_id,
            encrypted_email,
            encrypted_phone
        ) VALUES (
            family_member_id,
            pgp_sym_encrypt(p_email, encryption_key),
            NULL
        );
    ELSE
        -- Temporary plaintext storage until encryption is configured
        INSERT INTO public.family_contact_secure (
            family_member_id,
            encrypted_email,
            encrypted_phone
        ) VALUES (
            family_member_id,
            p_email::bytea,  -- Store as bytea to maintain column type
            NULL
        );
    END IF;
    
    RETURN v_invitation_token;  -- Return the renamed variable
END;
$function$;