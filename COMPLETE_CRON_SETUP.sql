-- ============================================
-- SCRIPT COMPLET DE CONFIGURATION DES CRON JOBS
-- Mariage-Halal - Configuration automatique des emails
-- ============================================

-- ============================================
-- ÉTAPE 1: ACTIVER LES EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- ÉTAPE 2: CONFIGURER LA SERVICE ROLE KEY
-- ⚠️ IMPORTANT: Remplacez YOUR_SERVICE_ROLE_KEY par votre vraie clé !
-- Trouvez-la ici: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/api
-- ============================================
ALTER DATABASE postgres SET "app.settings.service_role_key" TO 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAwNTk5NiwiZXhwIjoyMDcyNTgxOTk2fQ.aWbM0A7-_DgWA8H6jMzvSKNggfwUgl_eO20qLaq6D6c';

-- ============================================
-- ÉTAPE 3: CRÉER LES FONCTIONS SQL
-- ============================================

-- Fonction 1: Rappel messages non lus
CREATE OR REPLACE FUNCTION check_unread_messages_and_notify()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  unread_count INTEGER;
  sender_profile RECORD;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT
      m.id as match_id,
      CASE 
        WHEN m.user1_id = msg.sender_id THEN m.user2_id
        ELSE m.user1_id
      END as recipient_id,
      msg.sender_id,
      COUNT(*) as unread_count,
      MIN(msg.created_at) as oldest_unread
    FROM matches m
    JOIN messages msg ON msg.match_id = m.id
    WHERE msg.is_read = false
    AND msg.created_at < (now() - INTERVAL '24 hours')
    AND m.conversation_status = 'active'
    GROUP BY m.id, 
      CASE WHEN m.user1_id = msg.sender_id THEN m.user2_id ELSE m.user1_id END,
      msg.sender_id
    HAVING COUNT(*) >= 1
  LOOP
    SELECT full_name INTO sender_profile
    FROM profiles
    WHERE user_id = user_record.sender_id;
    
    PERFORM net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-unread-messages-reminder',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'user_id', user_record.recipient_id,
        'unread_count', user_record.unread_count,
        'sender_name', COALESCE(sender_profile.full_name, 'Un membre'),
        'match_id', user_record.match_id
      )
    );
  END LOOP;
END;
$$;

-- Fonction 2: Expiration abonnement
CREATE OR REPLACE FUNCTION check_subscription_expiry_and_notify()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record RECORD;
  days_remaining INTEGER;
BEGIN
  FOR sub_record IN 
    SELECT 
      s.user_id,
      s.plan_type,
      s.expires_at,
      EXTRACT(DAY FROM (s.expires_at - now())) as days_until_expiry
    FROM subscriptions s
    WHERE s.status = 'active'
    AND s.expires_at IS NOT NULL
    AND s.expires_at > now()
    AND (
      s.expires_at::date = (now() + INTERVAL '7 days')::date
      OR s.expires_at::date = (now() + INTERVAL '3 days')::date
      OR s.expires_at::date = (now() + INTERVAL '1 day')::date
    )
  LOOP
    days_remaining := CEIL(sub_record.days_until_expiry);
    
    PERFORM net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-subscription-expiring-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'user_id', sub_record.user_id,
        'plan_type', sub_record.plan_type,
        'expires_at', sub_record.expires_at,
        'days_remaining', days_remaining
      )
    );
  END LOOP;
END;
$$;

-- Fonction 3: Profils incomplets
CREATE OR REPLACE FUNCTION check_incomplete_profiles_and_notify()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  missing_fields TEXT[];
  completion_pct INTEGER;
BEGIN
  FOR profile_record IN 
    SELECT 
      p.user_id,
      p.full_name,
      p.bio,
      p.avatar_url,
      p.education,
      p.profession,
      p.interests,
      p.location,
      ip.prayer_frequency,
      ip.quran_reading,
      ip.madhab
    FROM profiles p
    LEFT JOIN islamic_preferences ip ON ip.user_id = p.user_id
    WHERE p.created_at > (now() - INTERVAL '90 days')
    AND (
      p.bio IS NULL OR p.bio = '' OR
      p.avatar_url IS NULL OR
      p.education IS NULL OR
      p.profession IS NULL OR
      p.interests IS NULL OR array_length(p.interests, 1) = 0 OR
      p.location IS NULL OR
      ip.prayer_frequency IS NULL OR
      ip.quran_reading IS NULL
    )
  LOOP
    missing_fields := ARRAY[]::TEXT[];
    
    IF profile_record.bio IS NULL OR profile_record.bio = '' THEN
      missing_fields := array_append(missing_fields, 'bio');
    END IF;
    
    IF profile_record.avatar_url IS NULL THEN
      missing_fields := array_append(missing_fields, 'avatar_url');
    END IF;
    
    IF profile_record.education IS NULL THEN
      missing_fields := array_append(missing_fields, 'education');
    END IF;
    
    IF profile_record.profession IS NULL THEN
      missing_fields := array_append(missing_fields, 'profession');
    END IF;
    
    IF profile_record.interests IS NULL OR array_length(profile_record.interests, 1) = 0 THEN
      missing_fields := array_append(missing_fields, 'interests');
    END IF;
    
    IF profile_record.location IS NULL THEN
      missing_fields := array_append(missing_fields, 'location');
    END IF;
    
    IF profile_record.prayer_frequency IS NULL THEN
      missing_fields := array_append(missing_fields, 'prayer_frequency');
    END IF;
    
    IF profile_record.quran_reading IS NULL THEN
      missing_fields := array_append(missing_fields, 'quran_reading');
    END IF;
    
    IF profile_record.madhab IS NULL THEN
      missing_fields := array_append(missing_fields, 'madhab');
    END IF;
    
    completion_pct := 100 - (array_length(missing_fields, 1) * 11);
    
    PERFORM net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-profile-reminder',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'user_id', profile_record.user_id,
        'missing_fields', missing_fields,
        'completion_percentage', completion_pct
      )
    );
  END LOOP;
END;
$$;

-- Fonction 4: Suggestions de matchs
CREATE OR REPLACE FUNCTION send_match_suggestions_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  suggestions JSONB;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT p.user_id
    FROM profiles p
    JOIN subscriptions s ON s.user_id = p.user_id
    WHERE s.status = 'active'
    AND s.plan_type IN ('premium', 'family')
    AND p.created_at > (now() - INTERVAL '180 days')
  LOOP
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', 'Profil Compatible',
        'age', pmd.age,
        'location', pmd.city_only,
        'compatibility_score', 85,
        'profile_id', pmd.user_id
      )
    ) INTO suggestions
    FROM profile_matching_data pmd
    WHERE pmd.is_visible = true
    AND pmd.user_id != user_record.user_id
    AND pmd.gender != (SELECT gender FROM profiles WHERE user_id = user_record.user_id)
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user1_id = user_record.user_id AND m.user2_id = pmd.user_id)
         OR (m.user2_id = user_record.user_id AND m.user1_id = pmd.user_id)
    )
    LIMIT 5;
    
    IF suggestions IS NOT NULL AND jsonb_array_length(suggestions) > 0 THEN
      PERFORM net.http_post(
        url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-match-suggestions',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'user_id', user_record.user_id,
          'suggestions', suggestions
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Fonction 5: Newsletter mensuelle
CREATE OR REPLACE FUNCTION send_monthly_newsletter()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  edition_num INTEGER;
  featured_content JSONB;
BEGIN
  edition_num := EXTRACT(YEAR FROM now())::INTEGER * 12 + 
                 EXTRACT(MONTH FROM now())::INTEGER - 
                 (2025 * 12 + 1);
  
  featured_content := jsonb_build_array(
    jsonb_build_object(
      'title', 'Les clés d''un mariage réussi',
      'content', 'Découvrez les fondements islamiques pour construire une union solide...',
      'link', 'https://mariage-halal.com/guidance'
    ),
    jsonb_build_object(
      'title', 'Témoignages de couples',
      'content', 'Inspirez-vous des histoires de réussite de notre communauté...',
      'link', 'https://mariage-halal.com'
    ),
    jsonb_build_object(
      'title', 'Conseils pour votre recherche',
      'content', 'Comment optimiser votre profil et vos interactions...',
      'link', 'https://mariage-halal.com/guidance'
    )
  );
  
  FOR user_record IN 
    SELECT p.user_id
    FROM profiles p
    WHERE p.created_at < (now() - INTERVAL '7 days')
  LOOP
    PERFORM net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-newsletter',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'user_id', user_record.user_id,
        'edition_number', edition_num,
        'featured_articles', featured_content
      )
    );
  END LOOP;
END;
$$;

-- Fonction 6: Conseils hebdomadaires
CREATE OR REPLACE FUNCTION send_weekly_tips_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  week_num INTEGER;
  tips_content JSONB;
BEGIN
  week_num := EXTRACT(WEEK FROM now())::INTEGER;
  
  tips_content := jsonb_build_array(
    jsonb_build_object(
      'title', 'Communication respectueuse',
      'content', 'Utilisez un langage courtois et évitez les questions trop personnelles au début.',
      'icon', '💬'
    ),
    jsonb_build_object(
      'title', 'Impliquez votre famille',
      'content', 'La transparence avec votre wali renforce la confiance dans votre démarche.',
      'icon', '👨‍👩‍👧'
    ),
    jsonb_build_object(
      'title', 'Soyez patient',
      'content', 'Trouver la bonne personne prend du temps. Faites confiance au destin.',
      'icon', '⏳'
    )
  );
  
  FOR user_record IN 
    SELECT p.user_id
    FROM profiles p
    WHERE p.created_at < (now() - INTERVAL '7 days')
  LOOP
    PERFORM net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-weekly-tips',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'user_id', user_record.user_id,
        'week_number', week_num,
        'tips', tips_content
      )
    );
  END LOOP;
END;
$$;

-- ============================================
-- ÉTAPE 4: PROGRAMMER LES CRON JOBS
-- ============================================

-- 1. Messages non lus (quotidien à 10h)
SELECT cron.schedule(
  'send-unread-messages-reminders',
  '0 10 * * *',
  $$
  SELECT check_unread_messages_and_notify();
  $$
);

-- 2. Expiration abonnement (quotidien à 9h)
SELECT cron.schedule(
  'check-subscription-expiry',
  '0 9 * * *',
  $$
  SELECT check_subscription_expiry_and_notify();
  $$
);

-- 3. Profils incomplets (dimanche à 10h)
SELECT cron.schedule(
  'send-profile-completion-reminders',
  '0 10 * * 0',
  $$
  SELECT check_incomplete_profiles_and_notify();
  $$
);

-- 4. Suggestions de matchs (mardi et vendredi à 14h)
SELECT cron.schedule(
  'send-match-suggestions',
  '0 14 * * 2,5',
  $$
  SELECT send_match_suggestions_batch();
  $$
);

-- 5. Newsletter mensuelle (premier lundi du mois à 10h)
SELECT cron.schedule(
  'send-monthly-newsletter',
  '0 10 1-7 * 1',
  $$
  SELECT send_monthly_newsletter();
  $$
);

-- 6. Conseils hebdomadaires (mercredi à 9h)
SELECT cron.schedule(
  'send-weekly-tips',
  '0 9 * * 3',
  $$
  SELECT send_weekly_tips_batch();
  $$
);

-- ============================================
-- ÉTAPE 5: VÉRIFICATION
-- ============================================

-- Afficher tous les cron jobs configurés
SELECT 
  jobid,
  schedule,
  command,
  active
FROM cron.job
ORDER BY jobid;

-- ============================================
-- SCRIPT TERMINÉ
-- Tous les cron jobs sont maintenant configurés !
-- ============================================
