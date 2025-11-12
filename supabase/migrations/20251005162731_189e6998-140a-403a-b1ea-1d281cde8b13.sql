-- ============================================
-- SYSTÈME DE CONVERSATION EXCLUSIVE
-- ============================================

-- 1. Ajouter les colonnes de conversation à la table matches
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS conversation_status TEXT DEFAULT 'not_started' CHECK (conversation_status IN ('not_started', 'active', 'ended')),
ADD COLUMN IF NOT EXISTS conversation_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS conversation_ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ended_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS end_reason TEXT,
ADD COLUMN IF NOT EXISTS end_message TEXT;

-- 2. Créer la table blocked_match_pairs pour empêcher les re-matchs
CREATE TABLE IF NOT EXISTS public.blocked_match_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  end_reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_blocked_pair UNIQUE (user1_id, user2_id),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Enable RLS on blocked_match_pairs
ALTER TABLE public.blocked_match_pairs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own blocked pairs
CREATE POLICY "Users can view their own blocked pairs"
ON public.blocked_match_pairs
FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 3. Fonction pour vérifier si un utilisateur est en conversation active
CREATE OR REPLACE FUNCTION public.is_user_in_active_conversation(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.matches
    WHERE (user1_id = check_user_id OR user2_id = check_user_id)
    AND conversation_status = 'active'
  );
END;
$$;

-- 4. Fonction pour vérifier si deux utilisateurs ont eu une conversation précédente
CREATE OR REPLACE FUNCTION public.has_previous_conversation(u1_id UUID, u2_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.blocked_match_pairs
    WHERE (user1_id = u1_id AND user2_id = u2_id)
       OR (user1_id = u2_id AND user2_id = u1_id)
  );
END;
$$;

-- 5. Fonction trigger pour démarrer automatiquement une conversation au premier message
CREATE OR REPLACE FUNCTION public.start_conversation_on_first_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  match_record RECORD;
BEGIN
  -- Récupérer le match associé
  SELECT * INTO match_record
  FROM public.matches
  WHERE id = NEW.match_id;
  
  -- Si le match existe et que la conversation n'a pas encore commencé
  IF match_record.id IS NOT NULL AND match_record.conversation_status = 'not_started' THEN
    -- Mettre à jour le statut à 'active'
    UPDATE public.matches
    SET 
      conversation_status = 'active',
      conversation_started_at = now()
    WHERE id = NEW.match_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Créer le trigger sur la table messages
DROP TRIGGER IF EXISTS trigger_start_conversation ON public.messages;
CREATE TRIGGER trigger_start_conversation
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.start_conversation_on_first_message();

-- 7. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_matches_conversation_status 
ON public.matches(conversation_status);

CREATE INDEX IF NOT EXISTS idx_matches_conversation_active_users 
ON public.matches(user1_id, user2_id) 
WHERE conversation_status = 'active';

CREATE INDEX IF NOT EXISTS idx_blocked_pairs_users 
ON public.blocked_match_pairs(user1_id, user2_id);

-- 8. Commenter les colonnes pour la documentation
COMMENT ON COLUMN public.matches.conversation_status IS 'Statut de la conversation : not_started (pas encore commencée), active (en cours), ended (terminée)';
COMMENT ON COLUMN public.matches.conversation_started_at IS 'Date et heure du premier message envoyé';
COMMENT ON COLUMN public.matches.conversation_ended_at IS 'Date et heure de la clôture de la conversation';
COMMENT ON COLUMN public.matches.ended_by IS 'ID de l utilisateur qui a mis fin à la conversation';
COMMENT ON COLUMN public.matches.end_reason IS 'Raison de la clôture (incompatibilite_religieuse, valeurs_familiales, etc.)';
COMMENT ON COLUMN public.matches.end_message IS 'Message de clôture complet (message de courtoisie + message islamique automatique)';

COMMENT ON TABLE public.blocked_match_pairs IS 'Table pour empêcher les re-matchs entre utilisateurs ayant déjà eu une conversation';
