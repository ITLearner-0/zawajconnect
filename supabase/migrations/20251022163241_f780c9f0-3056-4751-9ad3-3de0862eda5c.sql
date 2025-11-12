-- Fix create_family_invitation to use only existing columns
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
BEGIN
    -- Generate a unique invitation token
    invitation_token := gen_random_uuid();
    
    -- Create family member record WITHOUT email (email goes to family_contact_secure)
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
        invitation_token,
        true,
        true
    ) RETURNING id INTO family_member_id;
    
    -- Store email securely in family_contact_secure
    INSERT INTO public.family_contact_secure (
        family_member_id,
        encrypted_email,
        encrypted_phone
    ) VALUES (
        family_member_id,
        p_email,
        NULL
    );
    
    RETURN invitation_token;
END;
$function$;