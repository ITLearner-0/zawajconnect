-- Synchroniser les données existantes dans la nouvelle table profile_matching_data
-- et trigger pour les nouvelles mises à jour de privacy_settings

-- 1. Populate existing data
INSERT INTO public.profile_matching_data (
    user_id, age, gender, city_only, education_level, profession_category, 
    interests, looking_for, avatar_url, is_visible
)
SELECT 
    p.user_id,
    p.age,
    p.gender,
    CASE 
        WHEN p.location IS NOT NULL THEN 
            SPLIT_PART(p.location, ',', 1)
        ELSE NULL 
    END as city_only,
    CASE 
        WHEN p.education IS NOT NULL THEN 
            CASE 
                WHEN p.education ILIKE '%university%' OR p.education ILIKE '%université%' THEN 'University Level'
                WHEN p.education ILIKE '%master%' OR p.education ILIKE '%phd%' OR p.education ILIKE '%doctorate%' THEN 'Graduate Level'
                WHEN p.education ILIKE '%high school%' OR p.education ILIKE '%lycée%' THEN 'High School'
                ELSE 'Other Education'
            END
        ELSE NULL 
    END as education_level,
    CASE 
        WHEN p.profession IS NOT NULL THEN 
            CASE 
                WHEN p.profession ILIKE '%engineer%' OR p.profession ILIKE '%ingénieur%' THEN 'Engineering'
                WHEN p.profession ILIKE '%doctor%' OR p.profession ILIKE '%médecin%' THEN 'Healthcare'
                WHEN p.profession ILIKE '%teacher%' OR p.profession ILIKE '%enseignant%' THEN 'Education'
                WHEN p.profession ILIKE '%business%' OR p.profession ILIKE '%commerce%' THEN 'Business'
                ELSE 'Other Profession'
            END
        ELSE NULL 
    END as profession_category,
    p.interests,
    p.looking_for,
    p.avatar_url,
    COALESCE(
        EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = p.user_id 
            AND ps.profile_visibility = 'public'
        ), 
        false
    ) as is_visible
FROM public.profiles p
LEFT JOIN public.profile_matching_data pmd ON pmd.user_id = p.user_id
WHERE pmd.user_id IS NULL; -- Only insert if not already exists

-- 2. Create trigger for privacy_settings changes to update visibility
CREATE OR REPLACE FUNCTION public.sync_matching_visibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- Update matching data visibility when privacy settings change
    UPDATE public.profile_matching_data 
    SET 
        is_visible = (NEW.profile_visibility = 'public'),
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Create entry if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO public.profile_matching_data (user_id, is_visible)
        VALUES (NEW.user_id, NEW.profile_visibility = 'public')
        ON CONFLICT (user_id) DO UPDATE SET
            is_visible = EXCLUDED.is_visible,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. Create trigger on privacy settings
DROP TRIGGER IF EXISTS sync_matching_visibility_trigger ON public.privacy_settings;
CREATE TRIGGER sync_matching_visibility_trigger
    AFTER INSERT OR UPDATE ON public.privacy_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_matching_visibility();

-- 4. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profile_matching_data_visible_gender 
ON public.profile_matching_data (is_visible, gender, created_at) 
WHERE is_visible = true;