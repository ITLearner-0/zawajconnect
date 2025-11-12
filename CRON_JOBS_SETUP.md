# 🔄 Configuration des tâches programmées (Cron Jobs)

## Vue d'ensemble

Ce guide complet explique comment configurer tous les Cron Jobs nécessaires pour les emails automatiques de Zawaj-Connect.

**Prérequis :**

- Extensions `pg_cron` et `pg_net` activées dans Supabase
- Service Role Key configurée
- Edge functions déployées

---

## 🔐 Configuration initiale (À faire en premier !)

### 1. Activer les extensions requises

```sql
-- Activer les extensions PostgreSQL nécessaires
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Configurer la Service Role Key

**CRITIQUE :** Cette étape est obligatoire pour que les fonctions SQL puissent appeler les edge functions.

```sql
-- Remplacez VOTRE_SUPABASE_SERVICE_ROLE_KEY par votre vraie clé !
ALTER DATABASE postgres SET "app.settings.service_role_key" TO 'VOTRE_SUPABASE_SERVICE_ROLE_KEY';
```

⚠️ **Où trouver votre Service Role Key ?**
→ https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/api

---

## 📧 Cron Jobs pour emails automatiques

### 1. Rappel de messages non lus

**Fréquence recommandée :** Toutes les 24 heures

**Fonction SQL à créer :**

```sql
-- Créer une fonction pour trouver les utilisateurs avec des messages non lus
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
  -- Parcourir tous les matchs avec des messages non lus depuis plus de 24h
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
    -- Récupérer le profil de l'expéditeur
    SELECT full_name INTO sender_profile
    FROM profiles
    WHERE user_id = user_record.sender_id;

    -- Appeler la fonction d'envoi d'email via HTTP
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
```

**Configurer le Cron Job :**

```sql
-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Programmer l'exécution quotidienne à 10h
SELECT cron.schedule(
  'send-unread-messages-reminders',
  '0 10 * * *', -- Tous les jours à 10h00
  $$
  SELECT check_unread_messages_and_notify();
  $$
);
```

---

### 2. Expiration d'abonnement Premium

**Fréquence recommandée :** Une fois par jour

**Fonction SQL à créer :**

```sql
-- Créer une fonction pour notifier les expirations d'abonnement
CREATE OR REPLACE FUNCTION check_subscription_expiry_and_notify()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record RECORD;
  days_remaining INTEGER;
BEGIN
  -- Parcourir les abonnements qui expirent dans 7, 3 ou 1 jour(s)
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
      -- 7 jours avant expiration
      s.expires_at::date = (now() + INTERVAL '7 days')::date
      OR
      -- 3 jours avant expiration
      s.expires_at::date = (now() + INTERVAL '3 days')::date
      OR
      -- 1 jour avant expiration
      s.expires_at::date = (now() + INTERVAL '1 day')::date
    )
  LOOP
    days_remaining := CEIL(sub_record.days_until_expiry);

    -- Appeler la fonction d'envoi d'email
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
```

**Configurer le Cron Job :**

```sql
-- Programmer l'exécution quotidienne à 9h
SELECT cron.schedule(
  'check-subscription-expiry',
  '0 9 * * *', -- Tous les jours à 9h00
  $$
  SELECT check_subscription_expiry_and_notify();
  $$
);
```

---

### 3. Rappel de profil incomplet

**Fréquence recommandée :** Une fois par semaine (dimanche)

**Fonction SQL :**

```sql
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
    -- Calculate missing fields
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

    -- Calculate completion percentage
    completion_pct := 100 - (array_length(missing_fields, 1) * 11);

    -- Send reminder email
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
```

**Configurer le Cron :**

```sql
SELECT cron.schedule(
  'send-profile-completion-reminders',
  '0 10 * * 0', -- Tous les dimanches à 10h
  $$
  SELECT check_incomplete_profiles_and_notify();
  $$
);
```

---

### 4. Suggestions de profils compatibles

**Fréquence recommandée :** Deux fois par semaine (mardi et vendredi)

**Fonction SQL :**

```sql
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
    -- Get compatible profiles (simplified matching logic)
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
```

**Configurer le Cron :**

```sql
SELECT cron.schedule(
  'send-match-suggestions',
  '0 14 * * 2,5', -- Mardi et vendredi à 14h
  $$
  SELECT send_match_suggestions_batch();
  $$
);
```

---

### 5. Newsletter mensuelle

**Fréquence recommandée :** Premier lundi de chaque mois

**Fonction SQL :**

```sql
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
  -- Calculate edition number (months since Jan 2025)
  edition_num := EXTRACT(YEAR FROM now())::INTEGER * 12 +
                 EXTRACT(MONTH FROM now())::INTEGER -
                 (2025 * 12 + 1);

  -- Prepare featured articles
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
```

**Configurer le Cron :**

```sql
SELECT cron.schedule(
  'send-monthly-newsletter',
  '0 10 1-7 * 1', -- Premier lundi du mois à 10h
  $$
  SELECT send_monthly_newsletter();
  $$
);
```

---

### 6. Conseils hebdomadaires

**Fréquence recommandée :** Tous les mercredis

**Fonction SQL :**

```sql
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
  -- Calculate week number
  week_num := EXTRACT(WEEK FROM now())::INTEGER;

  -- Rotate tips based on week number
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
```

**Configurer le Cron :**

```sql
SELECT cron.schedule(
  'send-weekly-tips',
  '0 9 * * 3', -- Tous les mercredis à 9h
  $$
  SELECT send_weekly_tips_batch();
  $$
);
```

---

## 📊 Monitoring et vérification

### Lister tous les Cron Jobs actifs

```sql
SELECT
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
ORDER BY jobid;
```

### Voir l'historique d'exécution

```sql
SELECT
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

### Vérifier les erreurs récentes

```sql
SELECT
  jobid,
  status,
  return_message,
  start_time
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🗑️ Gérer les Cron Jobs

### Supprimer un Cron Job

```sql
-- Par nom
SELECT cron.unschedule('send-unread-messages-reminders');
SELECT cron.unschedule('check-subscription-expiry');
SELECT cron.unschedule('send-profile-completion-reminders');
SELECT cron.unschedule('send-match-suggestions');
SELECT cron.unschedule('send-monthly-newsletter');
SELECT cron.unschedule('send-weekly-tips');
```

### Désactiver temporairement un Cron Job

```sql
-- Récupérer le jobid
SELECT jobid, schedule, command FROM cron.job WHERE command LIKE '%send-unread%';

-- Désactiver
UPDATE cron.job SET active = false WHERE jobid = <ID>;

-- Réactiver
UPDATE cron.job SET active = true WHERE jobid = <ID>;
```

### Modifier la fréquence d'un Cron Job

```sql
-- Supprimer l'ancien
SELECT cron.unschedule('send-weekly-tips');

-- Recréer avec nouvelle fréquence
SELECT cron.schedule(
  'send-weekly-tips',
  '0 9 * * 3,6', -- Maintenant mercredi ET samedi
  $$
  SELECT send_weekly_tips_batch();
  $$
);
```

---

## 🧪 Tests manuels

Testez chaque fonction individuellement avant de configurer les cron jobs :

```sql
-- Messages non lus
SELECT check_unread_messages_and_notify();

-- Expiration abonnement
SELECT check_subscription_expiry_and_notify();

-- Profils incomplets
SELECT check_incomplete_profiles_and_notify();

-- Suggestions de matchs
SELECT send_match_suggestions_batch();

-- Newsletter
SELECT send_monthly_newsletter();

-- Conseils hebdomadaires
SELECT send_weekly_tips_batch();
```

### Tester sur un seul utilisateur

```sql
-- Créer une fonction de test pour un utilisateur spécifique
CREATE OR REPLACE FUNCTION test_email_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-weekly-tips',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'user_id', target_user_id,
      'week_number', 1,
      'tips', jsonb_build_array(
        jsonb_build_object(
          'title', 'Test',
          'content', 'Ceci est un test',
          'icon', '🧪'
        )
      )
    )
  );
END;
$$;

-- Utiliser
SELECT test_email_for_user('USER_ID_ICI');
```

---

## 📝 Résumé complet des Cron Jobs

| Nom                               | Fréquence     | Fonction                                 | Description                           |
| --------------------------------- | ------------- | ---------------------------------------- | ------------------------------------- |
| send-unread-messages-reminders    | Quotidien 10h | `check_unread_messages_and_notify()`     | Rappel messages non lus (>24h)        |
| check-subscription-expiry         | Quotidien 9h  | `check_subscription_expiry_and_notify()` | Alerte expiration (7/3/1 jours avant) |
| send-profile-completion-reminders | Dimanche 10h  | `check_incomplete_profiles_and_notify()` | Rappel profil incomplet               |
| send-match-suggestions            | Mar/Ven 14h   | `send_match_suggestions_batch()`         | Suggestions profils compatibles       |
| send-monthly-newsletter           | 1er lundi 10h | `send_monthly_newsletter()`              | Newsletter mensuelle                  |
| send-weekly-tips                  | Mercredi 9h   | `send_weekly_tips_batch()`               | Conseils hebdomadaires                |

## 🔧 Script d'installation complet

Copiez ce script dans l'éditeur SQL de Supabase pour tout configurer d'un coup :

```sql
-- 1. Activer extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Configurer Service Role Key
ALTER DATABASE postgres SET "app.settings.service_role_key" TO 'VOTRE_SERVICE_ROLE_KEY';

-- 3. Créer toutes les fonctions (voir sections ci-dessus)

-- 4. Programmer tous les Cron Jobs
SELECT cron.schedule('send-unread-messages-reminders', '0 10 * * *', $$ SELECT check_unread_messages_and_notify(); $$);
SELECT cron.schedule('check-subscription-expiry', '0 9 * * *', $$ SELECT check_subscription_expiry_and_notify(); $$);
SELECT cron.schedule('send-profile-completion-reminders', '0 10 * * 0', $$ SELECT check_incomplete_profiles_and_notify(); $$);
SELECT cron.schedule('send-match-suggestions', '0 14 * * 2,5', $$ SELECT send_match_suggestions_batch(); $$);
SELECT cron.schedule('send-monthly-newsletter', '0 10 1-7 * 1', $$ SELECT send_monthly_newsletter(); $$);
SELECT cron.schedule('send-weekly-tips', '0 9 * * 3', $$ SELECT send_weekly_tips_batch(); $$);

-- 5. Vérifier l'installation
SELECT * FROM cron.job ORDER BY jobid;
```

## ⚠️ Notes importantes

1. **Extensions requises :**
   - `pg_cron` pour programmer les tâches
   - `pg_net` pour appels HTTP aux edge functions

2. **Sécurité :**
   - Toutes les fonctions utilisent `SECURITY DEFINER`
   - Service Role Key stockée de manière sécurisée
   - Validation des données dans les edge functions

3. **Performance :**
   - Les fonctions traitent par batch pour éviter les timeouts
   - Rate limiting sur les edge functions
   - Logs complets pour debugging

4. **Fuseau horaire :**
   - Horaires en UTC par défaut
   - Ajustez selon votre timezone (Europe/Paris = UTC+1/+2)

5. **Monitoring recommandé :**
   - Vérifiez `cron.job_run_details` quotidiennement
   - Consultez les logs edge functions régulièrement
   - Configurez des alertes pour les échecs critiques

---

## 🔗 Ressources

- [Documentation pg_cron](https://github.com/citusdata/pg_cron)
- [Documentation pg_net](https://github.com/supabase/pg_net)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Dashboard Supabase](https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya)

---

**Dernière mise à jour :** 2025-01-05  
**Auteur :** Équipe Zawaj-Connect
