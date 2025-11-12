-- SOLUTION COMPLÈTE : Séparation totale des données sensibles et non-sensibles

-- 1. Supprimer toutes les politiques actuelles permettant l'accès au matching
DROP POLICY IF EXISTS "Minimal profile data for verified matching only" ON public.profiles;
DROP POLICY IF EXISTS "Verified users minimal profile access for matching" ON public.profiles;

-- 2. Créer une vue publique ultra-limitée pour le matching (SANS données sensibles)
CREATE OR REPLACE VIEW public.profiles_matching_view AS
SELECT 
    user_id,
    age,
    gender,
    interests,
    looking_for,
    avatar_url,
    created_at,
    -- Localisation approximative seulement (ville, pas adresse précise)
    CASE 
        WHEN location IS NOT NULL THEN 
            SPLIT_PART(location, ',', 1) -- Première partie seulement (ville)
        ELSE NULL 
    END as city_only,
    -- Éducation générale seulement (pas d'université spécifique)
    CASE 
        WHEN education IS NOT NULL THEN 
            CASE 
                WHEN education ILIKE '%university%' OR education ILIKE '%université%' THEN 'University Level'
                WHEN education ILIKE '%master%' OR education ILIKE '%phd%' OR education ILIKE '%doctorate%' THEN 'Graduate Level'
                WHEN education ILIKE '%high school%' OR education ILIKE '%lycée%' THEN 'High School'
                ELSE 'Other Education'
            END
        ELSE NULL 
    END as education_level,
    -- Profession générale seulement
    CASE 
        WHEN profession IS NOT NULL THEN 
            CASE 
                WHEN profession ILIKE '%engineer%' OR profession ILIKE '%ingénieur%' THEN 'Engineering'
                WHEN profession ILIKE '%doctor%' OR profession ILIKE '%médecin%' THEN 'Healthcare'
                WHEN profession ILIKE '%teacher%' OR profession ILIKE '%enseignant%' THEN 'Education'
                WHEN profession ILIKE '%business%' OR profession ILIKE '%commerce%' THEN 'Business'
                ELSE 'Other Profession'
            END
        ELSE NULL 
    END as profession_category
FROM public.profiles
WHERE EXISTS (
    SELECT 1 FROM public.privacy_settings ps 
    WHERE ps.user_id = profiles.user_id 
    AND ps.profile_visibility = 'public'
);

-- 3. Politique RLS pour la vue de matching (très restrictive)
CREATE POLICY "Ultra-restricted matching view access" 
ON public.profiles 
FOR SELECT 
USING (
    -- AUCUN accès direct aux données sensibles pour le matching
    false  -- Toujours false - force l'utilisation de la vue ou des matches mutuels
);

-- 4. Accès aux données complètes uniquement pour les matches mutuels confirmés
CREATE POLICY "Full profile access for confirmed mutual matches only" 
ON public.profiles 
FOR SELECT 
USING (
    auth.uid() = user_id  -- Propre profil
    OR EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE m.is_mutual = true 
        AND m.can_communicate = true  -- Communication approuvée
        AND (
            (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR 
            (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
        )
        -- Match récent et vérifié
        AND m.created_at > (now() - INTERVAL '6 months')
        AND EXISTS (
            SELECT 1 FROM public.user_verifications uv1, public.user_verifications uv2
            WHERE uv1.user_id = auth.uid() 
            AND uv2.user_id = profiles.user_id
            AND uv1.email_verified = true 
            AND uv2.email_verified = true
            AND uv1.verification_score >= 50
            AND uv2.verification_score >= 50
        )
    )
);

-- 5. Politique pour l'accès familial (données sensibles limitées)
CREATE POLICY "Family wali limited sensitive data access" 
ON public.profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.family_members fm,
                     public.user_verifications uv1,
                     public.user_verifications uv2
        WHERE fm.invited_user_id = auth.uid() 
        AND fm.user_id = profiles.user_id 
        AND fm.invitation_status = 'accepted' 
        AND fm.can_view_profile = true
        AND fm.is_wali = true
        AND fm.invitation_sent_at > (now() - INTERVAL '30 days')
        -- Vérifications strictes pour les deux parties
        AND uv1.user_id = auth.uid()
        AND uv2.user_id = profiles.user_id
        AND uv1.email_verified = true 
        AND uv2.email_verified = true
        AND uv1.id_verified = true  -- Wali doit avoir ID vérifié
        AND uv1.verification_score >= 70
    )
);

-- 6. Créer des politiques pour la vue de matching
ALTER VIEW public.profiles_matching_view OWNER TO postgres;

-- 7. Fonction pour l'accès sécurisé aux données de matching
CREATE OR REPLACE FUNCTION public.get_safe_matching_profiles(
    min_age integer DEFAULT 18,
    max_age integer DEFAULT 60,
    preferred_gender text DEFAULT NULL,
    max_results integer DEFAULT 20
)
RETURNS TABLE (
    user_id uuid,
    age integer,
    gender text,
    city_only text,
    education_level text,
    profession_category text,
    interests text[],
    looking_for text,
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Vérifications de sécurité strictes
    IF NOT EXISTS (
        SELECT 1 FROM public.user_verifications uv 
        WHERE uv.user_id = auth.uid() 
        AND uv.email_verified = true
        AND uv.verification_score >= 60
        AND uv.id_verified = true
    ) THEN
        RAISE EXCEPTION 'Insufficient verification level for profile browsing';
    END IF;
    
    -- Limite de taux stricte
    IF (
        SELECT COUNT(*) FROM public.profile_views pv 
        WHERE pv.viewer_id = auth.uid() 
        AND pv.created_at > (now() - INTERVAL '1 hour')
    ) >= 3 THEN  -- Maximum 3 recherches par heure
        RAISE EXCEPTION 'Rate limit exceeded for profile searches';
    END IF;
    
    -- Retourner les profils sécurisés
    RETURN QUERY
    SELECT 
        pmv.user_id,
        pmv.age,
        pmv.gender,
        pmv.city_only,
        pmv.education_level,
        pmv.profession_category,
        pmv.interests,
        pmv.looking_for,
        pmv.avatar_url
    FROM public.profiles_matching_view pmv
    WHERE pmv.user_id != auth.uid()  -- Pas son propre profil
    AND (preferred_gender IS NULL OR pmv.gender = preferred_gender)
    AND (pmv.age IS NULL OR (pmv.age >= min_age AND pmv.age <= max_age))
    AND NOT EXISTS (
        -- Pas déjà matché
        SELECT 1 FROM public.matches m 
        WHERE (
            (m.user1_id = auth.uid() AND m.user2_id = pmv.user_id) OR 
            (m.user2_id = auth.uid() AND m.user1_id = pmv.user_id)
        )
    )
    ORDER BY RANDOM()  -- Ordre aléatoire pour éviter les patterns
    LIMIT LEAST(max_results, 10);  -- Maximum 10 profils par recherche
END;
$$;