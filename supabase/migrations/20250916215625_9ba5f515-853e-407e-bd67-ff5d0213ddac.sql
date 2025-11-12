-- Corriger l'alerte Security Definer View

-- 1. Supprimer la vue problématique SECURITY DEFINER
DROP VIEW IF EXISTS public.profiles_matching_view;

-- 2. Créer une table séparée pour les données de matching publiques (sans SECURITY DEFINER)
CREATE TABLE IF NOT EXISTS public.profile_matching_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    age integer,
    gender text,
    city_only text,
    education_level text,
    profession_category text,
    interests text[],
    looking_for text,
    avatar_url text,
    is_visible boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- 3. Enable RLS sur cette nouvelle table
ALTER TABLE public.profile_matching_data ENABLE ROW LEVEL SECURITY;

-- 4. Politique RLS ultra-restrictive pour les données de matching
CREATE POLICY "Highly verified users can view matching data only" 
ON public.profile_matching_data 
FOR SELECT 
USING (
    auth.uid() IS NOT NULL
    AND auth.uid() != user_id  -- Pas son propre profil
    AND is_visible = true  -- Doit être marqué comme visible
    -- Utilisateur doit être très vérifié
    AND EXISTS (
        SELECT 1 FROM public.user_verifications uv 
        WHERE uv.user_id = auth.uid() 
        AND uv.email_verified = true
        AND uv.verification_score >= 70
        AND uv.id_verified = true
    )
    -- Profil cible doit aussi être vérifié
    AND EXISTS (
        SELECT 1 FROM public.user_verifications uv2,
                     public.privacy_settings ps
        WHERE uv2.user_id = profile_matching_data.user_id 
        AND ps.user_id = profile_matching_data.user_id
        AND uv2.email_verified = true
        AND uv2.verification_score >= 50
        AND ps.profile_visibility = 'public'
    )
    -- Pas déjà matché
    AND NOT EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (
            (m.user1_id = auth.uid() AND m.user2_id = profile_matching_data.user_id) OR 
            (m.user2_id = auth.uid() AND m.user1_id = profile_matching_data.user_id)
        )
    )
    -- Rate limiting strict
    AND (
        SELECT COUNT(*) FROM public.profile_views pv 
        WHERE pv.viewer_id = auth.uid() 
        AND pv.created_at > (now() - INTERVAL '1 hour')
    ) < 3
);

-- 5. Politique pour que les utilisateurs puissent maintenir leurs propres données de matching
CREATE POLICY "Users can manage their own matching data" 
ON public.profile_matching_data 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Fonction pour synchroniser automatiquement les données de matching (SANS Security Definer)
CREATE OR REPLACE FUNCTION public.sync_matching_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- Insérer ou mettre à jour les données de matching de façon sécurisée
    INSERT INTO public.profile_matching_data (
        user_id,
        age,
        gender,
        city_only,
        education_level,
        profession_category,
        interests,
        looking_for,
        avatar_url,
        is_visible
    ) VALUES (
        NEW.user_id,
        NEW.age,
        NEW.gender,
        CASE 
            WHEN NEW.location IS NOT NULL THEN 
                SPLIT_PART(NEW.location, ',', 1)
            ELSE NULL 
        END,
        CASE 
            WHEN NEW.education IS NOT NULL THEN 
                CASE 
                    WHEN NEW.education ILIKE '%university%' OR NEW.education ILIKE '%université%' THEN 'University Level'
                    WHEN NEW.education ILIKE '%master%' OR NEW.education ILIKE '%phd%' OR NEW.education ILIKE '%doctorate%' THEN 'Graduate Level'
                    WHEN NEW.education ILIKE '%high school%' OR NEW.education ILIKE '%lycée%' THEN 'High School'
                    ELSE 'Other Education'
                END
            ELSE NULL 
        END,
        CASE 
            WHEN NEW.profession IS NOT NULL THEN 
                CASE 
                    WHEN NEW.profession ILIKE '%engineer%' OR NEW.profession ILIKE '%ingénieur%' THEN 'Engineering'
                    WHEN NEW.profession ILIKE '%doctor%' OR NEW.profession ILIKE '%médecin%' THEN 'Healthcare'
                    WHEN NEW.profession ILIKE '%teacher%' OR NEW.profession ILIKE '%enseignant%' THEN 'Education'
                    WHEN NEW.profession ILIKE '%business%' OR NEW.profession ILIKE '%commerce%' THEN 'Business'
                    ELSE 'Other Profession'
                END
            ELSE NULL 
        END,
        NEW.interests,
        NEW.looking_for,
        NEW.avatar_url,
        -- Vérifier si l'utilisateur permet la visibilité
        EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = NEW.user_id 
            AND ps.profile_visibility = 'public'
        )
    ) ON CONFLICT (user_id) DO UPDATE SET
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        city_only = EXCLUDED.city_only,
        education_level = EXCLUDED.education_level,
        profession_category = EXCLUDED.profession_category,
        interests = EXCLUDED.interests,
        looking_for = EXCLUDED.looking_for,
        avatar_url = EXCLUDED.avatar_url,
        is_visible = EXCLUDED.is_visible,
        updated_at = now();
    
    RETURN NEW;
END;
$$;

-- 7. Trigger pour synchroniser automatiquement
DROP TRIGGER IF EXISTS sync_matching_data_trigger ON public.profiles;
CREATE TRIGGER sync_matching_data_trigger
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_matching_data();

-- 8. Supprimer la fonction problématique avec SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_safe_matching_profiles;