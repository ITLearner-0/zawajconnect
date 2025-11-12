# Configuration du Cron Job pour l'Expiration Automatique des Abonnements

## 📋 Prérequis

Avant de configurer le cron job, assurez-vous que :

1. ✅ Le secret `RESEND_API_KEY` est configuré
2. ✅ Votre domaine email est vérifié sur Resend (https://resend.com/domains)
3. ✅ Les extensions `pg_cron` et `pg_net` sont activées dans votre projet Supabase

## 🔧 Étape 1 : Activer les Extensions

Exécutez les commandes SQL suivantes dans le SQL Editor de Supabase :

```sql
-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

## ⏰ Étape 2 : Créer le Cron Job

Exécutez la commande SQL suivante pour créer le cron job qui s'exécutera **tous les jours à minuit (00:00)** :

```sql
-- Schedule the expire-subscriptions function to run daily at midnight
SELECT cron.schedule(
  'expire-subscriptions-daily',  -- Job name
  '0 0 * * *',                    -- Cron schedule: Every day at midnight
  $$
  SELECT
    net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/expire-subscriptions',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
      body := jsonb_build_object('time', now())
    ) AS request_id;
  $$
);
```

## ✅ Étape 3 : Vérifier le Cron Job

Pour vérifier que le cron job a été créé avec succès :

```sql
-- View all scheduled cron jobs
SELECT
  jobid,
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  active
FROM cron.job
WHERE jobname = 'expire-subscriptions-daily';
```

## 🧪 Étape 4 : Tester Manuellement (Optionnel)

Pour tester la fonction sans attendre minuit :

```sql
-- Manually trigger the function
SELECT
  net.http_post(
    url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/expire-subscriptions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
    body := jsonb_build_object('time', now())
  ) AS request_id;
```

## 📊 Étape 5 : Surveiller l'Exécution

Pour voir l'historique des exécutions du cron job :

```sql
-- View cron job run history
SELECT
  runid,
  jobid,
  job_name,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE job_name = 'expire-subscriptions-daily'
ORDER BY start_time DESC
LIMIT 10;
```

## 🗑️ Désactiver/Supprimer le Cron Job (si nécessaire)

Pour désactiver temporairement :

```sql
-- Disable the cron job
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'expire-subscriptions-daily'),
  schedule := NULL
);
```

Pour supprimer complètement :

```sql
-- Delete the cron job
SELECT cron.unschedule('expire-subscriptions-daily');
```

## 📧 Configuration Email Resend

N'oubliez pas de :

1. Créer un compte sur https://resend.com
2. Vérifier votre domaine d'envoi : https://resend.com/domains
3. Créer une clé API : https://resend.com/api-keys
4. Remplacer `onboarding@resend.dev` par votre vrai domaine dans l'edge function si nécessaire

## 🔔 Ce que fait le Cron Job

Le cron job **tous les jours à minuit** :

1. ✅ Cherche tous les abonnements actifs avec `expires_at < now()`
2. ✅ Met à jour leur `status` à `'expired'`
3. ✅ Envoie un email de notification personnalisé à chaque utilisateur concerné
4. ✅ Enregistre automatiquement les modifications dans `subscription_history` (via triggers)
5. ✅ Log tous les résultats pour le monitoring

## 📝 Formats d'Email Envoyés

Les utilisateurs recevront un email professionnel contenant :

- Notification claire de l'expiration
- Date d'expiration de leur abonnement
- Liste des limitations du compte gratuit
- Bouton CTA pour renouveler l'abonnement
- Design responsive et professionnel

## 🎯 Prochaines Étapes Recommandées

1. **Configurer des alertes email 7 jours avant expiration** (proactif)
2. **Dashboard admin pour voir les abonnements expirant bientôt**
3. **Offres de renouvellement automatiques** (3 jours avant expiration)
4. **Statistiques d'expiration et de renouvellement**
