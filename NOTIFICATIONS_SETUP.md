# 📢 Configuration des Notifications Slack et Discord

Ce guide explique comment configurer les notifications automatiques pour les tests et déploiements.

## 🎯 Notifications Configurées

### Workflow de Déploiement (`deploy-hostinger.yml`)
- ✅ **Succès du déploiement** - Notification avec lien vers le site
- ❌ **Échec des tests/couverture** - Alerte avec détails de l'erreur

### Workflow des Pull Requests (`pr-tests.yml`)
- ⚠️ **Échec des tests sur PR** - Alerte avec pourcentages de couverture et lien vers la PR

## 🔧 Configuration Slack

### 1. Créer un Webhook Slack

1. Accédez aux [Slack Apps](https://api.slack.com/apps)
2. Cliquez sur **"Create New App"** → **"From scratch"**
3. Donnez un nom à votre app (ex: "GitHub Actions - ZawajConnect")
4. Sélectionnez votre workspace
5. Dans le menu de gauche, allez à **"Incoming Webhooks"**
6. Activez **"Activate Incoming Webhooks"**
7. Cliquez sur **"Add New Webhook to Workspace"**
8. Choisissez le canal où vous voulez recevoir les notifications
9. Copiez l'URL du webhook (elle commence par `https://hooks.slack.com/services/...`)

### 2. Ajouter le Secret GitHub

1. Allez dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **"New repository secret"**
4. Nom: `SLACK_WEBHOOK_URL`
5. Valeur: Collez l'URL du webhook Slack
6. Cliquez sur **"Add secret"**

### 3. Tester la Configuration

Faites un commit ou créez une PR pour déclencher les workflows et vérifier que les notifications arrivent bien sur Slack.

## 🎮 Configuration Discord

### 1. Créer un Webhook Discord

1. Ouvrez Discord et allez sur le serveur où vous voulez recevoir les notifications
2. Cliquez sur l'icône ⚙️ à côté du nom du canal
3. Allez dans **"Intégrations"** → **"Webhooks"**
4. Cliquez sur **"Nouveau Webhook"** ou **"Create Webhook"**
5. Donnez un nom au webhook (ex: "GitHub Actions")
6. Sélectionnez le canal de destination
7. Cliquez sur **"Copier l'URL du Webhook"**

### 2. Ajouter le Secret GitHub

1. Allez dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **"New repository secret"**
4. Nom: `DISCORD_WEBHOOK_URL`
5. Valeur: Collez l'URL du webhook Discord
6. Cliquez sur **"Add secret"**

### 3. Tester la Configuration

Faites un commit ou créez une PR pour déclencher les workflows et vérifier que les notifications arrivent bien sur Discord.

## 📋 Secrets GitHub Nécessaires

| Secret | Description | Obligatoire |
|--------|-------------|-------------|
| `SLACK_WEBHOOK_URL` | URL du webhook Slack | Non (facultatif) |
| `DISCORD_WEBHOOK_URL` | URL du webhook Discord | Non (facultatif) |

**Note:** Vous pouvez configurer l'un, l'autre, ou les deux. Si un secret n'est pas configuré, les notifications correspondantes seront simplement ignorées.

## 🎨 Personnalisation des Messages

### Modifier les Messages Slack

Les messages Slack utilisent le format Block Kit. Vous pouvez les personnaliser dans les workflows :
- `.github/workflows/deploy-hostinger.yml` (lignes 64-116 et 114-146)
- `.github/workflows/pr-tests.yml` (lignes 157-211)

### Modifier les Messages Discord

Les messages Discord utilisent des embeds. Vous pouvez les personnaliser :
- `.github/workflows/deploy-hostinger.yml` (lignes 118-154 et 148-169)
- `.github/workflows/pr-tests.yml` (lignes 213-244)

## 📊 Types de Notifications

### ✅ Déploiement Réussi (Vert)
- Lien vers le site en production
- Informations du commit et de l'auteur
- Horodatage du déploiement

### ❌ Déploiement Échoué (Rouge)
- Raison de l'échec (tests ou couverture)
- Message du commit
- Lien vers les logs du workflow

### ⚠️ Tests PR Échoués (Orange)
- Numéro et titre de la PR
- Pourcentages de couverture actuels
- Lien vers la PR et le workflow

## 🔍 Dépannage

### Les notifications ne s'affichent pas

1. Vérifiez que les secrets sont bien configurés dans GitHub
2. Assurez-vous que les URLs de webhook sont valides
3. Vérifiez les logs du workflow pour voir les erreurs
4. Testez le webhook manuellement avec curl :

```bash
# Test Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test notification"}' \
  YOUR_SLACK_WEBHOOK_URL

# Test Discord
curl -H "Content-Type: application/json" \
  -d '{"content":"Test notification"}' \
  YOUR_DISCORD_WEBHOOK_URL
```

### Erreur "Webhook not found"

- Le webhook a peut-être été supprimé ou révoqué
- Créez un nouveau webhook et mettez à jour le secret GitHub

### Messages mal formatés

- Vérifiez que les caractères spéciaux dans les messages de commit sont correctement échappés
- Les URLs et les caractères spéciaux peuvent causer des problèmes de formatage

## 📚 Ressources

- [Documentation Slack Block Kit](https://api.slack.com/block-kit)
- [Documentation Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [GitHub Actions - Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🎯 Avantages

✅ **Visibilité immédiate** - L'équipe est alertée en temps réel
✅ **Traçabilité** - Historique complet des déploiements et tests
✅ **Réactivité** - Résolution rapide des problèmes
✅ **Contexte riche** - Liens directs vers PRs, commits et workflows
✅ **Personnalisable** - Adaptez les messages selon vos besoins
