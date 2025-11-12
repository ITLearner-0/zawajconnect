# 🌱 Guide de Seed des Utilisateurs de Test

## 📋 Vue d'Ensemble

Ce guide explique comment créer 3 utilisateurs de test avec leurs achievements dans Supabase Dashboard.

---

## ✅ Méthode 1: Via Supabase Dashboard (RECOMMANDÉ)

### Étape 1: Accéder au SQL Editor

1. Ouvrez votre **Supabase Dashboard**
2. Naviguez vers **SQL Editor** dans la barre latérale
3. Créez une nouvelle requête

### Étape 2: Exécuter le Seed

1. Copiez le contenu du fichier: `supabase/seeds/test_users_with_achievements.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **Run** (ou Ctrl+Enter)

### Étape 3: Vérifier les Données

Après l'exécution, vérifiez dans **Table Editor**:

#### Table `profiles`

```sql
SELECT * FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com';
```

✅ Devrait afficher **3 utilisateurs**

#### Table `user_progression`

```sql
SELECT * FROM user_progression WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
```

✅ Devrait afficher **3 entrées** avec niveaux et points

#### Table `achievement_unlocks`

```sql
SELECT * FROM achievement_unlocks WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
```

✅ Devrait afficher **10 achievements** au total

#### Table `insights_analytics`

```sql
SELECT * FROM insights_analytics WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
```

✅ Devrait afficher **3 entrées** avec statistiques de vues

---

## 📊 Utilisateurs de Test Créés

### 1. 👶 Utilisateur Débutant

- **Email**: `test-phase5-beginner@zawajconnect.com`
- **Nom**: Ahmed Test Beginner
- **UUID**: `11111111-1111-1111-1111-111111111111`
- **Niveau**: 1
- **Points**: 100
- **Achievements**: 1 débloqué
  - ✅ Premier Test (100 points)
- **Vues insights**: 5
- **Cas d'usage**: Tester l'expérience utilisateur débutant

### 2. 🎯 Utilisateur Intermédiaire

- **Email**: `test-phase5-intermediate@zawajconnect.com`
- **Nom**: Fatima Test Intermediate
- **UUID**: `22222222-2222-2222-2222-222222222222`
- **Niveau**: 2
- **Points**: 350
- **Achievements**: 3 débloqués
  - ✅ Premier Test (100 points)
  - ✅ Explorateur d'Insights (100 points)
  - ✅ Profil Actif (150 points)
- **Vues insights**: 15
- **Partages**: 2
- **Cas d'usage**: Tester utilisateur actif avec plusieurs achievements

### 3. ⭐ Utilisateur Avancé

- **Email**: `test-phase5-advanced@zawajconnect.com`
- **Nom**: Omar Test Advanced
- **UUID**: `33333333-3333-3333-3333-333333333333`
- **Niveau**: 3
- **Points**: 950
- **Achievements**: 6 débloqués
  - ✅ Premier Test (100 points)
  - ✅ Explorateur d'Insights (100 points)
  - ✅ Profil Actif (150 points)
  - ✅ Partageur (150 points)
  - ✅ Exportateur de Données (200 points)
  - ✅ Champion des Insights (250 points)
- **Vues insights**: 50
- **Partages**: 10
- **Exports**: 5
- **Cas d'usage**: Tester power user avec tous les achievements

---

## 🎯 Achievements Disponibles

| Achievement            | Points | Rareté     | Condition               |
| ---------------------- | ------ | ---------- | ----------------------- |
| Premier Test           | 100    | Commune    | Visualiser des insights |
| Explorateur d'Insights | 100    | Commune    | 10+ vues d'insights     |
| Profil Actif           | 150    | Rare       | Activité régulière      |
| Partageur              | 150    | Rare       | 5+ partages             |
| Exportateur de Données | 200    | Épique     | 3+ exports              |
| Champion des Insights  | 250    | Légendaire | 30+ vues                |

---

## ✅ Méthode 2: Via Supabase CLI (Si installé)

Si vous avez le CLI Supabase installé:

```bash
# 1. Installer le CLI (si nécessaire)
npm install -g supabase

# 2. Lier votre projet
supabase link --project-ref YOUR_PROJECT_REF

# 3. Exécuter le script de seed
./scripts/seed-test-users.sh
```

---

## 🔍 Vérification dans Supabase Dashboard

### Navigation

1. **Supabase Dashboard** → https://supabase.com/dashboard
2. Sélectionnez votre projet **ZawajConnect**
3. Allez dans **Table Editor**

### Tables à Vérifier

#### 1. profiles ✅

- **Chemin**: Table Editor → profiles
- **Filtre**: `email LIKE 'test-phase5-%'`
- **Attendu**: 3 lignes

#### 2. user_progression ✅

- **Chemin**: Table Editor → user_progression
- **Attendu**: 3 lignes avec points et niveaux

#### 3. achievement_unlocks ✅

- **Chemin**: Table Editor → achievement_unlocks
- **Attendu**: 10 lignes (1 + 3 + 6)

#### 4. insights_analytics ✅

- **Chemin**: Table Editor → insights_analytics
- **Attendu**: 3 lignes avec statistiques

#### 5. islamic_preferences ✅

- **Chemin**: Table Editor → islamic_preferences
- **Attendu**: 3 lignes

---

## 📸 Captures d'Écran de Vérification

### Vue profiles

```
| id                                     | email                                  | full_name              | level |
|----------------------------------------|----------------------------------------|------------------------|-------|
| 11111111-1111-1111-1111-111111111111  | test-phase5-beginner@zawajconnect.com | Ahmed Test Beginner    |       |
| 22222222-2222-2222-2222-222222222222  | test-phase5-intermediate@...          | Fatima Test Intermediate |     |
| 33333333-3333-3333-3333-333333333333  | test-phase5-advanced@zawajconnect.com | Omar Test Advanced     |       |
```

### Vue user_progression

```
| user_id                                | total_points | current_level | achievements_count |
|----------------------------------------|--------------|---------------|--------------------|
| 11111111-1111-1111-1111-111111111111  | 100          | 1             | 1                  |
| 22222222-2222-2222-2222-222222222222  | 350          | 2             | 3                  |
| 33333333-3333-3333-3333-333333333333  | 950          | 3             | 6                  |
```

### Vue achievement_unlocks

```
| user_id                                | achievement_title        | points_awarded | rarity     |
|----------------------------------------|--------------------------|----------------|------------|
| 11111111...                           | Premier Test             | 100            | common     |
| 22222222...                           | Premier Test             | 100            | common     |
| 22222222...                           | Explorateur d'Insights   | 100            | common     |
| 22222222...                           | Profil Actif             | 150            | rare       |
| 33333333...                           | Premier Test             | 100            | common     |
| 33333333...                           | Explorateur d'Insights   | 100            | common     |
| 33333333...                           | Profil Actif             | 150            | rare       |
| 33333333...                           | Partageur                | 150            | rare       |
| 33333333...                           | Exportateur de Données   | 200            | epic       |
| 33333333...                           | Champion des Insights    | 250            | legendary  |
```

---

## 🐛 Dépannage

### Erreur: "relation does not exist"

Si vous voyez cette erreur, certaines tables n'existent pas encore.

**Solution**: Vérifiez que les migrations ont été appliquées:

```bash
supabase db pull  # Pour synchroniser le schéma
supabase migration list  # Pour voir les migrations
```

### Erreur: "duplicate key value"

Les utilisateurs existent déjà.

**Solution**: Le script nettoie automatiquement les données existantes. Si le problème persiste:

```sql
DELETE FROM achievement_unlocks WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM user_progression WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com'
);
DELETE FROM profiles WHERE email LIKE 'test-phase5-%@zawajconnect.com';
```

Puis réexécutez le seed.

### Erreur: "permission denied"

Votre utilisateur n'a pas les permissions suffisantes.

**Solution**: Exécutez le SQL via le Dashboard Supabase (qui utilise le service role).

---

## 📝 Notes Importantes

⚠️ **Ces utilisateurs n'ont PAS d'entrées auth.users**

- Ce sont des profils de test uniquement
- Utilisez leurs UUIDs directement dans vos tests
- Si vous avez besoin d'authentification complète, créez des utilisateurs via Auth

💡 **Conseils**

- Les UUIDs sont fixes pour la reproductibilité
- Les timestamps sont relatifs (NOW() - INTERVAL)
- Les données sont cohérentes entre les tables

🎯 **Cas d'Usage**

- **Débutant**: Tests d'onboarding, premiers achievements
- **Intermédiaire**: Tests de progression, multiples achievements
- **Avancé**: Tests de gamification complète, tous les achievements

---

## 📚 Ressources

- **Fichier SQL**: `supabase/seeds/test_users_with_achievements.sql`
- **Script Shell**: `scripts/seed-test-users.sh`
- **Documentation Supabase**: https://supabase.com/docs/guides/cli/seeding-your-database

---

## ✅ Checklist de Vérification

- [ ] Fichier SQL exécuté sans erreurs
- [ ] 3 profils visibles dans table `profiles`
- [ ] 3 entrées dans table `user_progression`
- [ ] 10 achievements dans table `achievement_unlocks`
- [ ] 3 entrées dans table `insights_analytics`
- [ ] 3 entrées dans table `islamic_preferences`
- [ ] Tous les UUIDs correspondent
- [ ] Points et niveaux sont corrects

**Une fois tous les points cochés, le seed est réussi! 🎉**
