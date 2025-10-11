# 🔄 Configuration des tâches programmées (Cron Jobs)

## Vue d'ensemble

Certaines fonctionnalités nécessitent des tâches automatisées qui s'exécutent régulièrement (emails de rappel, expiration d'abonnement, etc.).

---

## 📧 Emails nécessitant des Cron Jobs

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

## 🔐 Configuration de la clé Service Role

**IMPORTANT :** Vous devez configurer la clé service role pour que les fonctions puissent appeler les edge functions.

```sql
-- Configurer la clé service role (à exécuter une seule fois)
ALTER DATABASE postgres SET "app.settings.service_role_key" TO 'VOTRE_SUPABASE_SERVICE_ROLE_KEY';
```

⚠️ **Remplacez `VOTRE_SUPABASE_SERVICE_ROLE_KEY` par votre vraie clé !**

---

## 📊 Vérifier les Cron Jobs actifs

```sql
-- Lister tous les cron jobs
SELECT * FROM cron.job;

-- Voir l'historique d'exécution
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 🗑️ Supprimer un Cron Job

```sql
-- Supprimer un cron job par son nom
SELECT cron.unschedule('send-unread-messages-reminders');
SELECT cron.unschedule('check-subscription-expiry');
```

---

## 🧪 Tester manuellement

Vous pouvez tester les fonctions manuellement avant de configurer les cron jobs :

```sql
-- Tester la fonction de messages non lus
SELECT check_unread_messages_and_notify();

-- Tester la fonction d'expiration d'abonnement
SELECT check_subscription_expiry_and_notify();
```

---

## 📝 Notes importantes

1. **Extensions requises :** 
   - `pg_cron` : Pour programmer les tâches
   - `pg_net` : Pour faire des appels HTTP vers les edge functions

2. **Permissions :**
   - Les fonctions utilisent `SECURITY DEFINER` pour s'exécuter avec les privilèges du créateur
   - Assurez-vous que l'utilisateur qui crée ces fonctions a les permissions nécessaires

3. **Monitoring :**
   - Surveillez régulièrement `cron.job_run_details` pour détecter les erreurs
   - Les logs des edge functions sont disponibles dans le dashboard Supabase

4. **Fuseau horaire :**
   - Les heures sont en UTC par défaut
   - Ajustez selon votre fuseau horaire si nécessaire

---

## 🔗 Ressources

- [Documentation pg_cron](https://github.com/citusdata/pg_cron)
- [Documentation pg_net](https://github.com/supabase/pg_net)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Dashboard Supabase](https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya)

---

**Dernière mise à jour :** 2025-01-05  
**Auteur :** Équipe Mariage-Halal
