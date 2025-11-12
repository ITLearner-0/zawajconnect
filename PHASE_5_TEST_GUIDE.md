# 🧪 GUIDE DE TEST - PHASE 5

## Système Complet d'Analytics et Gamification

---

## 📋 Vue d'ensemble du test

Ce guide vous permet de tester **tous les aspects** du système Phase 5 :

- ✅ Création de compte et authentification
- ✅ Test de compatibilité complet
- ✅ Tracking analytics en temps réel
- ✅ Déblocage d'achievements
- ✅ Export PDF
- ✅ Partage d'insights
- ✅ Vérification des données Supabase

**Durée estimée du test:** 15-20 minutes

---

## 🎯 Prérequis

### 1. Application lancée

```bash
npm run dev
```

### 2. Supabase Dashboard ouvert

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner le projet: `dgfctwtivkqcfhwqgkya`
3. Ouvrir l'onglet **Table Editor**

### 3. Fenêtres à préparer

- **Fenêtre 1:** Application (localhost:8080)
- **Fenêtre 2:** Supabase Dashboard (Table Editor)
- **Fenêtre 3:** Browser DevTools Console (pour logs)

---

## 📝 PARTIE 1: Création de compte

### Étape 1.1: Accéder à la page d'authentification

1. Ouvrir l'application : `http://localhost:8080`
2. Cliquer sur **"Se connecter"** ou naviguer vers `/auth`
3. Vérifier que la page d'authentification s'affiche correctement

### Étape 1.2: Créer un nouveau compte

1. Onglet **"Inscription"**
2. Remplir le formulaire :
   ```
   Nom complet: Test User Phase 5
   Email: test-phase5@example.com
   Mot de passe: TestPhase5!2025
   Confirmer mot de passe: TestPhase5!2025
   ```
3. ✅ Cocher "J'ai 18 ans ou plus"
4. ✅ Cocher "J'accepte les conditions d'utilisation"
5. Cliquer sur **"S'inscrire"**

### Étape 1.3: Vérification de l'email (DEV MODE)

⚠️ **Important:** En mode développement, Supabase peut être configuré pour ne pas requérir de vérification d'email.

**Si redirection automatique:** Passez à l'Étape 1.4  
**Si message "Vérifiez votre email":**

1. Aller dans Supabase Dashboard → Authentication → Users
2. Trouver l'utilisateur `test-phase5@example.com`
3. Cliquer sur les 3 points → "Verify email"

### Étape 1.4: Vérifier la connexion

✅ **Checklist:**

- [ ] Redirection automatique vers le dashboard
- [ ] Nom d'utilisateur affiché dans le header
- [ ] Menu utilisateur accessible
- [ ] Pas d'erreur dans la console

---

## 🧪 PARTIE 2: Test de compatibilité

### Étape 2.1: Accéder au test

1. Dans le menu ou naviguer vers `/compatibility-test`
2. Vérifier que le questionnaire se charge
3. Lire l'introduction

### Étape 2.2: Répondre au questionnaire

**⚠️ IMPORTANT:** Répondez sincèrement et complètement pour obtenir des insights riches.

**Catégories à compléter:**

#### 🕌 Pratique religieuse (5-7 questions)

Exemples de réponses pour débloquer achievements:

- Fréquence de prière: "5 fois par jour"
- Lecture du Coran: "Quotidienne"
- Madhab: "Maliki" (ou autre)

#### 💑 Vision du mariage (5-7 questions)

Exemples:

- Rôle dans la famille: "Partenaires égaux avec responsabilités complémentaires"
- Gestion financière: "Compte commun avec contributions proportionnelles"

#### 🏠 Style de vie (5-7 questions)

Exemples:

- Type de logement: "Appartement en ville"
- Vie sociale: "Équilibrée entre famille et amis"

#### 👨‍👩‍👧 Famille (5-7 questions)

Exemples:

- Implication des parents: "Consultation sur décisions importantes"
- Nombre d'enfants souhaités: "2-3 enfants"

#### 🎓 Éducation & Carrière (4-6 questions)

Exemples:

- Importance de l'éducation: "Très importante"
- Carrière après mariage: "Je souhaite continuer à travailler"

**Temps estimé:** 10-15 minutes

### Étape 2.3: Soumettre le test

1. Compléter **TOUTES** les questions
2. Cliquer sur **"Soumettre mes réponses"**
3. Attendre le traitement (1-3 secondes)
4. ✅ **Vérifier:** Redirection automatique vers `/compatibility-insights`

---

## 📊 PARTIE 3: Vérifier les Insights

### Étape 3.1: Page Insights

✅ **Checklist de la page:**

- [ ] Titre: "Vos Insights de Compatibilité"
- [ ] Onglets: "Insights Détaillés" et "Progression & Récompenses"
- [ ] Carte de résumé de personnalité
- [ ] Graphique de compatibilité (radar chart ou barres)
- [ ] Sections: Priorités, Style relationnel, Partenaire idéal, Suggestions

### Étape 3.2: Onglet "Progression & Récompenses"

1. Cliquer sur l'onglet **"Progression & Récompenses"**
2. Vérifier les éléments suivants:

#### 🏆 Niveau et Points

- [ ] Affichage du niveau actuel (niveau 1 au début)
- [ ] Total de points affichés
- [ ] Barre de progression vers le niveau suivant

#### 🎖️ Achievements débloqués

✅ **Achievement automatique:**

- **"Premier Test"** devrait être débloqué ✅
  - Titre: "Premier Pas"
  - Description: "Test de compatibilité complété"
  - Rareté: Common
  - Récompense: +50 points

✅ **Achievements potentiels (selon vos réponses):**

- **"Perfect Match"** si score ≥ 90 dans un domaine
  - Récompense: +200 points
- **"Insight Master"** si tous les domaines analysés
  - Récompense: +150 points

### Étape 3.3: Analytics automatiques

**🔍 En coulisses (vérifier plus tard dans Supabase):**

- ✅ Vue d'insights automatiquement trackée
- ✅ Action "complete_test" enregistrée
- ✅ Action "view_insights" enregistrée

---

## 🎮 PARTIE 4: Tester les Actions

### Étape 4.1: Partage d'Insights

1. Descendre jusqu'à **"Actions Rapides"**
2. Cliquer sur **"Partager mes insights"** 🔗

**Scénario A - Web Share API disponible:**

- Popup de partage natif s'ouvre
- Choisir une app ou annuler
- Toast: "Insights partagés avec succès !"

**Scénario B - Fallback clipboard:**

- Lien copié dans le presse-papier
- Toast: "Lien copié dans le presse-papier !"

✅ **Vérification:**

- [ ] Action trackée en DB (vérifier plus tard)
- [ ] Compteur `share_count` incrémenté

### Étape 4.2: Export PDF

1. Cliquer sur **"Exporter en PDF"** 📥
2. Attendre génération (1-2 secondes)
3. Fichier `mes-insights-compatibilite.pdf` téléchargé

**Vérifier le contenu du PDF:**

- [ ] Titre: "Mes Insights de Compatibilité"
- [ ] Date de génération
- [ ] Score de progression (%)
- [ ] Barre de progression visuelle
- [ ] Section "Prochaines Étapes Recommandées"
- [ ] Recommandations personnalisées (3-5 items)
- [ ] Section "Actions Disponibles"
- [ ] Footer avec branding

✅ **Vérification:**

- [ ] Toast: "PDF téléchargé avec succès !"
- [ ] Compteur `export_count` incrémenté en DB

### Étape 4.3: Actions de Navigation

**Tester chaque action:**

1. **"Améliorer mon profil"**
   - Cliquer → Redirection vers `/profile`
   - Action `improve_profile` trackée

2. **"Découvrir des profils"**
   - Cliquer → Redirection vers `/browse`
   - Action `browse_profiles` trackée

3. **"Guidance islamique"**
   - Cliquer → Redirection vers `/guidance`
   - Action `read_guidance` trackée

4. **"Refaire le test"**
   - Cliquer → Redirection vers `/compatibility-test`
   - Action `retake_test` trackée

---

## 🗄️ PARTIE 5: Vérification Supabase

### Étape 5.1: Table `insights_analytics`

**Accès:** Supabase Dashboard → Table Editor → `insights_analytics`

**Requête SQL:**

```sql
SELECT
  id,
  user_id,
  view_count,
  share_count,
  export_count,
  last_viewed_at,
  created_at,
  updated_at
FROM insights_analytics
ORDER BY created_at DESC
LIMIT 5;
```

✅ **Vérifier:**

- [ ] Une ligne pour votre `user_id`
- [ ] `view_count` ≥ 1 (au moins une vue)
- [ ] `share_count` ≥ 1 (si vous avez partagé)
- [ ] `export_count` ≥ 1 (si vous avez exporté)
- [ ] `last_viewed_at` correspond à l'heure de votre visite

### Étape 5.2: Table `insight_actions`

**Requête SQL:**

```sql
SELECT
  id,
  user_id,
  action_type,
  metadata,
  created_at
FROM insight_actions
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 20;
```

✅ **Actions attendues (minimum):**

- [ ] `complete_test` - Complétion du test
- [ ] `view_insights` - Vue des insights (peut être multiple)
- [ ] `share_insights` - Partage (si testé)
- [ ] `export_pdf` - Export PDF (si testé)
- [ ] Actions de navigation (`improve_profile`, `browse_profiles`, etc.)

**Vérifier les timestamps:**

- Toutes les actions devraient être récentes (dernière heure)
- Les actions doivent être dans l'ordre chronologique

### Étape 5.3: Table `achievement_unlocks`

**Requête SQL:**

```sql
SELECT
  id,
  user_id,
  achievement_id,
  achievement_title,
  rarity,
  points_awarded,
  unlocked_at
FROM achievement_unlocks
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY unlocked_at DESC;
```

✅ **Achievement minimum garanti:**

- [ ] `first_test` - Premier Test
  - `achievement_title`: contient "Premier" ou "First"
  - `rarity`: 'common'
  - `points_awarded`: 50
  - `unlocked_at`: timestamp récent

✅ **Achievements possibles:**

- [ ] `perfect_match` (si score ≥ 90)
  - `points_awarded`: 200
  - `rarity`: 'epic'

- [ ] `insight_master` (si tous domaines)
  - `points_awarded`: 150
  - `rarity`: 'rare'

### Étape 5.4: Table `user_progression`

**Requête SQL:**

```sql
SELECT
  id,
  user_id,
  current_level,
  total_points,
  achievements_count,
  insights_viewed_count,
  last_level_up_at,
  created_at,
  updated_at
FROM user_progression
WHERE user_id = 'YOUR_USER_ID_HERE';
```

✅ **Vérifier les valeurs:**

- [ ] `current_level`: 1 (au début)
- [ ] `total_points`: Somme des points des achievements (minimum 50)
- [ ] `achievements_count`: Nombre d'achievements débloqués (minimum 1)
- [ ] `insights_viewed_count`: ≥ 1
- [ ] `updated_at`: Timestamp récent

### Étape 5.5: Vérifier l'intégrité des données

**Requête de vérification croisée:**

```sql
-- Vérifier que tous les compteurs sont cohérents
SELECT
  u.email,
  ia.view_count,
  ia.share_count,
  ia.export_count,
  up.achievements_count,
  up.total_points,
  COUNT(DISTINCT au.id) as actual_achievements,
  SUM(au.points_awarded) as actual_points
FROM auth.users u
LEFT JOIN insights_analytics ia ON ia.user_id = u.id
LEFT JOIN user_progression up ON up.user_id = u.id
LEFT JOIN achievement_unlocks au ON au.user_id = u.id
WHERE u.email = 'test-phase5@example.com'
GROUP BY u.email, ia.view_count, ia.share_count, ia.export_count,
         up.achievements_count, up.total_points;
```

✅ **Cohérence attendue:**

- `up.achievements_count` = `actual_achievements`
- `up.total_points` = `actual_points`
- Pas de valeurs NULL inattendues

---

## 🔄 PARTIE 6: Test des Recommandations Dynamiques

### Étape 6.1: Vérifier les recommandations initiales

1. Retourner à `/compatibility-insights`
2. Descendre jusqu'à **"Prochaines Étapes"**
3. Noter les recommandations affichées

**Recommandations attendues (scénario initial):**

- ✅ "Partagez vos insights avec votre famille..." (si `share_count = 0`)
- ✅ "Exportez vos insights en PDF..." (si `export_count = 0`)
- ✅ "Explorez davantage vos insights..." (si engagement = 'low')

### Étape 6.2: Effectuer des actions

1. **Partager** les insights (si pas encore fait)
2. **Exporter** le PDF (si pas encore fait)
3. **Rafraîchir la page** (F5)

### Étape 6.3: Vérifier les recommandations mises à jour

**Attendu:** Les recommandations devraient changer !

**Si vous avez partagé ET exporté:**

- ❌ Recommandations de partage/export disparues
- ✅ Nouvelles recommandations apparues:
  - "Découvrez des profils compatibles..."
  - "Revisitez vos insights régulièrement..."

**Calcul du niveau d'engagement:**

- **Low**: < 5 actions totales
- **Medium**: 5-9 actions totales
- **High**: ≥ 10 actions totales

---

## 🧩 PARTIE 7: Test du Déblocage Progressif

### Étape 7.1: Achievement "Insights Explorer"

**Objectif:** Débloquer en visitant les insights 5 fois

**Actions:**

1. Visiter `/compatibility-insights` (compteur = 1)
2. Naviguer ailleurs (ex: `/dashboard`)
3. Revenir à `/compatibility-insights` (compteur = 2)
4. Répéter 3 fois de plus
5. Au 5ème retour → Achievement débloqué ! 🎉

✅ **Vérifications:**

- [ ] Toast de déblocage affiché
- [ ] Points ajoutés (+100 points)
- [ ] Badge "Insights Explorer" visible dans l'interface
- [ ] Entrée dans `achievement_unlocks`

**Requête de vérification:**

```sql
SELECT achievement_id, unlocked_at, points_awarded
FROM achievement_unlocks
WHERE user_id = 'YOUR_USER_ID'
  AND achievement_id = 'insights_explorer';
```

### Étape 7.2: Vérifier la progression de niveau

**Si vous avez débloqué plusieurs achievements:**

**Calcul des points:**

- `first_test`: +50
- `insights_explorer`: +100
- `perfect_match` (si applicable): +200
- **Total**: 150-350+ points

**Niveaux:**

- Niveau 1: 0-249 points
- Niveau 2: 250-499 points
- Niveau 3: 500-999 points

✅ **Vérifier:**

- [ ] Barre de progression mise à jour
- [ ] Niveau affiché correctement
- [ ] Animation de montée de niveau (si changement)

---

## 📱 PARTIE 8: Test Multi-Sessions

### Étape 8.1: Déconnexion

1. Menu utilisateur → **"Se déconnecter"**
2. Vérification de la déconnexion
3. Redirection vers page d'accueil

### Étape 8.2: Reconnexion

1. Se reconnecter avec `test-phase5@example.com`
2. Naviguer vers `/compatibility-insights`

✅ **Persistance des données:**

- [ ] Achievements toujours présents
- [ ] Points toujours affichés
- [ ] Niveau conservé
- [ ] Compteurs d'analytics persistés
- [ ] Insights toujours accessibles

### Étape 8.3: Vérifier l'incrémentation

**Nouvelle visite = nouveau tracking:**

- `view_count` devrait être incrémenté (+1)
- Nouvelle entrée dans `insight_actions` avec `action_type = 'view_insights'`

**Requête:**

```sql
SELECT view_count, last_viewed_at
FROM insights_analytics
WHERE user_id = 'YOUR_USER_ID';
```

---

## 🐛 PARTIE 9: Tests d'Erreurs et Edge Cases

### Étape 9.1: Test avec utilisateur sans test complété

1. Créer un **nouveau compte** : `test-phase5-empty@example.com`
2. Se connecter
3. Aller directement à `/compatibility-insights`

✅ **Comportement attendu:**

- [ ] Message: "Complétez d'abord le test de compatibilité"
- [ ] Bouton pour démarrer le test
- [ ] Pas d'erreur de chargement
- [ ] Pas d'achievements affichés

### Étape 9.2: Test de l'export PDF sans insights

**Avec le compte vide:**

1. Essayer d'exporter le PDF

✅ **Comportement attendu:**

- [ ] PDF généré quand même (avec données par défaut)
- [ ] Message d'avertissement ou PDF minimal
- [ ] Pas de crash de l'application

### Étape 9.3: Test de partage avec erreur réseau

1. Ouvrir DevTools → Network tab
2. Activer "Offline" mode
3. Essayer de partager

✅ **Comportement attendu:**

- [ ] Message d'erreur approprié
- [ ] Pas de crash
- [ ] Fallback graceful (ex: copy link toujours fonctionne)

---

## ✅ CHECKLIST FINALE

### Infrastructure ✅

- [ ] 4 tables Supabase créées et accessibles
- [ ] RLS policies fonctionnelles
- [ ] Indexes présents et performants
- [ ] Fonction RPC `increment_insight_views` fonctionne

### Tracking Analytics ✅

- [ ] Vues trackées automatiquement
- [ ] Actions enregistrées dans `insight_actions`
- [ ] Compteurs incrémentés correctement
- [ ] Timestamps cohérents

### Achievements ✅

- [ ] "Premier Test" débloqué automatiquement
- [ ] Autres achievements débloqués selon conditions
- [ ] Points attribués correctement
- [ ] Toast notifications affichés
- [ ] Persistence en base de données

### Export & Partage ✅

- [ ] PDF généré avec contenu réel
- [ ] Recommandations dynamiques dans le PDF
- [ ] Web Share API fonctionne (ou fallback)
- [ ] Actions trackées dans la DB

### UX & Performance ✅

- [ ] Pas d'erreurs dans la console
- [ ] Chargement rapide (< 1s)
- [ ] Animations fluides
- [ ] Responsive sur mobile
- [ ] Recommandations pertinentes et dynamiques

---

## 🔍 Requêtes SQL Utiles

### Vue d'ensemble d'un utilisateur

```sql
-- Stats complètes d'un utilisateur
SELECT
  u.email,
  p.full_name,
  ia.view_count,
  ia.share_count,
  ia.export_count,
  up.current_level,
  up.total_points,
  up.achievements_count,
  COUNT(DISTINCT au.id) as achievements_unlocked,
  STRING_AGG(au.achievement_title, ', ') as achievement_titles
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN insights_analytics ia ON ia.user_id = u.id
LEFT JOIN user_progression up ON up.user_id = u.id
LEFT JOIN achievement_unlocks au ON au.user_id = u.id
WHERE u.email LIKE '%test-phase5%'
GROUP BY u.email, p.full_name, ia.view_count, ia.share_count,
         ia.export_count, up.current_level, up.total_points,
         up.achievements_count;
```

### Timeline des actions

```sql
-- Historique chronologique
SELECT
  TO_CHAR(created_at, 'HH24:MI:SS') as time,
  action_type,
  metadata
FROM insight_actions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at ASC;
```

### Leaderboard (pour tests futurs)

```sql
-- Top utilisateurs par points
SELECT
  p.full_name,
  up.total_points,
  up.current_level,
  up.achievements_count
FROM user_progression up
JOIN profiles p ON p.user_id = up.user_id
ORDER BY up.total_points DESC
LIMIT 10;
```

---

## 🎉 Résultats Attendus

### Après test complet, vous devriez avoir:

**Dans Supabase:**

- ✅ 1 entrée dans `insights_analytics`
- ✅ 5-15 entrées dans `insight_actions`
- ✅ 1-4 entrées dans `achievement_unlocks`
- ✅ 1 entrée dans `user_progression`

**Dans l'interface:**

- ✅ Badges d'achievements visibles
- ✅ Score de progression affiché
- ✅ Niveau utilisateur correct
- ✅ Recommandations dynamiques pertinentes
- ✅ PDF téléchargé avec contenu réel

**Performance:**

- ✅ Chargement insights < 1s
- ✅ Génération PDF < 2s
- ✅ Tracking actions < 100ms
- ✅ Pas d'erreurs console

---

## 🐞 Troubleshooting

### Problème: Achievements non débloqués

**Solution:**

1. Vérifier les logs console pour erreurs
2. Requête SQL pour vérifier les conditions:

```sql
SELECT * FROM compatibility_responses
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

3. Vérifier que `useCompatibilityInsights` retourne des données

### Problème: PDF vide ou erreur

**Solution:**

1. Vérifier que jsPDF est installé: `npm list jspdf`
2. Vérifier les logs console
3. Tester avec un PDF minimal

### Problème: Analytics non trackées

**Solution:**

1. Vérifier RLS policies dans Supabase
2. Tester la fonction RPC manuellement:

```sql
SELECT increment_insight_views('YOUR_USER_ID');
```

3. Vérifier les erreurs dans le hook `useInsightsAnalytics`

### Problème: Recommandations ne changent pas

**Solution:**

1. Forcer un refresh: `analytics.refresh()`
2. Vérifier que les compteurs sont bien incrémentés en DB
3. Clear cache et recharger

---

## 📊 Rapport de Test (Template)

```markdown
# Rapport de Test Phase 5

Date: ****\_\_****
Testeur: ****\_\_****

## Résumé

- [ ] Tous les tests passés ✅
- [ ] Problèmes mineurs trouvés ⚠️
- [ ] Problèmes majeurs trouvés ❌

## Détails

### Authentification

- Compte créé: ✅ / ❌
- Connexion: ✅ / ❌

### Test de Compatibilité

- Test complété: ✅ / ❌
- Insights générés: ✅ / ❌

### Achievements

- first_test débloqué: ✅ / ❌
- Points attribués: **\_** points
- Niveau atteint: **\_**

### Analytics

- Vues trackées: ✅ / ❌
- Actions enregistrées: **\_** actions
- Export PDF: ✅ / ❌
- Partage: ✅ / ❌

### Base de données

- insights_analytics: ✅ / ❌
- insight_actions: ✅ / ❌
- achievement_unlocks: ✅ / ❌
- user_progression: ✅ / ❌

## Bugs trouvés

1. ***
2. ***

## Suggestions d'amélioration

1. ***
2. ***
```

---

## 🎯 Conclusion

Si tous les tests passent, **la Phase 5 est un succès complet** ! 🎉

Vous avez maintenant :

- ✅ Un système d'analytics production-ready
- ✅ Une gamification engageante et persistée
- ✅ Un export PDF fonctionnel
- ✅ Des recommandations dynamiques intelligentes
- ✅ Une infrastructure Supabase robuste

**Prochaine étape:** Phase 6 - Dashboard Analytics & Advanced Features

---

_Guide de test généré - Phase 5 - 6 janvier 2025_
