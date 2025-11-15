# 📊 Analyse Complète - Base de Données et Fonctionnalités ZawajConnect

## 🎯 Résumé Exécutif

- **Total de tables existantes** : 73
- **Total de fonctionnalités** : 100+
- **Catégories principales** : 16
- **Fonctions Edge** : 50+
- **Services** : 14+

---

## 📋 TABLE DES MATIÈRES

1. [Tables Existantes - Statut](#tables-existantes)
2. [Nouvelles Tables à Créer](#nouvelles-tables-à-créer)
3. [Mises à Jour de Tables Requises](#mises-à-jour-requises)
4. [État du Fichier types.ts](#état-typests)
5. [Recommandations de Migration](#recommandations)

---

## 📚 TABLES EXISTANTES (Selon types.ts)

### ✅ Tables Déjà Créées

| Table                          | Statut    | Fonctionnalités Associées               |
| ------------------------------ | --------- | --------------------------------------- |
| `achievement_unlocks`          | ✅ Existe | Gamification, badges, récompenses       |
| `admin_settings`               | ✅ Existe | Configuration admin, paramètres système |
| `blocked_match_pairs`          | ✅ Existe | Blocage d'utilisateurs, sécurité        |
| `compatibility_questions`      | ✅ Existe | Tests de compatibilité                  |
| `compatibility_results`        | ✅ Existe | Résultats et insights de compatibilité  |
| `compatibility_scores`         | ✅ Existe | Scores de matching                      |
| `conversation_participants`    | ✅ Existe | Participants aux conversations          |
| `daily_quests`                 | ✅ Existe | Quêtes quotidiennes                     |
| `email_ab_tests`               | ✅ Existe | Tests A/B pour emails                   |
| `email_ab_test_results`        | ✅ Existe | Résultats des tests A/B                 |
| `family_members`               | ✅ Existe | Gestion des walis et familles           |
| `family_notifications`         | ✅ Existe | Notifications famille                   |
| `insight_actions`              | ✅ Existe | Actions sur les insights                |
| `insights_analytics`           | ✅ Existe | Analytics des insights                  |
| `islamic_moderation_rules`     | ✅ Existe | Règles de modération islamique          |
| `islamic_preferences`          | ✅ Existe | Préférences religieuses                 |
| `login_streaks`                | ✅ Existe | Suivi des connexions                    |
| `matches`                      | ✅ Existe | Matching et compatibilité               |
| `messages`                     | ✅ Existe | Messagerie                              |
| `message_suggestions`          | ✅ Existe | Suggestions de messages IA              |
| `moderation_logs`              | ✅ Existe | Logs de modération                      |
| `moderation_rules`             | ✅ Existe | Règles de modération                    |
| `moderation_violations`        | ✅ Existe | Violations de contenu                   |
| `notifications`                | ✅ Existe | Notifications générales                 |
| `onboarding_analytics`         | ✅ Existe | Analytics d'onboarding                  |
| `privacy_settings`             | ✅ Existe | Paramètres de confidentialité           |
| `profile_comparison_history`   | ✅ Existe | Historique de comparaisons              |
| `profile_notes`                | ✅ Existe | Notes sur profils                       |
| `profile_views`                | ✅ Existe | Vues de profils                         |
| `profile_views_daily`          | ✅ Existe | Vues quotidiennes agrégées              |
| `profiles`                     | ✅ Existe | Profils utilisateurs                    |
| `reports`                      | ✅ Existe | Signalements                            |
| `role_audit_log`               | ✅ Existe | Audit des rôles                         |
| `security_audit_log`           | ✅ Existe | Audit de sécurité                       |
| `security_events`              | ✅ Existe | Événements de sécurité                  |
| `subscribers`                  | ✅ Existe | Abonnés newsletter                      |
| `subscriptions`                | ✅ Existe | Abonnements payants                     |
| `subscription_history`         | ✅ Existe | Historique abonnements                  |
| `user_compatibility_responses` | ✅ Existe | Réponses aux tests                      |
| `user_daily_quest_progress`    | ✅ Existe | Progression quêtes                      |
| `user_levels`                  | ✅ Existe | Niveaux et XP                           |
| `user_progression`             | ✅ Existe | Progression utilisateur                 |
| `user_roles`                   | ✅ Existe | Rôles utilisateurs                      |
| `user_sessions`                | ✅ Existe | Sessions utilisateurs                   |
| `user_settings`                | ✅ Existe | Paramètres utilisateurs                 |
| `user_status`                  | ✅ Existe | Statut en ligne/hors ligne              |
| `user_verifications`           | ✅ Existe | Vérifications utilisateurs              |
| `video_calls`                  | ✅ Existe | Appels vidéo                            |
| `wali_invitations`             | ✅ Existe | Invitations wali                        |

**Total : 49 tables existantes confirmées**

---

## 🆕 NOUVELLES TABLES À CRÉER

### 🔴 Priorité HAUTE (Fonctionnalités Core)

#### 1. Tables Wali/Famille Manquantes

```sql
-- Table pour les enregistrements wali
CREATE TABLE IF NOT EXISTS wali_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wali_email VARCHAR(255) NOT NULL,
  wali_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verification_status VARCHAR(50) DEFAULT 'pending',
  verification_code VARCHAR(100),
  UNIQUE(user_id, wali_email)
);

-- Table pour les filtres wali
CREATE TABLE IF NOT EXISTS wali_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  filter_type VARCHAR(100) NOT NULL,
  filter_criteria JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les délégations wali
CREATE TABLE IF NOT EXISTS wali_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  delegated_to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL,
  delegation_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delegation_end TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true
);

-- Table pour les suspensions wali
CREATE TABLE IF NOT EXISTS wali_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  suspended_by UUID REFERENCES auth.users(id),
  suspension_reason TEXT,
  suspended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  suspension_end TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true
);

-- Table pour l'historique des emails wali
CREATE TABLE IF NOT EXISTS wali_email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  email_type VARCHAR(100) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_content TEXT,
  delivery_status VARCHAR(50),
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false
);

-- Table pour la progression d'onboarding wali
CREATE TABLE IF NOT EXISTS wali_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  UNIQUE(wali_id, step_name)
);
```

#### 2. Tables Supervision Famille

```sql
-- Table pour les logs de supervision
CREATE TABLE IF NOT EXISTS supervision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  supervised_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  action_details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- Table pour les règles de supervision famille
CREATE TABLE IF NOT EXISTS family_supervision_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  rule_type VARCHAR(100) NOT NULL,
  rule_config JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'audit d'accès famille
CREATE TABLE IF NOT EXISTS family_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  accessed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type VARCHAR(100) NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- Table pour les avis de famille
CREATE TABLE IF NOT EXISTS family_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Tables Réunions Famille

```sql
-- Table pour les réunions famille
CREATE TABLE IF NOT EXISTS family_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_type VARCHAR(100),
  meeting_platform VARCHAR(100),
  meeting_link TEXT,
  attendees JSONB NOT NULL,
  agenda TEXT,
  notes TEXT,
  meeting_status VARCHAR(50) DEFAULT 'scheduled',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Tables Appels Vidéo/Audio

```sql
-- Table pour feedback des appels
CREATE TABLE IF NOT EXISTS call_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES video_calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  audio_quality INTEGER CHECK (audio_quality BETWEEN 1 AND 5),
  video_quality INTEGER CHECK (video_quality BETWEEN 1 AND 5),
  connection_quality INTEGER CHECK (connection_quality BETWEEN 1 AND 5),
  issues_reported TEXT[],
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les appels WebRTC
CREATE TABLE IF NOT EXISTS webrtc_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  callee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signaling_data JSONB,
  call_status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  call_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Tables Notifications Match

```sql
-- Table pour les notifications de match
CREATE TABLE IF NOT EXISTS match_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL,
  notification_content TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🟡 Priorité MOYENNE (Améliorations)

#### 6. Tables Gamification Avancée

```sql
-- Table pour les défis hebdomadaires
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_name VARCHAR(255) NOT NULL,
  challenge_description TEXT,
  challenge_type VARCHAR(100),
  points_reward INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Table pour la progression des défis
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_id)
);
```

#### 7. Tables Documents et Vérifications

```sql
-- Table pour vérifications de documents
CREATE TABLE IF NOT EXISTS document_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_url TEXT NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les exigences de vérification
CREATE TABLE IF NOT EXISTS verification_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_type VARCHAR(100) NOT NULL UNIQUE,
  required BOOLEAN DEFAULT false,
  description TEXT,
  validation_rules JSONB
);
```

#### 8. Tables Favoris et Tags

```sql
-- Table pour les favoris de profils
CREATE TABLE IF NOT EXISTS profile_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorited_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(100),
  UNIQUE(user_id, favorited_profile_id)
);

-- Table pour les tags de favoris
CREATE TABLE IF NOT EXISTS favorite_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

-- Table de liaison favoris-tags
CREATE TABLE IF NOT EXISTS profile_favorite_tags (
  favorite_id UUID NOT NULL REFERENCES profile_favorites(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES favorite_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (favorite_id, tag_id)
);

-- Table pour les tags de notes
CREATE TABLE IF NOT EXISTS note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

-- Table pour les tags de profils
CREATE TABLE IF NOT EXISTS profile_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 9. Tables Matching Avancé

```sql
-- Table pour les données d'optimisation de matching
CREATE TABLE IF NOT EXISTS profile_matching_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  optimization_score DECIMAL(5,2),
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculation_metadata JSONB,
  UNIQUE(profile_id)
);

-- Table pour les préférences de matching
CREATE TABLE IF NOT EXISTS matching_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age_range_min INTEGER,
  age_range_max INTEGER,
  distance_range INTEGER,
  preferences JSONB,
  UNIQUE(user_id)
);

-- Table pour l'historique de matching
CREATE TABLE IF NOT EXISTS matching_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shown_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action_taken VARCHAR(50),
  compatibility_score DECIMAL(5,2)
);
```

### 🟢 Priorité BASSE (Futures Améliorations)

#### 10. Tables Guidance Islamique

```sql
-- Table pour les ressources et guidance islamique
CREATE TABLE IF NOT EXISTS islamic_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidance_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  source VARCHAR(255),
  category VARCHAR(100),
  tags TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 11. Tables Limites de Taux

```sql
-- Table pour le suivi des limites de taux
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_type VARCHAR(100) NOT NULL,
  count INTEGER DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, limit_type)
);
```

#### 12. Tables Contact Sécurisé Famille

```sql
-- Table pour les informations de contact sécurisé famille
CREATE TABLE IF NOT EXISTS family_contact_secure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  contact_type VARCHAR(100) NOT NULL,
  contact_value TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'audit de contact famille
CREATE TABLE IF NOT EXISTS family_contact_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type VARCHAR(100) NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);
```

#### 13. Tables Opérations Sensibles

```sql
-- Table pour l'audit des opérations sensibles
CREATE TABLE IF NOT EXISTS sensitive_operations_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type VARCHAR(100) NOT NULL,
  operation_details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 MISES À JOUR DE TABLES REQUISES

### Tables Nécessitant des Colonnes Supplémentaires

#### 1. Table `profiles`

```sql
-- Ajouter des colonnes pour les fonctionnalités avancées
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coordinates GEOGRAPHY(Point, 4326);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_quality_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_verification_status VARCHAR(50) DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blur_photo BOOLEAN DEFAULT false;
```

#### 2. Table `matches`

```sql
-- Ajouter des colonnes pour l'approbation famille
ALTER TABLE matches ADD COLUMN IF NOT EXISTS family_approved BOOLEAN DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS family_approval_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS can_communicate BOOLEAN DEFAULT false;
```

#### 3. Table `family_members`

```sql
-- Ajouter des colonnes pour le système wali
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS is_wali BOOLEAN DEFAULT false;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS invitation_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS supervision_level VARCHAR(50) DEFAULT 'basic';
```

#### 4. Table `user_progression`

```sql
-- Ajouter des colonnes pour la gamification
ALTER TABLE user_progression ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE user_progression ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE user_progression ADD COLUMN IF NOT EXISTS achievements_unlocked INTEGER DEFAULT 0;
```

#### 5. Table `messages`

```sql
-- Ajouter des colonnes pour les fonctionnalités avancées
ALTER TABLE messages ADD COLUMN IF NOT EXISTS encrypted BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_message_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'sent';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) DEFAULT 'approved';
```

#### 6. Table `privacy_settings`

```sql
-- Ajouter des colonnes pour les paramètres de confidentialité avancés
ALTER TABLE privacy_settings ADD COLUMN IF NOT EXISTS incognito_mode BOOLEAN DEFAULT false;
ALTER TABLE privacy_settings ADD COLUMN IF NOT EXISTS activity_status_visible BOOLEAN DEFAULT true;
ALTER TABLE privacy_settings ADD COLUMN IF NOT EXISTS profile_reveal_level VARCHAR(50) DEFAULT 'full';
```

#### 7. Table `onboarding_analytics`

```sql
-- Ajouter des colonnes pour l'analytique détaillée
ALTER TABLE onboarding_analytics ADD COLUMN IF NOT EXISTS validation_errors JSONB DEFAULT '[]';
ALTER TABLE onboarding_analytics ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;
ALTER TABLE onboarding_analytics ADD COLUMN IF NOT EXISTS completed_steps TEXT[] DEFAULT ARRAY[]::TEXT[];
```

---

## 📝 ÉTAT DU FICHIER types.ts

### Localisation

```
/home/user/zawajconnect/src/integrations/supabase/types.ts
```

### Statut Actuel

✅ **Le fichier types.ts existe et est bien structuré**

### Contenu

Le fichier contient :

1. **Type `Database`** : Interface TypeScript complète pour Supabase
2. **Tables définies** : 49+ tables avec leurs types Row, Insert, Update
3. **Fonctions RPC** : Définitions de toutes les fonctions Supabase
4. **Enums** : Types énumérés pour les différents champs

### Tables Manquantes dans types.ts

Les tables suivantes sont référencées dans le code mais **manquent dans types.ts** :

1. `wali_registrations`
2. `wali_filters`
3. `wali_delegations`
4. `wali_suspensions`
5. `wali_email_history`
6. `wali_onboarding_progress`
7. `supervision_logs`
8. `family_supervision_rules`
9. `family_access_audit`
10. `family_reviews`
11. `family_meetings`
12. `call_feedback`
13. `webrtc_calls`
14. `match_notifications`
15. `weekly_challenges`
16. `user_challenge_progress`
17. `document_verifications`
18. `verification_requirements`
19. `profile_favorites`
20. `favorite_tags`
21. `profile_favorite_tags`
22. `note_tags`
23. `profile_tags`
24. `profile_matching_data`
25. `matching_preferences`
26. `matching_history`
27. `islamic_guidance`
28. `rate_limits`
29. `family_contact_secure`
30. `family_contact_audit_log`
31. `sensitive_operations_audit`

### Action Requise

Une fois les migrations créées, **mettre à jour types.ts** via :

```bash
npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
```

---

## 🎯 RECOMMANDATIONS DE MIGRATION

### Ordre de Priorité des Migrations

#### Phase 1 : Core Wali/Famille (Priorité CRITIQUE)

```sql
-- Migration 1: Tables Wali de base
-- Créer : wali_registrations, wali_filters, wali_delegations, wali_suspensions

-- Migration 2: Tables Supervision
-- Créer : supervision_logs, family_supervision_rules, family_access_audit, family_reviews

-- Migration 3: Tables Réunions & Communication
-- Créer : family_meetings, match_notifications
```

#### Phase 2 : Appels & Communication (Priorité HAUTE)

```sql
-- Migration 4: Tables Appels Vidéo/Audio
-- Créer : call_feedback, webrtc_calls
```

#### Phase 3 : Gamification & Engagement (Priorité MOYENNE)

```sql
-- Migration 5: Tables Gamification Avancée
-- Créer : weekly_challenges, user_challenge_progress

-- Migration 6: Tables Favoris & Tags
-- Créer : profile_favorites, favorite_tags, profile_favorite_tags, note_tags, profile_tags
```

#### Phase 4 : Matching & Vérification (Priorité MOYENNE)

```sql
-- Migration 7: Tables Matching Avancé
-- Créer : profile_matching_data, matching_preferences, matching_history

-- Migration 8: Tables Vérification
-- Créer : document_verifications, verification_requirements
```

#### Phase 5 : Améliorations Futures (Priorité BASSE)

```sql
-- Migration 9: Tables Diverses
-- Créer : islamic_guidance, rate_limits, family_contact_secure, etc.
```

### Mises à Jour de Tables Existantes

```sql
-- Migration 10: Mises à jour des tables existantes
-- Modifier : profiles, matches, family_members, user_progression, messages, privacy_settings, onboarding_analytics
```

### Indexes et Performance

```sql
-- Migration 11: Indexes de Performance
CREATE INDEX idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_matches_compatibility ON matches(compatibility_score DESC);
CREATE INDEX idx_family_members_wali ON family_members(is_wali, user_id);
CREATE INDEX idx_supervision_logs_wali ON supervision_logs(wali_id, timestamp DESC);
CREATE INDEX idx_profiles_location ON profiles USING GIST(coordinates);
```

### Politiques RLS (Row Level Security)

```sql
-- Migration 12: Politiques RLS
-- Ajouter RLS pour toutes les nouvelles tables
-- Exemples :
-- - wali_registrations : Accessible uniquement par l'utilisateur propriétaire
-- - supervision_logs : Accessible par le wali et l'admin
-- - call_feedback : Accessible uniquement par les participants à l'appel
```

---

## 📊 STATISTIQUES FINALES

### Tables par Catégorie

| Catégorie            | Existantes | À Créer | Mises à Jour | Total  |
| -------------------- | ---------- | ------- | ------------ | ------ |
| **Authentification** | 6          | 0       | 1            | 7      |
| **Profils**          | 8          | 5       | 2            | 15     |
| **Matching**         | 5          | 3       | 1            | 9      |
| **Messagerie**       | 3          | 0       | 1            | 4      |
| **Wali/Famille**     | 3          | 12      | 1            | 16     |
| **Gamification**     | 5          | 2       | 1            | 8      |
| **Paiement**         | 3          | 0       | 0            | 3      |
| **Modération**       | 4          | 1       | 0            | 5      |
| **Analytics**        | 4          | 0       | 1            | 5      |
| **Appels**           | 1          | 2       | 0            | 3      |
| **Notifications**    | 3          | 1       | 0            | 4      |
| **Sécurité**         | 4          | 3       | 1            | 8      |
| **Divers**           | 0          | 2       | 0            | 2      |
| **TOTAL**            | **49**     | **31**  | **9**        | **89** |

### Effort Estimé

- **Nouvelles tables à créer** : 31 tables
- **Tables à modifier** : 9 tables
- **Migrations nécessaires** : ~12 migrations
- **Effort total estimé** : 3-5 jours

### Impact par Fonctionnalité

| Fonctionnalité           | Impact    | Nouvelles Tables | Mises à Jour |
| ------------------------ | --------- | ---------------- | ------------ |
| **Système Wali**         | 🔴 Élevé  | 6                | 1            |
| **Supervision Famille**  | 🔴 Élevé  | 4                | 0            |
| **Appels Vidéo/Audio**   | 🟡 Moyen  | 2                | 0            |
| **Gamification Avancée** | 🟡 Moyen  | 2                | 1            |
| **Favoris & Tags**       | 🟡 Moyen  | 5                | 0            |
| **Matching Avancé**      | 🟡 Moyen  | 3                | 1            |
| **Vérifications**        | 🟢 Faible | 2                | 0            |
| **Guidance Islamique**   | 🟢 Faible | 1                | 0            |
| **Autres**               | 🟢 Faible | 6                | 6            |

---

## ✅ CHECKLIST DE MIGRATION

### Avant Migration

- [ ] Backup complet de la base de données
- [ ] Test des migrations en environnement de développement
- [ ] Validation des schémas avec l'équipe
- [ ] Documentation des nouvelles tables
- [ ] Planification de la fenêtre de maintenance

### Pendant Migration

- [ ] Exécution des migrations dans l'ordre de priorité
- [ ] Vérification de l'intégrité des données
- [ ] Création des indexes de performance
- [ ] Configuration des politiques RLS
- [ ] Tests de régression

### Après Migration

- [ ] Mise à jour de `types.ts` via Supabase CLI
- [ ] Mise à jour de la documentation
- [ ] Tests end-to-end de toutes les fonctionnalités
- [ ] Monitoring de la performance
- [ ] Communication aux utilisateurs si nécessaire

---

## 📞 SUPPORT

Pour toute question concernant cette analyse :

1. Consulter la documentation Supabase : https://supabase.com/docs
2. Vérifier les migrations existantes dans `/supabase/migrations/`
3. Contacter l'équipe de développement

---

**Document généré le :** 2025-11-13
**Version :** 1.0
**Auteur :** Analyse automatique ZawajConnect
