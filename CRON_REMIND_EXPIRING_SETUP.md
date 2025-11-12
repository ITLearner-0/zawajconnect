# Configuration du Cron Job pour les Rappels d'Expiration (7 jours avant)

## 📋 Vue d'ensemble

Cette edge function envoie des **emails de rappel automatiques** aux utilisateurs dont l'abonnement expire dans **exactement 7 jours**, avec une **offre de renouvellement exclusive** pour les encourager à renouveler avant l'échéance.

## 🎯 Fonctionnalités

✅ **Détection automatique** des abonnements expirant dans 7 jours  
✅ **Emails personnalisés** avec le nom de l'utilisateur et détails de l'abonnement  
✅ **Offres de réduction exclusives** selon le type d'abonnement :

- Premium 12 mois : **-15%** avec code `RENOUVELLEMENT15`
- Premium 6 mois : **-10%** avec code `RENOUVELLEMENT10`
- Premium 3 mois : **-5%** avec code `RENOUVELLEMENT5`

✅ **Design professionnel** responsive avec compte à rebours et CTA attractif  
✅ **Statistiques complètes** dans les logs (nombre d'emails envoyés, erreurs)

## 🔧 Configuration du Cron Job

### Exécuter ce SQL dans le SQL Editor de Supabase

```sql
-- Schedule the remind-expiring-subscriptions function to run daily at 9:00 AM
SELECT cron.schedule(
  'remind-expiring-subscriptions-daily',  -- Job name
  '0 9 * * *',                              -- Cron schedule: Every day at 9:00 AM
  $$
  SELECT
    net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-expiring-subscriptions',
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
- '0 20 * * *'  → 20h00 tous les jours
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
WHERE jobname = 'remind-expiring-subscriptions-daily';
```

## 🧪 Tester Manuellement

Pour tester sans attendre l'heure programmée :

```sql
-- Manually trigger the reminder function
SELECT
  net.http_post(
    url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-expiring-subscriptions',
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
WHERE job_name = 'remind-expiring-subscriptions-daily'
ORDER BY start_time DESC
LIMIT 20;
```

## 🗑️ Désactiver/Supprimer (si nécessaire)

```sql
-- Disable temporarily
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'remind-expiring-subscriptions-daily'),
  schedule := NULL
);

-- Delete permanently
SELECT cron.unschedule('remind-expiring-subscriptions-daily');
```

## 📧 Structure de l'Email

Les utilisateurs reçoivent un email professionnel contenant :

### 🎨 Design & Contenu

- ⏰ **Compte à rebours visuel** : "7 JOURS" en grand et en couleur
- 📅 **Date d'expiration précise** : Formatée en français
- ⚠️ **Avertissement clair** : Liste des limitations du compte gratuit
- 🎁 **Offre exclusive** : Badge de réduction avec code promo
- ✨ **Liste des avantages premium** : Rappel de toutes les fonctionnalités
- 📊 **Statistique convaincante** : "3x plus de chances" avec premium
- 🎯 **CTA attractif** : Bouton jaune avec réduction visible

### 💰 Codes Promo par Type d'Abonnement

| Type d'Abonnement | Réduction | Code Promo         |
| ----------------- | --------- | ------------------ |
| Premium 12 mois   | -15%      | `RENOUVELLEMENT15` |
| Premium 6 mois    | -10%      | `RENOUVELLEMENT10` |
| Premium 3 mois    | -5%       | `RENOUVELLEMENT5`  |

### 🔗 CTA avec Paramètres

Le bouton CTA redirige vers :

```
https://mariage-halal.com/settings?renew=true&code={CODE_PROMO}
```

Vous pouvez détecter ces paramètres dans votre page Settings pour :

- Afficher un message personnalisé de renouvellement
- Pré-remplir le code promo
- Mettre en avant les options de renouvellement

## 🎯 Logique de Détection

La fonction cherche les abonnements qui :

1. ✅ Ont le statut `'active'`
2. ✅ Ont une date `expires_at` entre :
   - Début : Aujourd'hui + 7 jours à 00:00:00
   - Fin : Aujourd'hui + 7 jours à 23:59:59

Exemple : Si exécuté le 10 janvier 2025, cherche les abonnements expirant le 17 janvier 2025.

## 📈 Métriques & Logs

Chaque exécution génère un rapport avec :

```json
{
  "success": true,
  "message": "Subscription reminder process completed",
  "results": {
    "total": 15, // Nombre total d'abonnements concernés
    "emailsSent": 14, // Nombre d'emails envoyés avec succès
    "errors": [
      // Liste des erreurs éventuelles
      "No email found for user abc-123"
    ]
  }
}
```

## 🔔 Notifications & Monitoring

### Logs Supabase

Consultez les logs dans le dashboard Supabase pour :

- Nombre d'abonnements détectés
- Emails envoyés avec succès
- Erreurs d'envoi (email invalide, Resend API down, etc.)

### Alertes Recommandées

Configurez des alertes si :

- ❌ Aucun email n'est envoyé pendant 7 jours consécutifs
- ❌ Taux d'erreur > 20%
- ❌ Échec de l'exécution du cron job

## 🚀 Stratégie de Renouvellement Complète

Cette fonction fait partie d'une stratégie en plusieurs étapes :

| Timing | Action                         | Fonction                                         |
| ------ | ------------------------------ | ------------------------------------------------ |
| J-7    | 🎁 Rappel avec offre exclusive | `remind-expiring-subscriptions` (CETTE FONCTION) |
| J-3    | ⚠️ Deuxième rappel plus urgent | À créer                                          |
| J-1    | 🚨 Dernière chance             | À créer                                          |
| J      | ❌ Expiration & downgrade      | `expire-subscriptions` (existante)               |

## 💡 Prochaines Améliorations

1. **Rappels à J-3 et J-1** : Augmenter les chances de renouvellement
2. **A/B Testing des offres** : Tester différentes réductions
3. **Segmentation** : Offres personnalisées selon l'historique
4. **Analytics** : Dashboard de taux de conversion des rappels
5. **Follow-up post-expiration** : Offre de retour à J+3 et J+7

## ⚙️ Configuration Resend

Assurez-vous que :

- ✅ Le domaine d'envoi est vérifié sur Resend
- ✅ La clé API `RESEND_API_KEY` est configurée
- ✅ L'adresse `onboarding@resend.dev` est remplacée par votre domaine
- ✅ Les liens dans l'email pointent vers votre vraie URL de production

## 🎯 KPIs à Suivre

- **Taux d'ouverture** : % d'emails ouverts
- **Taux de clic** : % de clics sur le bouton CTA
- **Taux de conversion** : % de renouvellements suite au rappel
- **Délai de renouvellement** : Temps moyen entre rappel et renouvellement
- **Valeur du code promo** : Impact de la réduction sur les conversions
