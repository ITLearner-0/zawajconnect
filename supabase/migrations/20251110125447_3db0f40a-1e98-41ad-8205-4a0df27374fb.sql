-- ============================================
-- PHASE 1: CORRECTIONS DE SÉCURITÉ CRITIQUES
-- ============================================

-- ============================================
-- 1. SÉCURISER accept_family_invitation()
-- ============================================
-- Ajouter validation stricte du score de vérification (≥85) et vérifications email/ID

CREATE OR REPLACE FUNCTION public.accept_family_invitation(
  p_invitation_token uuid, 
  p_invited_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  family_member_record RECORD;
  recent_attempts integer;
  v_email_verified boolean;
  v_id_verified boolean;
  v_verification_score integer;
BEGIN
  -- SECURITY CHECK 1: Vérifier le score de vérification AVANT d'accepter
  SELECT email_verified, id_verified, verification_score 
  INTO v_email_verified, v_id_verified, v_verification_score
  FROM public.user_verifications
  WHERE user_id = p_invited_user_id;
  
  -- Exiger email vérifié, ID vérifié, et score ≥ 85 pour devenir Wali
  IF NOT COALESCE(v_email_verified, false) THEN
    RAISE EXCEPTION 'Email verification required to accept Wali invitation';
  END IF;
  
  IF NOT COALESCE(v_id_verified, false) THEN
    RAISE EXCEPTION 'ID verification required to accept Wali invitation';
  END IF;
  
  IF COALESCE(v_verification_score, 0) < 85 THEN
    RAISE EXCEPTION 'Verification score must be at least 85 to accept Wali invitation (current: %)', COALESCE(v_verification_score, 0);
  END IF;
  
  -- Rate limiting: Check recent acceptance attempts (max 5 per hour)
  SELECT COUNT(*) INTO recent_attempts
  FROM public.family_members
  WHERE invited_user_id = p_invited_user_id
  AND invitation_accepted_at > (now() - INTERVAL '1 hour');
  
  IF recent_attempts >= 5 THEN
    RAISE EXCEPTION 'Too many invitation acceptance attempts. Please wait before trying again.';
  END IF;
  
  -- Find the invitation with 30 days validity
  SELECT * INTO family_member_record 
  FROM public.family_members 
  WHERE invitation_token = p_invitation_token 
    AND invitation_status = 'pending'
    AND invitation_sent_at IS NOT NULL
    AND invitation_sent_at > (now() - INTERVAL '30 days');
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Accept the invitation
  UPDATE public.family_members 
  SET 
    invitation_status = 'accepted',
    invitation_accepted_at = now(),
    invited_user_id = p_invited_user_id,
    can_view_profile = true,
    can_communicate = true
  WHERE invitation_token = p_invitation_token;
  
  -- Log the acceptance with verification details
  PERFORM log_security_event(
    p_invited_user_id,
    'family_invitation_accepted',
    'high',
    'User accepted Wali invitation with verified credentials',
    jsonb_build_object(
      'invitation_token', p_invitation_token,
      'family_member_id', family_member_record.id,
      'verification_score', v_verification_score,
      'email_verified', v_email_verified,
      'id_verified', v_id_verified
    )
  );
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't expose details
  PERFORM log_security_event(
    p_invited_user_id,
    'family_invitation_acceptance_failed',
    'high',
    'Failed to accept family invitation: ' || SQLERRM,
    jsonb_build_object(
      'error', SQLERRM,
      'invitation_token', p_invitation_token
    )
  );
  RETURN FALSE;
END;
$function$;

-- ============================================
-- 2. RESTREINDRE LA POLITIQUE RLS DES INVITATIONS
-- ============================================
-- Supprimer la politique trop permissive qui expose les invitations à PUBLIC

DROP POLICY IF EXISTS "Anyone can view pending invitations by token" ON public.family_members;

-- Créer une politique restreinte : seuls l'inviteur et l'invité peuvent voir
CREATE POLICY "Only inviter and invitee can view pending invitations"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  invitation_status = 'pending'
  AND invitation_token IS NOT NULL
  AND invitation_sent_at > (now() - INTERVAL '30 days')
  AND (
    auth.uid() = user_id  -- L'inviteur
    OR auth.uid() = invited_user_id  -- L'invité (si déjà assigné)
  )
);

-- Créer une vue sécurisée pour la page publique d'acceptation d'invitation
-- Cette vue expose uniquement les informations non sensibles nécessaires
CREATE OR REPLACE VIEW public.public_invitation_info AS
SELECT 
  invitation_token,
  full_name,
  relationship,
  invitation_sent_at,
  CASE 
    WHEN invitation_sent_at > (now() - INTERVAL '30 days') THEN true
    ELSE false
  END as is_valid
FROM public.family_members
WHERE invitation_status = 'pending'
  AND invitation_token IS NOT NULL;

-- RLS sur la vue publique (accessible sans auth pour validation du token)
ALTER VIEW public.public_invitation_info SET (security_invoker = true);

COMMENT ON VIEW public.public_invitation_info IS 
'Vue publique sécurisée pour vérifier les invitations. N''expose que les données non sensibles.';

-- ============================================
-- 3. IDENTIFIER ET SÉCURISER LES SECURITY DEFINER VIEWS
-- ============================================
-- Note: Les "views" SECURITY DEFINER sont rares. La plupart du temps ce sont des fonctions.
-- Vérification des vues existantes et ajout de security_invoker où nécessaire

-- Vérifier et corriger toutes les vues pour qu'elles utilisent security_invoker
-- Cela force les vues à s'exécuter avec les privilèges de l'utilisateur appelant

DO $$
DECLARE
  view_record RECORD;
BEGIN
  -- Lister toutes les vues dans le schéma public
  FOR view_record IN 
    SELECT schemaname, viewname
    FROM pg_views
    WHERE schemaname = 'public'
  LOOP
    -- Appliquer security_invoker = true à toutes les vues
    -- Cela empêche les vues de contourner les politiques RLS
    BEGIN
      EXECUTE format('ALTER VIEW %I.%I SET (security_invoker = true)', 
        view_record.schemaname, view_record.viewname);
      
      RAISE NOTICE 'Secured view: %.%', view_record.schemaname, view_record.viewname;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not secure view %.%: %', 
        view_record.schemaname, view_record.viewname, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================
-- 4. AUDIT ET MONITORING
-- ============================================
-- Créer une fonction pour auditer les tentatives d'acceptation d'invitation

CREATE OR REPLACE FUNCTION public.audit_invitation_acceptance_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Logger toutes les acceptations d'invitation pour audit
  IF NEW.invitation_status = 'accepted' AND OLD.invitation_status = 'pending' THEN
    PERFORM log_security_event(
      NEW.invited_user_id,
      'wali_invitation_accepted',
      'high',
      'Wali invitation accepted - requires high verification',
      jsonb_build_object(
        'family_member_id', NEW.id,
        'user_id', NEW.user_id,
        'invited_user_id', NEW.invited_user_id,
        'is_wali', NEW.is_wali,
        'relationship', NEW.relationship
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Créer le trigger d'audit
DROP TRIGGER IF EXISTS audit_invitation_acceptance ON public.family_members;
CREATE TRIGGER audit_invitation_acceptance
  AFTER UPDATE ON public.family_members
  FOR EACH ROW
  WHEN (NEW.invitation_status = 'accepted' AND OLD.invitation_status = 'pending')
  EXECUTE FUNCTION public.audit_invitation_acceptance_attempt();

-- ============================================
-- 5. DOCUMENTATION ET COMMENTAIRES
-- ============================================

COMMENT ON FUNCTION public.accept_family_invitation(uuid, uuid) IS 
'Accepte une invitation familiale UNIQUEMENT si l''utilisateur a:
- Email vérifié (email_verified = true)
- ID vérifié (id_verified = true)  
- Score de vérification ≥ 85
Ces vérifications empêchent l''escalade de privilèges par des utilisateurs non vérifiés.';

COMMENT ON POLICY "Only inviter and invitee can view pending invitations" ON public.family_members IS
'Politique RLS restrictive: seuls l''inviteur et l''invité peuvent voir les invitations en attente.
Empêche l''énumération des invitations par des tiers.';

-- Créer un index pour optimiser les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_user_verifications_score 
ON public.user_verifications(user_id, verification_score, email_verified, id_verified)
WHERE email_verified = true AND id_verified = true;