-- Drop and recreate the function to refresh cache
DROP FUNCTION IF EXISTS public.create_family_invitation(uuid, text, text, text, boolean);

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
AS $$
DECLARE
    invitation_token UUID;
    family_member_id UUID;
BEGIN
    -- Generate a unique invitation token
    invitation_token := gen_random_uuid();
    
    -- Create family member record with invitation
    INSERT INTO public.family_members (
        user_id,
        full_name,
        email,
        relationship,
        is_wali,
        invitation_sent_at,
        invitation_status,
        invitation_token
    ) VALUES (
        p_user_id,
        p_full_name,
        p_email,
        p_relationship,
        p_is_wali,
        now(),
        'pending',
        invitation_token
    ) RETURNING id INTO family_member_id;
    
    RETURN invitation_token;
END;
$$;