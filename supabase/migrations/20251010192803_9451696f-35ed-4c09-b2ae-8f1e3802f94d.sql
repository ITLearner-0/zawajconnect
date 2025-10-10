-- Migration : Ajout colonnes pour traçabilité consentement CGU
-- Conformité RGPD : tracer acceptation des conditions d'utilisation

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0';

-- Commentaires pour documentation
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'Date et heure d''acceptation des CGU par l''utilisateur (conformité RGPD)';
COMMENT ON COLUMN public.profiles.terms_version IS 'Version des CGU acceptée (format: 1.0, 1.1, etc.) pour gérer les mises à jour';