# Configuration du Cron Job pour les Rappels d'Inscriptions Wali en Attente

## 📋 Vue d'ensemble

Cette edge function envoie des **emails de rappel automatiques** aux administrateurs lorsque des inscriptions Wali sont en attente de traitement depuis **plus de 7 jours**, afin d'assurer un processus de validation rapide et efficace.

## 🎯 Fonctionnalités

✅ **Détection automatique** des inscriptions Wali en attente depuis 7+ jours  
✅ **Emails groupés** envoyés à tous les administrateurs  
✅ **Tableau récapitulatif** avec nom, relation, email et durée d'attente  
✅ **Logging automatique** dans l'historique d'activité  
✅ **Design professionnel** responsive avec alertes visuelles  
✅ **Statistiques complètes** dans les logs (nombre d'emails envoyés, erreurs)

## 🔧 Configuration du Cron Job

### Exécuter ce SQL dans le SQL Editor de Supabase

```sql
-- Schedule the remind-pending-wali-registrations function to run daily at 9:00 AM
SELECT cron.schedule(
  'remind-pending-wali-registrations-daily',  -- Job name
  '0 9 * * *',                                 -- Cron schedule: Every day at 9:00 AM
  $$
  SELECT
    net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-pending-wali-registrations',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
      body := jsonb_build_object('time', now())
    ) AS request_id;
  $$
);
```

### Personnaliser l'heure d'exécution

Le cron est configuré pour s'exécuter à **9h00 du matin** (`0 9 * * *`). Vous pouvez modifier l'heure :

```
Format Cron : minute heure jour mois jour_semaine

Exemples :
- '0 9 * * *'   → 9h00 tous les jours
- '0 10 * * *'  → 10h00 tous les jours
- '30 8 * * *'  → 8h30 tous les jours
- '0 14 * * *'  → 14h00 tous les jours
```

## ✅ Vérifier le Cron Job

```sql
-- View the scheduled job
SELECT
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'remind-pending-wali-registrations-daily';
```

## 🧪 Tester Manuellement

Pour tester sans attendre l'heure programmée :

```sql
-- Manually trigger the reminder function
SELECT
  net.http_post(
    url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-pending-wali-registrations',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
    body := jsonb_build_object('time', now())
  ) AS request_id;
```

## 📊 Surveiller les Exécutions

```sql
-- View cron job execution history
SELECT
  runid,
  jobid,
  job_name,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE job_name = 'remind-pending-wali-registrations-daily'
ORDER BY start_time DESC
LIMIT 20;
```

## 🗑️ Désactiver/Supprimer (si nécessaire)

```sql
-- Disable temporarily
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'remind-pending-wali-registrations-daily'),
  schedule := NULL
);

-- Delete permanently
SELECT cron.unschedule('remind-pending-wali-registrations-daily');
```

## 📧 Structure de l'Email

Les administrateurs reçoivent un email professionnel contenant :

### 🎨 Design & Contenu

- ⚠️ **En-tête d'alerte** : Badge rouge avec nombre d'inscriptions en attente
- 📊 **Tableau récapitulatif** : Nom, relation, email, durée d'attente pour chaque inscription
- 🚨 **Alerte visuelle** : Bannière rouge indiquant l'urgence
- 💡 **Rappel de bonnes pratiques** : Importance du traitement rapide
- 🎯 **CTA direct** : Bouton vers la page d'administration des inscriptions Wali

### 📋 Informations Affichées par Inscription

- **Nom complet** du Wali
- **Relation** avec l'utilisateur
- **Email** de contact
- **Nombre de jours** en attente (en rouge)

### 🔗 Lien CTA

Le bouton redirige vers :

```
https://mariage-halal.com/admin/wali-registrations
```

## 🎯 Logique de Détection

La fonction cherche les inscriptions qui :

1. ✅ Ont le statut `'pending'`
2. ✅ Ont une date `created_at` antérieure à il y a 7 jours

Exemple : Si exécuté le 13 novembre 2025, cherche les inscriptions créées avant le 6 novembre 2025.

## 📈 Métriques & Logs

Chaque exécution génère un rapport avec :

```json
{
  "success": true,
  "message": "Pending Wali registrations reminder process completed",
  "results": {
    "total": 5, // Nombre total d'inscriptions en attente 7+ jours
    "emailsSent": 3, // Nombre d'emails envoyés avec succès
    "adminEmails": 3, // Nombre d'admins notifiés
    "errors": [] // Liste des erreurs éventuelles
  }
}
```

## 🔍 Historique d'Activité

Chaque envoi de rappel est automatiquement loggé dans `wali_registration_activity_log` :

- **Type d'action** : `reminder_sent`
- **Détails** : Type de rappel, nombre d'admins notifiés, jours d'attente
- **Visible** : Dans l'onglet "Activité" du modal de détails d'inscription

## 🔔 Notifications & Monitoring

### Logs Supabase

Consultez les logs dans le dashboard Supabase pour :

- Nombre d'inscriptions détectées en attente
- Emails envoyés avec succès aux admins
- Erreurs d'envoi (email invalide, SMTP down, etc.)

### Alertes Recommandées

Configurez des alertes si :

- ❌ Aucun email n'est envoyé pendant 7 jours (possible problème SMTP)
- ❌ Taux d'erreur > 50%
- ❌ Échec de l'exécution du cron job
- ⚠️ Plus de 10 inscriptions en attente simultanément

## 🚀 Stratégie de Gestion des Inscriptions

Cette fonction fait partie d'une stratégie complète de gestion des Walis :

| Timing     | Action                                 | Fonction                                             |
| ---------- | -------------------------------------- | ---------------------------------------------------- |
| J+7        | 🔔 Premier rappel aux admins           | `remind-pending-wali-registrations` (CETTE FONCTION) |
| J+14       | ⚠️ Deuxième rappel urgent              | À créer                                              |
| J+21       | 🚨 Escalade - Notification super admin | À créer                                              |
| Traitement | ✅ Approbation/Rejet                   | Interface admin existante                            |

## 💡 Prochaines Améliorations

1. **Rappels multi-niveaux** : J+7, J+14, J+21 avec urgence croissante
2. **Segmentation des rappels** : Par niveau de risque ou type de relation
3. **Dashboard de métriques** : Temps moyen de traitement, taux d'approbation
4. **Notifications Slack/Discord** : Intégration pour alertes en temps réel
5. **Auto-rejet** : Après 30 jours sans traitement avec notification à l'utilisateur

## ⚙️ Configuration SMTP

Assurez-vous que :

- ✅ Le domaine d'envoi est vérifié (Hostinger ou autre)
- ✅ Les variables SMTP sont configurées dans Supabase Edge Functions
- ✅ Les emails admins sont valides dans `user_roles`
- ✅ Les liens dans l'email pointent vers votre vraie URL de production

## 🎯 KPIs à Suivre

- **Temps moyen de traitement** : Du statut pending à approved/rejected
- **Taux de rappel** : % d'inscriptions nécessitant un rappel
- **Efficacité des rappels** : Délai de traitement après rappel
- **Taux d'approbation** : % d'inscriptions approuvées vs rejetées
- **Engagement admin** : Nombre d'admins actifs sur les traitements

## 🔗 Liens Utiles

- **Page d'administration** : https://mariage-halal.com/admin/wali-registrations
- **Monitoring** : https://mariage-halal.com/admin/wali-monitoring
- **Logs Edge Functions** : Dashboard Supabase > Edge Functions > remind-pending-wali-registrations
