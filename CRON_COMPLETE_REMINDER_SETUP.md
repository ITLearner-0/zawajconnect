# Configuration Complète des Rappels d'Expiration - Système Multi-Étapes

## 📋 Vue d'ensemble du Système

Ce système de rappels automatiques en **3 étapes** maximise les taux de renouvellement avec une **urgence croissante** :

| Timing | Fonction | Urgence | Heure | Description |
|--------|----------|---------|-------|-------------|
| **J-7** | `remind-expiring-subscriptions` | 🟡 Modérée | 09:00 | Premier rappel avec offre exclusive |
| **J-3** | `remind-expiring-3days` | 🟠 Élevée | 09:00 | Rappel urgent avec compte à rebours |
| **J-1** | `remind-expiring-1day` | 🔴 Critique | 09:00 | Dernière chance avec animations visuelles |
| **J** | `expire-subscriptions` | ⚫ Expiration | 00:00 | Expiration automatique + notification |

## 🚀 Configuration Rapide - Exécuter tout le SQL en une fois

```sql
-- =====================================================
-- CONFIGURATION COMPLÈTE DES CRON JOBS DE RAPPELS
-- Exécutez ce script dans le SQL Editor de Supabase
-- =====================================================

-- 1️⃣ Rappel à J-7 (tous les jours à 9h)
SELECT cron.schedule(
  'remind-expiring-subscriptions-daily',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-expiring-subscriptions',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
      body := jsonb_build_object('time', now())
    ) AS request_id;
  $$
);

-- 2️⃣ Rappel à J-3 (tous les jours à 9h)
SELECT cron.schedule(
  'remind-expiring-3days-daily',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-expiring-3days',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
      body := jsonb_build_object('time', now())
    ) AS request_id;
  $$
);

-- 3️⃣ Rappel à J-1 (tous les jours à 9h)
SELECT cron.schedule(
  'remind-expiring-1day-daily',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-expiring-1day',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
      body := jsonb_build_object('time', now())
    ) AS request_id;
  $$
);

-- 4️⃣ Expiration automatique (tous les jours à minuit)
SELECT cron.schedule(
  'expire-subscriptions-daily',
  '0 0 * * *',
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

## ✅ Vérifier tous les Cron Jobs

```sql
-- Voir tous les cron jobs de rappels configurés
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job
WHERE jobname LIKE '%remind%' OR jobname LIKE '%expire%'
ORDER BY jobname;
```

## 📊 Caractéristiques des Emails par Étape

### 🟡 J-7 : Premier Rappel (Modéré)
- **Design** : Orange/Jaune, professionnel
- **Ton** : Informatif et engageant
- **Éléments visuels** :
  - Badge de compte à rebours "7 JOURS"
  - Offre de réduction mise en avant
  - Liste des avantages premium
  - Témoignage client
- **CTA** : "Renouveler maintenant avec -X%"
- **Objectif** : Informer et proposer l'offre

### 🟠 J-3 : Rappel Urgent (Élevé)
- **Design** : Orange vif avec bordures, plus dynamique
- **Ton** : Plus urgent, rappel des pertes
- **Éléments visuels** :
  - Bannière "ATTENTION : PLUS QUE 3 JOURS !"
  - Compte à rebours : 3 jours / 72 heures
  - Animation pulse sur les éléments clés
  - Liste détaillée des fonctionnalités perdues
  - Warning boxes en jaune/orange
- **CTA** : "Renouveler Maintenant (-X%)"
- **Paramètre URL** : `?urgent=3days`
- **Objectif** : Créer un sentiment d'urgence

### 🔴 J-1 : Dernière Chance (Critique)
- **Design** : Rouge intense avec animations
- **Ton** : Très urgent, dramatique
- **Éléments visuels** :
  - Alerte "DERNIÈRE CHANCE" clignotante
  - Timer visuel : 1 jour / X heures
  - Animations : shake, pulse, blink
  - Badges "ALERTE CRITIQUE" animés
  - Témoignage de regret d'un ancien membre
  - Statistique choc (87% regrettent)
  - Multiples CTA rouges animés
- **CTA** : "🔥 RENOUVELER IMMÉDIATEMENT 🔥"
- **Paramètre URL** : `?urgent=lastday`
- **Objectif** : Déclencher l'action immédiate

## 🎨 Progression Visuelle de l'Urgence

```
J-7:  🟡 Calm & Professional
      └─ Gradient vert/émeraude
      └─ Animations subtiles
      └─ Ton informatif

J-3:  🟠 Warning & Urgent  
      └─ Gradient orange
      └─ Animations pulse
      └─ Ton pressant

J-1:  🔴 Critical & Dramatic
      └─ Gradient rouge foncé
      └─ Animations shake + blink
      └─ Ton dramatique

J:    ⚫ Expired
      └─ Email d'expiration
      └─ Downgrade effectif
```

## 🧪 Tests Manuels

### Tester chaque rappel individuellement

```sql
-- Test J-7
SELECT net.http_post(
  url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-expiring-subscriptions',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
  body := jsonb_build_object('time', now())
);

-- Test J-3
SELECT net.http_post(
  url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-expiring-3days',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
  body := jsonb_build_object('time', now())
);

-- Test J-1
SELECT net.http_post(
  url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/remind-expiring-1day',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"}'::jsonb,
  body := jsonb_build_object('time', now())
);
```

## 📈 KPIs à Suivre par Étape

| Métrique | J-7 | J-3 | J-1 | Objectif |
|----------|-----|-----|-----|----------|
| **Taux d'ouverture** | 35-45% | 45-55% | 55-70% | Augmentation progressive |
| **Taux de clic** | 15-20% | 20-30% | 30-45% | Plus d'urgence = plus de clics |
| **Taux de conversion** | 8-12% | 12-18% | 18-30% | Maximiser à J-1 |
| **Délai de conversion** | 2-4 jours | 1-2 jours | < 24h | Réaction plus rapide |

## 🎯 Optimisations Recommandées

### Tests A/B suggérés
1. **Offre de réduction** : Tester -20% vs -15%
2. **Heure d'envoi** : 9h vs 18h vs 20h
3. **Fréquence J-1** : Un seul email vs deux emails (matin + soir)
4. **Subject line** : Tester différentes formulations

### Segmentation avancée
```sql
-- Segmenter par valeur client
-- Clients premium 12 mois = plus de valeur = offre spéciale
-- Clients 3 mois = offre standard
```

## 🗑️ Gestion des Cron Jobs

### Désactiver tous les rappels temporairement
```sql
-- Désactiver J-7
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'remind-expiring-subscriptions-daily'),
  schedule := NULL
);

-- Désactiver J-3
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'remind-expiring-3days-daily'),
  schedule := NULL
);

-- Désactiver J-1
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'remind-expiring-1day-daily'),
  schedule := NULL
);
```

### Supprimer tous les rappels
```sql
SELECT cron.unschedule('remind-expiring-subscriptions-daily');
SELECT cron.unschedule('remind-expiring-3days-daily');
SELECT cron.unschedule('remind-expiring-1day-daily');
SELECT cron.unschedule('expire-subscriptions-daily');
```

## 📧 Configuration Email Domaine

**Important** : Remplacez `onboarding@resend.dev` par votre domaine vérifié dans les 3 fichiers :
- `supabase/functions/remind-expiring-subscriptions/index.ts`
- `supabase/functions/remind-expiring-3days/index.ts`
- `supabase/functions/remind-expiring-1day/index.ts`

## 🎨 Personnalisation Frontend

Les paramètres URL permettent d'afficher des messages personnalisés :

```typescript
// Dans votre page Settings
const searchParams = new URLSearchParams(window.location.search);
const isRenewal = searchParams.get('renew') === 'true';
const promoCode = searchParams.get('code');
const urgency = searchParams.get('urgent'); // '3days' ou 'lastday'

if (isRenewal && urgency === 'lastday') {
  // Afficher bannière rouge "DERNIÈRES HEURES"
  // Animation de compte à rebours
  // Code promo pré-rempli
}
```

## 🚀 Prochaines Améliorations

1. **Rappel à J-14** : Pour clients historiquement peu réactifs
2. **Email de célébration** : Pour renouvellements effectués
3. **Programme de fidélité** : Bonus pour renouvellements anticipés (avant J-7)
4. **SMS d'urgence** : À J-1 pour les non-ouvreurs d'emails
5. **Dashboard de suivi** : Taux de conversion par étape en temps réel
