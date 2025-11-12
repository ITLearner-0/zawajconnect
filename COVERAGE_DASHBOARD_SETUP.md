# 📊 Configuration du Coverage Dashboard

Ce guide explique comment configurer le dashboard de couverture de tests avec historique et graphiques.

## 🎯 Vue d'ensemble

Le dashboard affiche :
- **Statistiques en temps réel** : Couverture actuelle avec tendances
- **Graphiques d'évolution** : Visualisation temporelle de la couverture
- **Historique détaillé** : Tableau avec tous les builds et leurs métriques
- **Badges de statut** : Indicateurs visuels selon les seuils

## 🚀 Configuration

### 1. Activer GitHub Pages

1. Allez dans **Settings** > **Pages** de votre repository
2. Source : Sélectionnez **gh-pages branch**
3. Folder : Sélectionnez **/ (root)**
4. Cliquez sur **Save**

### 2. Première exécution

Le workflow `coverage-history.yml` se déclenche automatiquement sur chaque push vers `main` :

```bash
git push origin main
```

Lors de la première exécution :
- Une branche `gh-pages` est créée automatiquement
- Le fichier `data/coverage-history.json` est initialisé
- Les données de couverture sont enregistrées

### 3. Accéder au dashboard

Une fois GitHub Pages activé, le dashboard est accessible à :

```
https://[votre-username].github.io/[votre-repo]/coverage-dashboard.html
```

Ou si vous utilisez un domaine personnalisé :

```
https://[votre-domaine]/coverage-dashboard.html
```

### 4. Configuration du repository (optionnel)

Si l'URL auto-détectée ne fonctionne pas, modifiez la ligne 203 dans `docs/coverage-dashboard.html` :

```javascript
const GITHUB_REPO = 'votre-username/votre-repo';
```

## 📈 Fonctionnalités

### Statistiques en temps réel

Affiche pour chaque métrique :
- **Valeur actuelle** en gros
- **Tendance** par rapport au commit précédent (↗ ↘ →)
- **Couleur** selon la performance

### Graphiques

1. **Graphique d'évolution** :
   - Courbes pour Lines, Statements, Functions, Branches
   - Historique complet sur 100 derniers builds
   - Interaction au survol pour détails

2. **Graphique de comparaison** :
   - Barres comparant les 4 métriques
   - État actuel de la couverture
   - Seuil de 80% visible

### Tableau d'historique

- Liste complète des builds (plus récent en premier)
- Commit SHA avec lien (à configurer)
- Message de commit
- Badges colorés selon les seuils :
  - 🟢 Vert : ≥ 80%
  - 🟡 Jaune : 60-79%
  - 🔴 Rouge : < 60%

## 🔄 Mise à jour automatique

Le workflow met à jour automatiquement :
1. **À chaque push sur main** : Collecte et sauvegarde la couverture
2. **Limite de 100 entrées** : Garde les 100 derniers builds
3. **Commit automatique** : Pousse vers `gh-pages` branch

## 🛠️ Personnalisation

### Modifier les seuils de couleur

Dans `docs/coverage-dashboard.html`, ligne 218-222 :

```javascript
function getBadgeClass(value) {
    if (value >= 80) return 'badge-success';  // Vert
    if (value >= 60) return 'badge-warning';  // Jaune
    return 'badge-danger';                     // Rouge
}
```

### Changer le nombre d'entrées historiques

Dans `.github/workflows/coverage-history.yml`, ligne 79 :

```bash
jq --argjson entry "$NEW_ENTRY" '. += [$entry] | .[-100:]' data/coverage-history.json
```

Remplacez `100` par le nombre souhaité.

### Personnaliser les couleurs du dashboard

Dans `docs/coverage-dashboard.html`, modifiez les couleurs dans la section `<style>` (lignes 9-240).

## 📊 Format des données

Les données sont stockées dans `gh-pages` branch sous `data/coverage-history.json` :

```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "commit": "abc1234",
    "message": "Add new feature",
    "lines": 85.5,
    "statements": 84.2,
    "functions": 88.1,
    "branches": 79.3
  }
]
```

## 🐛 Dépannage

### Le dashboard ne charge pas les données

1. Vérifiez que GitHub Pages est activé
2. Vérifiez que la branche `gh-pages` existe
3. Vérifiez le fichier `data/coverage-history.json` dans la branche `gh-pages`
4. Consultez les logs du workflow `coverage-history.yml`

### Les graphiques ne s'affichent pas

1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs CORS ou de chargement
3. Vérifiez que Chart.js se charge correctement (CDN)

### Le workflow échoue

1. Vérifiez que `npm run test:coverage` fonctionne localement
2. Vérifiez que le fichier `coverage/coverage-summary.json` est généré
3. Vérifiez les permissions `contents: write` dans le workflow

## 🔗 Intégration avec d'autres outils

### Badge dans le README

Ajoutez un lien vers le dashboard dans votre README.md :

```markdown
[![Coverage Dashboard](https://img.shields.io/badge/Coverage-Dashboard-blue)](https://votre-username.github.io/votre-repo/coverage-dashboard.html)
```

### Notifications

Le dashboard est compatible avec les notifications Slack/Discord déjà configurées. Les alertes incluent maintenant un lien vers le dashboard.

## 📚 Ressources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🎨 Captures d'écran

Le dashboard affiche :
- En-tête avec titre et description
- 4 cartes de statistiques avec tendances
- Graphique d'évolution temporelle (ligne)
- Graphique de comparaison des métriques (barres)
- Tableau historique détaillé avec badges colorés
- Footer avec date de dernière mise à jour

Thème : Dégradé violet moderne avec cartes blanches et ombres élégantes.
