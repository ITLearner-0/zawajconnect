-- ============================================================================
-- HOTFIX: Make encryption optional until key is configured
-- ============================================================================
-- This allows the invitation system to work without encryption if the key
-- is not yet configured, while still using encryption when available.
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
    ) RETURNING id, invitation_token INTO family_member_id, invitation_token;
    
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
    
    RETURN invitation_token;
END;
$function$;

-- ============================================================================
-- Update get_family_contact_secure to handle both encrypted and plaintext
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
    use_encryption BOOLEAN := false;
BEGIN
    -- Try to get encryption key
    BEGIN
        encryption_key := current_setting('app.encryption_key');
        use_encryption := true;
    EXCEPTION WHEN OTHERS THEN
        use_encryption := false;
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
        AND uv1.user_id = auth.uid()
        AND uv1.email_verified = true
        AND uv1.id_verified = true
        AND uv1.verification_score >= 85
        AND fm.is_wali = true
        AND fm.invitation_status = 'accepted'
        AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
        AND uv2.user_id = fm.user_id
        AND uv2.verification_score >= 60
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
        'access_time', now()
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
    
    -- Return data (decrypt if encrypted, convert if plaintext)
    IF use_encryption THEN
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
    ELSE
        -- Return plaintext data
        RETURN QUERY
        SELECT 
            'email'::text as contact_type,
            convert_from(fcs.encrypted_email, 'UTF8')::text as contact_value,
            fcs.updated_at as last_verified
        FROM public.family_contact_secure fcs
        WHERE fcs.family_member_id = family_member_uuid
        AND fcs.encrypted_email IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'phone'::text as contact_type,
            convert_from(fcs.encrypted_phone, 'UTF8')::text as contact_value,
            fcs.updated_at as last_verified
        FROM public.family_contact_secure fcs
        WHERE fcs.family_member_id = family_member_uuid
        AND fcs.encrypted_phone IS NOT NULL;
    END IF;
    
END;
$function$;