# ⚙️ Configuration GitHub Actions pour Hostinger

Guide pour configurer le déploiement automatique sur Hostinger via GitHub Actions.

---

## 🎯 Ce que fait le workflow

À chaque **push sur la branche `main`**, GitHub Actions va automatiquement :

1. ✅ Installer les dépendances
2. ✅ Construire le projet (`npm run build`)
3. ✅ Déployer le contenu de `dist/` sur Hostinger via FTP
4. ✅ Vous notifier du succès/échec

**Temps estimé :** 2-4 minutes par déploiement

---

## 🔐 Configuration des Secrets (OBLIGATOIRE)

Les identifiants FTP sont stockés de manière sécurisée dans **GitHub Secrets**.

### Étape 1 : Accéder aux Secrets GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (en haut à droite)
3. Dans le menu latéral : **Secrets and variables → Actions**
4. Cliquez sur **New repository secret**

### Étape 2 : Ajouter les 4 secrets requis

Créez ces **4 secrets** un par un :

#### 1️⃣ `FTP_SERVER`

**Valeur :** Adresse de votre serveur FTP Hostinger

```
ftp.zawajconnect.me
```

OU l'adresse IP fournie par Hostinger (ex: `154.56.78.90`)

---

#### 2️⃣ `FTP_USERNAME`

**Valeur :** Votre nom d'utilisateur FTP

```
votre_username_ftp
```

**Comment l'obtenir :**

- [hPanel Hostinger](https://hpanel.hostinger.com) → **Fichiers → Gestionnaire FTP**
- Copiez le **Username**

---

#### 3️⃣ `FTP_PASSWORD`

**Valeur :** Votre mot de passe FTP

```
votre_password_ftp
```

⚠️ **IMPORTANT** : Utilisez un mot de passe fort !

**Comment l'obtenir :**

- Utilisez votre mot de passe FTP existant
- OU créez un nouveau compte FTP sur hPanel

---

#### 4️⃣ `FTP_SERVER_DIR`

**Valeur :** Chemin du dossier distant sur Hostinger

Pour un domaine principal :

```
/public_html
```

Pour un sous-domaine (exemple: `app.zawajconnect.me`) :

```
/public_html/app
```

Pour un dossier spécifique :

```
/public_html/mon-site
```

---

## 📋 Résumé des Secrets à Créer

| Secret Name      | Exemple de Valeur     | Où le trouver             |
| ---------------- | --------------------- | ------------------------- |
| `FTP_SERVER`     | `ftp.zawajconnect.me` | hPanel → Gestionnaire FTP |
| `FTP_USERNAME`   | `zawaj_ftp`           | hPanel → Gestionnaire FTP |
| `FTP_PASSWORD`   | `VotreMotDePasse123!` | Votre mot de passe FTP    |
| `FTP_SERVER_DIR` | `/public_html`        | Chemin de destination     |

---

## ✅ Vérification de la Configuration

### Test 1 : Vérifier que les secrets sont bien créés

1. GitHub → **Settings → Secrets and variables → Actions**
2. Vous devez voir les 4 secrets listés :
   - ✅ FTP_SERVER
   - ✅ FTP_USERNAME
   - ✅ FTP_PASSWORD
   - ✅ FTP_SERVER_DIR

### Test 2 : Tester le workflow manuellement

1. GitHub → **Actions** (onglet en haut)
2. Cliquez sur **"🚀 Deploy to Hostinger"** dans la liste
3. Cliquez sur **"Run workflow"** (bouton droit)
4. Sélectionnez la branche `main`
5. Cliquez sur **"Run workflow"** (bouton vert)

Le workflow devrait :

- ✅ S'exécuter en 2-4 minutes
- ✅ Afficher un ✅ vert si succès
- ✅ Déployer votre site sur Hostinger

---

## 🚀 Utilisation Quotidienne

### Déploiement Automatique

```bash
# 1. Faire vos changements localement
git add .
git commit -m "feat: nouvelle fonctionnalité"

# 2. Pusher sur GitHub
git push origin main

# 3. GitHub Actions déploie automatiquement ! 🎉
# Suivez la progression sur GitHub → Actions
```

### Déploiement Manuel (si besoin)

1. GitHub → **Actions**
2. Cliquez sur **"🚀 Deploy to Hostinger"**
3. **"Run workflow"** → Sélectionnez `main` → **"Run workflow"**

---

## 📊 Suivre les Déploiements

### Voir l'historique

1. GitHub → **Actions** (onglet)
2. Vous verrez tous les déploiements :
   - ✅ Vert = Succès
   - ❌ Rouge = Échec
   - 🟡 Jaune = En cours

### Voir les détails d'un déploiement

1. Cliquez sur un workflow dans l'historique
2. Cliquez sur **"Build & Deploy"**
3. Vous verrez :
   - 📦 Taille du build
   - 📊 Nombre de fichiers uploadés
   - ⏱️ Temps d'exécution
   - 🔗 URL du site déployé

---

## 🐛 Dépannage

### ❌ Erreur : "Failed to connect to FTP server"

**Cause :** Adresse FTP incorrecte ou serveur inaccessible

**Solutions :**

1. Vérifiez `FTP_SERVER` dans les secrets GitHub
2. Testez la connexion FTP avec FileZilla
3. Vérifiez que le port 21 n'est pas bloqué

---

### ❌ Erreur : "530 Login authentication failed"

**Cause :** Identifiants FTP incorrects

**Solutions :**

1. Vérifiez `FTP_USERNAME` et `FTP_PASSWORD` dans les secrets
2. Testez la connexion avec FileZilla
3. Réinitialisez votre mot de passe FTP sur hPanel

---

### ❌ Erreur : "Failed to upload files"

**Cause :** Permissions insuffisantes ou dossier inexistant

**Solutions :**

1. Vérifiez que `FTP_SERVER_DIR` existe sur le serveur
2. Assurez-vous que le compte FTP a les permissions d'écriture
3. Créez le dossier manuellement via hPanel si nécessaire

---

### ❌ Le site ne se met pas à jour après un déploiement réussi

**Solutions :**

1. **Cache navigateur** : Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)
2. **Cache Cloudflare/CDN** : Purgez le cache sur Hostinger
3. **Vérification** : Affichez la source de la page (Ctrl+U) pour voir si le code est à jour

---

### 🔍 Activer les logs détaillés (debug)

Si un déploiement échoue sans raison claire :

1. Éditez `.github/workflows/deploy-hostinger.yml`
2. Ajoutez `log-level: verbose` dans l'étape FTP :

```yaml
- name: 🚀 Deploy to Hostinger via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    server: ${{ secrets.FTP_SERVER }}
    username: ${{ secrets.FTP_USERNAME }}
    password: ${{ secrets.FTP_PASSWORD }}
    server-dir: ${{ secrets.FTP_SERVER_DIR }}
    local-dir: ./dist/
    log-level: verbose # ← Ajouter cette ligne
```

---

## 🔐 Sécurité

### ✅ Bonnes Pratiques

1. **Ne jamais committer les secrets** dans le code
   - ✅ Les secrets GitHub sont chiffrés
   - ✅ Ils ne sont jamais visibles dans les logs

2. **Utiliser un compte FTP dédié**
   - Créez un compte FTP spécifique pour le CI/CD
   - Limitez ses permissions au strict nécessaire

3. **Rotation des mots de passe**
   - Changez le mot de passe FTP tous les 3-6 mois
   - Mettez à jour le secret `FTP_PASSWORD` sur GitHub

4. **Limiter l'accès aux secrets**
   - Settings → Manage access
   - Seuls les admins du repo peuvent voir/modifier les secrets

---

## 🎨 Personnalisation du Workflow

### Déployer uniquement si les tests passent

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test

  build-and-deploy:
    needs: test # ← Attend que les tests passent
    runs-on: ubuntu-latest
    # ... reste du workflow
```

### Déployer sur plusieurs branches

```yaml
on:
  push:
    branches:
      - main
      - staging
      - production
```

### Notification Slack/Discord après déploiement

```yaml
- name: 📢 Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "✅ Site déployé sur Hostinger!"
      }
```

---

## 📈 Monitoring

### Temps de Build Moyen

Surveillez les temps de build dans Actions → Insights :

- **Normal** : 2-4 minutes
- **Lent** : > 5 minutes → Optimiser les dépendances

### Taux de Succès

- **Objectif** : > 95% de succès
- Si < 90% : Vérifier la stabilité du serveur FTP

---

## 🔄 Workflow de Développement Recommandé

```bash
# 1. Branche de feature
git checkout -b feature/nouvelle-fonctionnalite
git add .
git commit -m "feat: ajout fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 2. Pull Request sur GitHub
# → Review du code
# → Tests automatiques

# 3. Merge dans main
# → Déploiement automatique sur Hostinger ! 🚀
```

---

## 📚 Ressources

- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [Hostinger Support](https://support.hostinger.com)

---

## ✨ Résumé

```bash
# Configuration (une seule fois)
1. Créer 4 secrets sur GitHub (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD, FTP_SERVER_DIR)
2. Tester avec "Run workflow" manuellement

# Utilisation quotidienne
git push origin main  # Déploiement automatique !
```

**Votre CI/CD est maintenant configuré ! 🎉**
