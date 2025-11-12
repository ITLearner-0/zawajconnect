# Test Users Seed Script - Documentation

## Vue d'ensemble

Script de seed automatique qui génère 3 utilisateurs de test avec des achievements pré-débloqués pour faciliter les tests du système Phase 5.

## 📁 Fichiers créés

1. **`supabase/seeds/test_users_with_achievements.sql`**
   - Script SQL de seed complet
   - Crée 3 profils utilisateurs avec données complètes
   - Insère achievements, analytics, et actions déjà configurés

2. **`scripts/seed-test-users.sh`**
   - Script bash pour exécuter le seed facilement
   - Vérifie la configuration Supabase
   - Affiche les résultats de manière lisible

## 🚀 Utilisation

### Méthode 1 : Via le script bash (recommandé)

```bash
# Rendre le script exécutable
chmod +x scripts/seed-test-users.sh

# Exécuter le seed
./scripts/seed-test-users.sh
```

### Méthode 2 : Directement avec Supabase CLI

```bash
# S'assurer d'être lié au projet
supabase link --project-ref YOUR_PROJECT_REF

# Exécuter le seed
supabase db remote exec < supabase/seeds/test_users_with_achievements.sql
```

### Méthode 3 : Via Supabase Dashboard

1. Aller dans **Database → SQL Editor**
2. Copier le contenu de `test_users_with_achievements.sql`
3. Exécuter le script

## 👥 Utilisateurs créés

### 1. Test User Beginner (Débutant)

**Email:** `test-phase5-beginner@zawajconnect.com`  
**UUID:** `11111111-1111-1111-1111-111111111111`

**Profil:**

- Nom: Ahmed Test Beginner
- Genre: Male
- Pays: France, Paris
- Profession: Software Engineer
- Premium: Non

**Progression:**

- **Niveau:** 1
- **Points:** 100
- **Achievements:** 1 (Premier Test)
- **Vues insights:** 5

**Use Case:** Tester l'expérience d'un nouvel utilisateur qui vient de compléter son premier test de compatibilité.

---

### 2. Test User Intermediate (Intermédiaire)

**Email:** `test-phase5-intermediate@zawajconnect.com`  
**UUID:** `22222222-2222-2222-2222-222222222222`

**Profil:**

- Nom: Fatima Test Intermediate
- Genre: Female
- Pays: France, Lyon
- Profession: Teacher
- Premium: Oui

**Progression:**

- **Niveau:** 2
- **Points:** 350
- **Achievements:** 3
  - Premier Test (100 pts)
  - Ambassadeur (100 pts)
  - Archiviste (150 pts)
- **Vues insights:** 15
- **Partages:** 2
- **Exports:** 1

**Use Case:** Tester un utilisateur actif qui engage avec les insights et débloques plusieurs achievements.

---

### 3. Test User Advanced (Avancé)

**Email:** `test-phase5-advanced@zawajconnect.com`  
**UUID:** `33333333-3333-3333-3333-333333333333`

**Profil:**

- Nom: Youssef Test Advanced
- Genre: Male
- Pays: Maroc, Casablanca
- Profession: Business Consultant
- Premium: Oui

**Progression:**

- **Niveau:** 3
- **Points:** 950
- **Achievements:** 6 (Tous les achievements disponibles)
  - Premier Test (100 pts)
  - Observateur Assidu (100 pts)
  - Ambassadeur (100 pts)
  - Archiviste (150 pts)
  - Champion de l'Engagement (200 pts)
  - Maître de Compatibilité (300 pts)
- **Vues insights:** 35
- **Partages:** 6
- **Exports:** 4
- **30 actions** enregistrées

**Use Case:** Tester un power user avec tous les achievements débloqués, utile pour tester l'UI avec un profil complet.

## 📊 Données insérées par utilisateur

Pour chaque utilisateur, le script insère:

1. **Profile** (`profiles` table)
   - Informations personnelles complètes
   - Bio, interests, education, profession
   - Status marital et préférences enfants

2. **Islamic Preferences** (`islamic_preferences` table)
   - Secte, madhab
   - Fréquence de prière, lecture Coran
   - Préférences hijab/barbe
   - Importance religion

3. **User Settings** (`user_settings` table)
   - Langue (fr)
   - Notifications email et push activées

4. **Insights Analytics** (`insights_analytics` table)
   - Compteurs de vues, partages, exports
   - Timestamp dernière vue

5. **User Progression** (`user_progression` table)
   - Points totaux
   - Niveau actuel
   - Nombre d'achievements débloqués
   - Insights vus

6. **Achievement Unlocks** (`achievement_unlocks` table)
   - Achievements déjà débloqués avec dates
   - Points attribués
   - Rareté

7. **Insight Actions** (`insight_actions` table)
   - Historique des actions (view, share, export)
   - Metadata avec timestamps

## 🔍 Vérification des données

### Requête 1: Vue d'ensemble des utilisateurs

```sql
SELECT
  p.email,
  p.full_name,
  up.total_points,
  up.current_level,
  up.achievements_count,
  ia.view_count,
  ia.share_count,
  ia.export_count
FROM profiles p
LEFT JOIN user_progression up ON up.user_id = p.id
LEFT JOIN insights_analytics ia ON ia.user_id = p.id
WHERE p.email LIKE 'test-phase5-%@zawajconnect.com'
ORDER BY up.total_points DESC;
```

### Requête 2: Détail des achievements

```sql
SELECT
  p.email,
  au.achievement_title,
  au.points_awarded,
  au.rarity,
  au.unlocked_at
FROM achievement_unlocks au
JOIN profiles p ON p.id = au.user_id
WHERE p.email LIKE 'test-phase5-%@zawajconnect.com'
ORDER BY p.email, au.unlocked_at;
```

### Requête 3: Historique des actions

```sql
SELECT
  p.email,
  ia.action_type,
  ia.created_at,
  ia.metadata
FROM insight_actions ia
JOIN profiles p ON p.id = ia.user_id
WHERE p.email LIKE 'test-phase5-%@zawajconnect.com'
ORDER BY ia.created_at DESC
LIMIT 20;
```

### Requête 4: Statistiques globales

```sql
SELECT
  COUNT(DISTINCT p.id) as total_users,
  SUM(up.total_points) as total_points,
  SUM(up.achievements_count) as total_achievements,
  SUM(ia.view_count) as total_views,
  SUM(ia.share_count) as total_shares,
  SUM(ia.export_count) as total_exports
FROM profiles p
LEFT JOIN user_progression up ON up.user_id = p.id
LEFT JOIN insights_analytics ia ON ia.user_id = p.id
WHERE p.email LIKE 'test-phase5-%@zawajconnect.com';
```

## 🧹 Nettoyage

Le script inclut automatiquement un nettoyage au début pour éviter les duplications. Si vous voulez nettoyer manuellement:

```sql
-- Supprimer tous les utilisateurs de test Phase 5
DELETE FROM achievement_unlocks WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM insight_actions WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM insights_analytics WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM user_progression WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM islamic_preferences WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM user_settings WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com';
```

## 🧪 Scénarios de test

### Scénario 1: Test du système d'achievements

1. Utiliser l'UUID du beginner user
2. Simuler des actions (vues, partages, exports)
3. Vérifier les déblocages dans `achievement_unlocks`

### Scénario 2: Test de la progression

1. Utiliser l'UUID de l'intermediate user
2. Ajouter des actions supplémentaires
3. Vérifier l'update de `user_progression`

### Scénario 3: Test des analytics

1. Utiliser l'UUID de l'advanced user
2. Requêter `insights_analytics`
3. Vérifier les compteurs et timestamps

### Scénario 4: Test de l'UI complète

1. Charger le composant `GamifiedInsights` avec un UUID de test
2. Vérifier l'affichage des achievements déjà débloqués
3. Tester l'export PDF avec des données réelles

## 🔐 Notes de sécurité

- **Ces utilisateurs n'ont pas de compte auth.users**
  - Ce sont des profils uniquement (pas de login possible)
  - Utilisez leurs UUIDs directement dans vos tests

- **Créer des comptes auth complets si besoin:**
  ```sql
  -- Exemple: créer un compte auth pour le beginner user
  INSERT INTO auth.users (
    id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at
  ) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test-phase5-beginner@zawajconnect.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(), NOW(), NOW()
  );
  ```

## 📈 Avantages

✅ **Gain de temps:** Plus besoin de créer manuellement des utilisateurs avec achievements  
✅ **Reproductibilité:** UUIDs fixes pour des tests cohérents  
✅ **Données réalistes:** Profils complets avec historique d'actions  
✅ **Tous les niveaux:** 3 profils couvrant beginner, intermediate, advanced  
✅ **Facile à nettoyer:** Pattern email reconnaissable  
✅ **Documentation intégrée:** Commentaires SQL explicites

## 🔄 Ré-exécution

Le script peut être ré-exécuté à tout moment:

- Nettoie automatiquement les données existantes
- Recrée les profils avec les mêmes UUIDs
- Réinitialise tous les compteurs

```bash
# Ré-exécuter le seed
./scripts/seed-test-users.sh
```

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifier la connexion Supabase:**

   ```bash
   supabase status
   ```

2. **Vérifier les tables:**

   ```bash
   supabase db remote exec "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
   ```

3. **Consulter les logs:**
   - Via Supabase Dashboard → Logs
   - Via CLI: `supabase db remote exec "SELECT * FROM postgres_logs LIMIT 10;"`

## 🎯 Prochaines étapes

Après avoir seedé les utilisateurs de test:

1. ✅ Exécuter `./scripts/seed-test-users.sh`
2. ✅ Vérifier les données dans Supabase Dashboard
3. ✅ Tester les composants UI avec les UUIDs de test
4. ✅ Exécuter les requêtes de vérification
5. ✅ Valider le système d'achievements end-to-end
