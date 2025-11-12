-- Redonner les droits de super administrateur à cgoldrock@gmail.com
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Trouver l'utilisateur par son email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'cgoldrock@gmail.com';
    
    -- Si l'utilisateur existe
    IF target_user_id IS NOT NULL THEN
        -- Supprimer tout rôle existant pour cet utilisateur
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        
        -- Ajouter le rôle super_admin
        INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
        VALUES (target_user_id, 'super_admin', target_user_id, now());
        
        RAISE NOTICE 'Super admin role granted to user: %', target_user_id;
    ELSE
        RAISE NOTICE 'User with email cgoldrock@gmail.com not found';
    END IF;
END $$;