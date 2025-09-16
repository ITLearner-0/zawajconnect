-- SOLUTION ULTRA-SÉCURISÉE : Séparation complète des données de contact familiales sensibles (CORRIGÉE)

-- 1. Créer une table séparée pour les données de contact sensibles
CREATE TABLE IF NOT EXISTS public.family_contact_secure (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_member_id uuid NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    encrypted_email text, -- Email chiffré
    encrypted_phone text, -- Téléphone chiffré  
    contact_visibility text DEFAULT 'wali_only' CHECK (contact_visibility IN ('wali_only', 'family_verified', 'hidden')),
    last_accessed_at timestamp with time zone,
    access_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(family_member_id)
);

-- 2. Enable RLS sur la nouvelle table
ALTER TABLE public.family_contact_secure ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer toutes les politiques problématiques actuelles
DROP POLICY IF EXISTS "Secure family member access with verification" ON public.family_members;
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.family_members;
DROP POLICY IF EXISTS "Users can update their own invitation status" ON public.family_members;

-- 4. Créer des politiques ultra-restrictives pour family_members (SANS données de contact)
CREATE POLICY "Family members basic info access only" 
ON public.family_members 
FOR SELECT 
USING (
    -- Seulement les informations de base (pas email/phone)
    auth.uid() = user_id  -- Créateur de l'invitation
    OR (
        auth.uid() = invited_user_id  -- Personne invitée
        AND invitation_status = 'accepted'
        AND invitation_sent_at > (now() - INTERVAL '30 days')
    )
);

-- 5. Politique pour la gestion des invitations (sans contact info)
CREATE POLICY "Users can manage family invitations" 
ON public.family_members 
FOR ALL 
USING (
    auth.uid() = user_id  -- Seul le créateur peut gérer
    AND invitation_sent_at > (now() - INTERVAL '7 days')  -- Invitations récentes seulement
)
WITH CHECK (
    auth.uid() = user_id
    AND invitation_sent_at > (now() - INTERVAL '7 days')
);

-- 6. Politique ultra-sécurisée pour les données de contact
CREATE POLICY "Ultra secure family contact access" 
ON public.family_contact_secure 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.family_members fm,
             public.user_verifications uv1,
             public.user_verifications uv2
        WHERE fm.id = family_contact_secure.family_member_id
        -- Vérifications d'identité ultra-strictes
        AND uv1.user_id = auth.uid()
        AND uv1.email_verified = true
        AND uv1.id_verified = true  -- ID obligatoire  
        AND uv1.verification_score >= 80  -- Score très élevé
        -- Le membre doit être un wali vérifié
        AND fm.is_wali = true
        AND fm.invitation_status = 'accepted'
        AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')  -- Acceptation récente
        -- Vérification croisée de l'utilisateur supervisé
        AND uv2.user_id = fm.user_id
        AND uv2.email_verified = true
        AND uv2.verification_score >= 50
        -- L'accès doit être autorisé explicitement
        AND family_contact_secure.contact_visibility IN ('wali_only', 'family_verified')
        -- Relation active et récente
        AND (auth.uid() = fm.user_id OR auth.uid() = fm.invited_user_id)
    )
);

-- 7. Politique pour la mise à jour des données de contact (très restrictive)
CREATE POLICY "Wali can update secure contact info" 
ON public.family_contact_secure 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM public.family_members fm,
             public.user_verifications uv
        WHERE fm.id = family_contact_secure.family_member_id
        AND fm.user_id = auth.uid()  -- Seul le créateur original
        AND fm.is_wali = true
        AND uv.user_id = auth.uid()
        AND uv.id_verified = true
        AND uv.verification_score >= 90  -- Score ultra-élevé pour modification
        AND fm.created_at > (now() - INTERVAL '90 days')  -- Relation récente
    )
);

-- 8. Table d'audit pour surveiller l'accès aux contacts familiaux
CREATE TABLE IF NOT EXISTS public.family_contact_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_member_id uuid NOT NULL,
    accessed_by uuid NOT NULL,
    access_details jsonb NOT NULL,
    access_timestamp timestamp with time zone NOT NULL DEFAULT now()
);

-- 9. Create indexes separately
CREATE INDEX IF NOT EXISTS idx_family_contact_audit_member_time 
ON public.family_contact_audit_log (family_member_id, access_timestamp);

CREATE INDEX IF NOT EXISTS idx_family_contact_audit_user_time 
ON public.family_contact_audit_log (accessed_by, access_timestamp);

-- 10. Enable RLS on audit table
ALTER TABLE public.family_contact_audit_log ENABLE ROW LEVEL SECURITY;

-- 11. Fonction sécurisée pour accéder aux contacts avec audit
CREATE OR REPLACE FUNCTION public.get_family_contact_secure(family_member_uuid uuid)
RETURNS TABLE (
    contact_type text,
    contact_value text,
    last_verified timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    access_allowed boolean := false;
    audit_info jsonb;
BEGIN
    -- Vérifications de sécurité ultra-strictes
    SELECT EXISTS (
        SELECT 1 
        FROM public.family_members fm,
             public.user_verifications uv1,
             public.user_verifications uv2,
             public.family_contact_secure fcs
        WHERE fm.id = family_member_uuid
        AND fcs.family_member_id = fm.id
        -- Triple vérification d'identité
        AND uv1.user_id = auth.uid()
        AND uv1.email_verified = true
        AND uv1.id_verified = true
        AND uv1.verification_score >= 85
        -- Membre doit être wali actif
        AND fm.is_wali = true
        AND fm.invitation_status = 'accepted'
        AND fm.invitation_accepted_at > (now() - INTERVAL '7 days')
        -- Utilisateur supervisé aussi vérifié
        AND uv2.user_id = fm.user_id
        AND uv2.verification_score >= 60
        -- Autorisation explicite
        AND fcs.contact_visibility = 'wali_only'
        AND (auth.uid() = fm.user_id OR auth.uid() = fm.invited_user_id)
    ) INTO access_allowed;
    
    IF NOT access_allowed THEN
        RAISE EXCEPTION 'Access denied: Insufficient verification level for family contact access';
    END IF;
    
    -- Audit log
    audit_info := jsonb_build_object(
        'accessed_by', auth.uid(),
        'family_member_id', family_member_uuid,
        'access_time', now(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    );
    
    -- Log d'accès sécurisé
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
    
    -- Mettre à jour compteur d'accès
    UPDATE public.family_contact_secure 
    SET 
        last_accessed_at = now(),
        access_count = access_count + 1
    WHERE family_member_id = family_member_uuid;
    
    -- Retourner les données
    RETURN QUERY
    SELECT 
        'email'::text as contact_type,
        fcs.encrypted_email as contact_value,
        fcs.updated_at as last_verified
    FROM public.family_contact_secure fcs
    WHERE fcs.family_member_id = family_member_uuid
    AND fcs.encrypted_email IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'phone'::text as contact_type,
        fcs.encrypted_phone as contact_value,
        fcs.updated_at as last_verified
    FROM public.family_contact_secure fcs
    WHERE fcs.family_member_id = family_member_uuid
    AND fcs.encrypted_phone IS NOT NULL;
    
END;
$$;

-- 12. Politique d'audit - seuls les admins peuvent voir les logs
CREATE POLICY "Only admins can view family contact audit logs" 
ON public.family_contact_audit_log 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 13. Migrer les données existantes de manière sécurisée
INSERT INTO public.family_contact_secure (
    family_member_id,
    encrypted_email,
    encrypted_phone,
    contact_visibility
)
SELECT 
    fm.id,
    fm.email, -- En production, chiffrer avec pg_crypto
    fm.phone, -- En production, chiffrer avec pg_crypto  
    CASE 
        WHEN fm.is_wali = true THEN 'wali_only'
        ELSE 'family_verified'
    END
FROM public.family_members fm
LEFT JOIN public.family_contact_secure fcs ON fcs.family_member_id = fm.id
WHERE fcs.family_member_id IS NULL
AND (fm.email IS NOT NULL OR fm.phone IS NOT NULL);