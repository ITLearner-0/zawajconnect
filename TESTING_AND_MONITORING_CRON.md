# Guide de Test et Monitoring des Cron Jobs

## 🧪 Comment Tester les Emails Manuellement

### Option 1: Via le SQL Editor de Supabase

1. **Ouvrez le SQL Editor**: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/sql/new

2. **Testez chaque fonction individuellement**:

```sql
-- Test 1: Messages non lus (envoie email si messages > 24h non lus)
SELECT check_unread_messages_and_notify();

-- Test 2: Abonnements expirant (envoie email si expire dans 7/3/1 jours)
SELECT check_subscription_expiry_and_notify();

-- Test 3: Profils incomplets (envoie email si profil < 90 jours incomplet)
SELECT check_incomplete_profiles_and_notify();

-- Test 4: Suggestions de matches (envoie aux users premium/family)
SELECT send_match_suggestions_batch();

-- Test 5: Newsletter mensuelle
SELECT send_monthly_newsletter();

-- Test 6: Conseils hebdomadaires
SELECT send_weekly_tips_batch();
```

3. **Vérifiez les logs**:
   - Les fonctions retournent `void` donc pas de résultat visible
   - Allez dans les logs des Edge Functions pour voir si les emails sont envoyés
   - Vérifiez votre dashboard Resend pour confirmer l'envoi

### Option 2: Créer des Données de Test

Pour tester réellement l'envoi d'emails, vous pouvez créer des données de test:

```sql
-- Exemple: Créer un message non lu ancien pour tester
INSERT INTO messages (match_id, sender_id, content, is_read, created_at)
VALUES (
  (SELECT id FROM matches LIMIT 1),
  (SELECT user1_id FROM matches LIMIT 1),
  'Message de test pour cron job',
  false,
  now() - INTERVAL '25 hours'  -- 25h dans le passé
);

-- Puis testez la fonction
SELECT check_unread_messages_and_notify();
```

---

## 📊 Comment Monitorer les Cron Jobs

### 1. Vérifier l'État des Jobs

```sql
-- Voir tous les cron jobs configurés
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active,
  database
FROM cron.job
ORDER BY jobid;
```

**Résultat attendu**: 6 jobs actifs (active = true)

### 2. Voir l'Historique d'Exécution

```sql
-- Voir les 20 dernières exécutions
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

### 3. Identifier les Erreurs

```sql
-- Voir uniquement les exécutions échouées
SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time,
  command
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### 4. Statistiques par Job

```sql
-- Statistiques d'exécution par job
SELECT 
  j.jobname,
  COUNT(*) as total_runs,
  COUNT(CASE WHEN jrd.status = 'succeeded' THEN 1 END) as successful_runs,
  COUNT(CASE WHEN jrd.status = 'failed' THEN 1 END) as failed_runs,
  MAX(jrd.start_time) as last_run
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
GROUP BY j.jobid, j.jobname
ORDER BY j.jobid;
```

---

## 🔍 Monitorer les Edge Functions

### Accès aux Logs des Edge Functions

Pour chaque fonction email, vous pouvez voir les logs détaillés:

1. **send-unread-messages-reminder**: 
   - https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/send-unread-messages-reminder/logs

2. **send-subscription-expiring-email**:
   - https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/send-subscription-expiring-email/logs

3. **send-profile-reminder**:
   - https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/send-profile-reminder/logs

4. **send-match-suggestions**:
   - https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/send-match-suggestions/logs

5. **send-newsletter**:
   - https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/send-newsletter/logs

6. **send-weekly-tips**:
   - https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/send-weekly-tips/logs

### Que Chercher dans les Logs?

- ✅ **Success**: `Email sent successfully`
- ❌ **Errors**: Messages d'erreur de Resend ou de la fonction
- ⚠️ **Warnings**: Problèmes de données (pas d'utilisateurs trouvés, etc.)

---

## 📧 Vérifier dans Resend

1. **Dashboard Resend**: https://resend.com/emails
2. Vérifiez:
   - Emails envoyés récemment
   - Taux de délivrabilité
   - Erreurs d'envoi (bounces, rejets)

---

## 🚨 Dépannage Courant

### Les cron jobs ne s'exécutent pas

```sql
-- Vérifier si pg_cron est activé
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Vérifier si les jobs sont actifs
SELECT jobname, active FROM cron.job;

-- Réactiver un job si nécessaire
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'unread-messages-check'),
  schedule := '0 10 * * *'  -- Exemple: tous les jours à 10h
);
```

### Les emails ne partent pas

1. **Vérifier RESEND_API_KEY**:
   - https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/functions
   - La clé doit être configurée dans les secrets des Edge Functions

2. **Vérifier le domaine Resend**:
   - https://resend.com/domains
   - Le domaine doit être vérifié

3. **Tester manuellement l'edge function**:
   ```bash
   # Via l'API Supabase
   curl -X POST 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-welcome-email' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"user_id": "test-user-id"}'
   ```

---

## ⏰ Horaires des Cron Jobs

| Job | Fréquence | Heure (UTC) | Description |
|-----|-----------|-------------|-------------|
| Messages non lus | Quotidien | 10h | Rappel messages > 24h |
| Abonnements expirant | Quotidien | 9h | Alerte 7/3/1 jours avant |
| Profils incomplets | Hebdomadaire | Dim 14h | Rappel compléter profil |
| Suggestions matches | Hebdomadaire | Lun 8h | Nouveaux profils compatibles |
| Newsletter | Mensuel | 1er à 6h | Contenu mensuel |
| Conseils hebdo | Hebdomadaire | Ven 7h | Tips & conseils |

**Note**: Tous les horaires sont en UTC. Ajoutez +1h (hiver) ou +2h (été) pour l'heure française.

---

## 📝 Checklist de Vérification

- [ ] Les 6 cron jobs sont actifs dans `cron.job`
- [ ] `pg_cron` et `pg_net` extensions sont installées
- [ ] RESEND_API_KEY est configuré dans les secrets Edge Functions
- [ ] Le domaine est vérifié dans Resend
- [ ] Les Edge Functions sont déployées et accessibles
- [ ] Test manuel d'une fonction fonctionne
- [ ] Les logs des Edge Functions ne montrent pas d'erreurs
- [ ] Les emails de test arrivent bien dans la boîte mail
