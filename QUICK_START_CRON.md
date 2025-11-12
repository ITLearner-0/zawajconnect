# 🚀 Démarrage Rapide - Configuration des Cron Jobs

## Configuration en 3 minutes

### Étape 1: Récupérer votre Service Role Key

1. Allez sur: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/api
2. Copiez la **Service Role Key** (sous "Project API keys")
3. ⚠️ **Important**: Cette clé est secrète, ne la partagez jamais !

### Étape 2: Ouvrir l'éditeur SQL

1. Allez sur: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/sql/new
2. Vous êtes maintenant dans l'éditeur SQL

### Étape 3: Exécuter le script

1. Ouvrez le fichier `COMPLETE_CRON_SETUP.sql`
2. **Remplacez** `YOUR_SERVICE_ROLE_KEY` par votre vraie clé (ligne 17)
3. Copiez tout le contenu du fichier
4. Collez-le dans l'éditeur SQL de Supabase
5. Cliquez sur **"Run"** en bas à droite

### Étape 4: Vérifier l'installation

Le script affichera automatiquement la liste des cron jobs créés.

Vous devriez voir **6 cron jobs** configurés:

- ✅ send-unread-messages-reminders
- ✅ check-subscription-expiry
- ✅ send-profile-completion-reminders
- ✅ send-match-suggestions
- ✅ send-monthly-newsletter
- ✅ send-weekly-tips

## ✅ C'est terminé !

Tous vos emails automatiques sont maintenant configurés et s'exécuteront aux horaires définis.

## 📊 Monitoring

Pour voir les exécutions des cron jobs:

```sql
SELECT
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

## 🧪 Test manuel (optionnel)

Pour tester une fonction immédiatement:

```sql
-- Tester les messages non lus
SELECT check_unread_messages_and_notify();

-- Tester les suggestions de matchs
SELECT send_match_suggestions_batch();
```

## 📚 Documentation complète

Pour plus de détails, consultez `CRON_JOBS_SETUP.md`

## 🔗 Liens utiles

- Dashboard Supabase: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya
- Edge Functions: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions
- Logs Edge Functions: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/logs/edge-functions
