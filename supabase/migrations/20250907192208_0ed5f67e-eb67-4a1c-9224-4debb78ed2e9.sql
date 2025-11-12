-- Ajouter le système de supervision obligatoire et notifications familiales

-- Table pour les notifications aux familles
CREATE TABLE IF NOT EXISTS public.family_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('content_warning', 'match_started', 'inappropriate_content', 'conversation_escalated')),
  content TEXT NOT NULL,
  original_message TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_family_notifications_family_member ON public.family_notifications(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_notifications_match ON public.family_notifications(match_id);
CREATE INDEX IF NOT EXISTS idx_family_notifications_unread ON public.family_notifications(family_member_id, is_read) WHERE is_read = false;

-- Ajouter des colonnes à la table matches pour la supervision obligatoire
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS family_supervision_required BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS family1_approved BOOLEAN,
ADD COLUMN IF NOT EXISTS family2_approved BOOLEAN,
ADD COLUMN IF NOT EXISTS supervision_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS can_communicate BOOLEAN NOT NULL DEFAULT false;

-- Nouvelle table pour les règles de supervision
CREATE TABLE IF NOT EXISTS public.family_supervision_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  blocking BOOLEAN NOT NULL DEFAULT true, -- Si true, bloque automatiquement
  notify_family BOOLEAN NOT NULL DEFAULT true, -- Si true, notifie la famille
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer des règles de supervision strictes par défaut
INSERT INTO public.family_supervision_rules (user_id, rule_name, rule_description, blocking, notify_family) 
SELECT 
  u.id,
  'partage_informations_personnelles',
  'Interdiction stricte de partager numéros de téléphone, emails, adresses ou tout moyen de contact personnel',
  true,
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.family_supervision_rules 
  WHERE user_id = u.id AND rule_name = 'partage_informations_personnelles'
);

INSERT INTO public.family_supervision_rules (user_id, rule_name, rule_description, blocking, notify_family) 
SELECT 
  u.id,
  'demande_rencontre_privee',
  'Interdiction de proposer des rencontres privées sans supervision familiale',
  true,
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.family_supervision_rules 
  WHERE user_id = u.id AND rule_name = 'demande_rencontre_privee'
);

INSERT INTO public.family_supervision_rules (user_id, rule_name, rule_description, blocking, notify_family) 
SELECT 
  u.id,
  'langage_inapproprie',
  'Interdiction de tout langage contraire à la pudeur islamique (haya)',
  true,
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.family_supervision_rules 
  WHERE user_id = u.id AND rule_name = 'langage_inapproprie'
);

-- RLS Policies pour family_notifications
ALTER TABLE public.family_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view their notifications" 
ON public.family_notifications 
FOR SELECT 
USING (
  family_member_id IN (
    SELECT fm.id FROM public.family_members fm WHERE fm.user_id = auth.uid()
  )
);

CREATE POLICY "System can create family notifications" 
ON public.family_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Family members can update their notification status" 
ON public.family_notifications 
FOR UPDATE 
USING (
  family_member_id IN (
    SELECT fm.id FROM public.family_members fm WHERE fm.user_id = auth.uid()
  )
);

-- RLS Policies pour family_supervision_rules
ALTER TABLE public.family_supervision_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own supervision rules" 
ON public.family_supervision_rules 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own supervision rules" 
ON public.family_supervision_rules 
FOR ALL 
USING (user_id = auth.uid());

-- Fonction pour notifier automatiquement les familles
CREATE OR REPLACE FUNCTION public.notify_family_of_content_issue()
RETURNS TRIGGER AS $$
DECLARE
  match_record RECORD;
  family_member RECORD;
BEGIN
  -- Récupérer les détails du match
  SELECT m.*, p1.full_name as user1_name, p2.full_name as user2_name
  INTO match_record
  FROM matches m
  JOIN profiles p1 ON p1.user_id = m.user1_id
  JOIN profiles p2 ON p2.user_id = m.user2_id
  WHERE m.id = NEW.match_id;
  
  -- Si c'est une action critique (blocked), notifier toutes les familles
  IF NEW.action_taken = 'blocked' AND NEW.rules_triggered && ARRAY['partage_informations_personnelles', 'demande_rencontre_privee'] THEN
    
    -- Notifier la famille de l'utilisateur qui a envoyé le message problématique
    FOR family_member IN 
      SELECT fm.* FROM family_members fm 
      WHERE fm.user_id = NEW.user_id AND fm.is_wali = true
    LOOP
      INSERT INTO public.family_notifications (
        family_member_id,
        match_id,
        notification_type,
        content,
        original_message,
        severity,
        action_required
      ) VALUES (
        family_member.id,
        match_record.id,
        'inappropriate_content',
        'Contenu inapproprié détecté: ' || NEW.content_analyzed,
        NEW.content_analyzed,
        'critical',
        true
      );
    END LOOP;
    
    -- Notifier aussi la famille de l'autre utilisateur pour l'informer
    FOR family_member IN 
      SELECT fm.* FROM family_members fm 
      WHERE fm.user_id = (
        CASE WHEN match_record.user1_id = NEW.user_id 
        THEN match_record.user2_id 
        ELSE match_record.user1_id END
      ) AND fm.is_wali = true
    LOOP
      INSERT INTO public.family_notifications (
        family_member_id,
        match_id,
        notification_type,
        content,
        severity,
        action_required
      ) VALUES (
        family_member.id,
        match_record.id,
        'content_warning',
        'Contenu inapproprié détecté dans la conversation. Supervision renforcée recommandée.',
        'high',
        false
      );
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger pour les notifications automatiques
CREATE TRIGGER notify_family_on_moderation_log
  AFTER INSERT ON public.moderation_logs
  FOR EACH ROW
  WHEN (NEW.action_taken IN ('blocked', 'escalated'))
  EXECUTE FUNCTION public.notify_family_of_content_issue();

-- Fonction pour vérifier si la supervision familiale est configurée
CREATE OR REPLACE FUNCTION public.check_family_supervision_setup(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE user_id = user_uuid AND is_wali = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Mise à jour des timestamps
CREATE TRIGGER update_family_supervision_rules_updated_at
  BEFORE UPDATE ON public.family_supervision_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();