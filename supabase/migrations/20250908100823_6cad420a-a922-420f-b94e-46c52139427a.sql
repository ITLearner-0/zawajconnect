-- Ajouter la colonne match_id à la table moderation_logs pour les notifications familiales
ALTER TABLE public.moderation_logs 
ADD COLUMN match_id uuid REFERENCES public.matches(id);

-- Corriger le trigger pour les notifications familiales
DROP TRIGGER IF EXISTS on_moderation_issue ON moderation_logs;

CREATE OR REPLACE FUNCTION public.notify_family_of_content_issue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  match_record RECORD;
  family_member RECORD;
BEGIN
  -- Vérifier si nous avons un match_id (nécessaire pour les notifications familiales)
  IF NEW.match_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Récupérer les détails du match
  SELECT m.*, p1.full_name as user1_name, p2.full_name as user2_name
  INTO match_record
  FROM matches m
  JOIN profiles p1 ON p1.user_id = m.user1_id
  JOIN profiles p2 ON p2.user_id = m.user2_id
  WHERE m.id = NEW.match_id;
  
  -- Si pas de match trouvé, on sort
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Si c'est une action critique (blocked), notifier toutes les familles
  IF NEW.action_taken = 'blocked' AND (
    NEW.rules_triggered::jsonb ? 'partage_informations_personnelles' OR
    NEW.rules_triggered::jsonb ? 'demande_rencontre_privee' OR
    NEW.rules_triggered::jsonb ? 'contraire à la pudeur' OR
    NEW.rules_triggered::jsonb ? 'vulgarité et grossièreté'
  ) THEN
    
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
$function$;

-- Recréer le trigger
CREATE TRIGGER on_moderation_issue
  AFTER INSERT ON moderation_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_family_of_content_issue();