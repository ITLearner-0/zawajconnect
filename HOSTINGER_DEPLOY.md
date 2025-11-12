# 🚀 Déploiement Automatique sur Hostinger

Guide complet pour déployer automatiquement ZawajConnect sur Hostinger via FTP.

---

## 📋 Prérequis

1. **Compte Hostinger actif** avec accès FTP
2. **Node.js** installé (v18 ou supérieur)
3. **Identifiants FTP** de votre hébergement Hostinger

---

## ⚙️ Configuration Initiale (À faire une seule fois)

### Étape 1 : Créer le fichier de configuration FTP

1. **Copier le fichier exemple :**

   ```bash
   cp .ftp-deploy.example.json .ftp-deploy.json
   ```

2. **Ouvrir `.ftp-deploy.json`** et remplacer les valeurs :

   ```json
   {
     "host": "ftp.votresite.com",
     "user": "votre_username_ftp",
     "password": "votre_mot_de_passe_ftp",
     "port": 21,
     "remoteRoot": "/public_html",
     "siteUrl": "https://zawajconnect.me",
     "deleteRemote": true,
     "exclude": ["**/*.map", ".git/**", ".DS_Store"]
   }
   ```

### Étape 2 : Obtenir vos identifiants FTP Hostinger

1. **Connectez-vous à** [hpanel.hostinger.com](https://hpanel.hostinger.com)

2. **Accédez à "Fichiers" → "Gestionnaire de fichiers FTP"**

3. **Notez les informations :**
   - **Hôte FTP** : `ftp.votredomaine.com` (ou IP fournie)
   - **Nom d'utilisateur** : Votre username FTP
   - **Mot de passe** : Votre mot de passe FTP (ou créez-en un nouveau)
   - **Port** : `21` (FTP standard)
   - **Dossier distant** :
     - `/public_html` (pour domaine principal)
     - `/public_html/sous-dossier` (pour sous-domaine)

### Étape 3 : Sécuriser la configuration

**IMPORTANT** : Le fichier `.ftp-deploy.json` contient vos identifiants FTP sensibles.

✅ **Le fichier est déjà dans `.gitignore`** - ne le commitez JAMAIS !

```bash
# Vérifier qu'il est bien ignoré
git status  # .ftp-deploy.json ne doit PAS apparaître
```

---

## 🚀 Déploiement

### Commande Unique (Build + Deploy)

```bash
npm run deploy:hostinger
```

Cette commande va :

1. ✅ Construire le projet (`npm run build`)
2. ✅ Se connecter au serveur FTP Hostinger
3. ✅ Uploader tous les fichiers du dossier `dist/`
4. ✅ Supprimer les anciens fichiers (si `deleteRemote: true`)
5. ✅ Afficher la progression en temps réel

### Commandes Séparées (Optionnel)

```bash
# 1. Construire seulement
npm run build

# 2. Déployer seulement (sans rebuild)
node scripts/deploy-hostinger.js
```

---

## 📊 Exemple de Sortie

```
🚀 Déploiement vers Hostinger
──────────────────────────────────────────────────
ℹ Hôte: ftp.zawajconnect.me
ℹ Utilisateur: zawaj_ftp
ℹ Dossier distant: /public_html
ℹ Dossier local: dist/
──────────────────────────────────────────────────

→ Connexion au serveur FTP...
→ Upload: index.html (1/127)
✓ Uploaded: index.html
→ Upload: assets/index-abc123.js (2/127)
✓ Uploaded: assets/index-abc123.js
...

──────────────────────────────────────────────────
✓ 🎉 Déploiement terminé avec succès !
ℹ Votre site: https://zawajconnect.me
──────────────────────────────────────────────────
```

---

## 🛠️ Configuration Avancée

### Options dans `.ftp-deploy.json`

| Option         | Type    | Défaut     | Description                                             |
| -------------- | ------- | ---------- | ------------------------------------------------------- |
| `host`         | string  | **requis** | Adresse du serveur FTP                                  |
| `user`         | string  | **requis** | Nom d'utilisateur FTP                                   |
| `password`     | string  | **requis** | Mot de passe FTP                                        |
| `port`         | number  | `21`       | Port FTP (21 standard, 22 pour SFTP)                    |
| `remoteRoot`   | string  | **requis** | Dossier de destination sur le serveur                   |
| `siteUrl`      | string  | optionnel  | URL de votre site (affichée après deploy)               |
| `deleteRemote` | boolean | `true`     | Supprimer les fichiers distants non présents localement |
| `exclude`      | array   | `[]`       | Fichiers/dossiers à exclure de l'upload                 |

### Exemple : Déployer sur un sous-domaine

```json
{
  "host": "ftp.votresite.com",
  "user": "votre_username",
  "password": "votre_password",
  "remoteRoot": "/public_html/app",
  "siteUrl": "https://app.zawajconnect.me"
}
```

### Exemple : Garder certains fichiers distants

```json
{
  "deleteRemote": false,
  "exclude": ["**/*.map", ".git/**", ".htaccess", "uploads/**"]
}
```

---

## 🔧 Dépannage

### ❌ Erreur : "Fichier de configuration introuvable"

**Solution :**

```bash
cp .ftp-deploy.example.json .ftp-deploy.json
# Puis éditez .ftp-deploy.json avec vos identifiants
```

---

### ❌ Erreur : "Le dossier dist/ n'existe pas"

**Solution :**

```bash
npm run build  # Construire le projet d'abord
```

---

### ❌ Erreur : "ENOTFOUND" ou "getaddrinfo ENOTFOUND"

**Cause :** Hôte FTP incorrect ou problème de connexion

**Solutions :**

1. Vérifiez l'orthographe de l'hôte dans `.ftp-deploy.json`
2. Testez votre connexion internet
3. Vérifiez que le serveur FTP est accessible :
   ```bash
   ping ftp.votresite.com
   ```

---

### ❌ Erreur : "530 Login authentication failed"

**Cause :** Identifiants FTP incorrects

**Solutions :**

1. Vérifiez votre username et password dans `.ftp-deploy.json`
2. Réinitialisez votre mot de passe FTP sur Hostinger :
   - hPanel → Fichiers → Gestionnaire FTP
   - Cliquez sur "Modifier" à côté de votre compte FTP

---

### ❌ Erreur : "ECONNREFUSED"

**Cause :** Port FTP incorrect ou firewall

**Solutions :**

1. Vérifiez le port (21 pour FTP standard)
2. Essayez le port 22 si SFTP est activé
3. Vérifiez votre firewall local

---

### ❌ Le site ne se met pas à jour après déploiement

**Causes possibles :**

1. **Cache du navigateur** : Faites Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)
2. **Cache Hostinger** : Attendez 2-5 minutes
3. **Mauvais dossier distant** : Vérifiez `remoteRoot` dans `.ftp-deploy.json`

**Vérification :**

```bash
# Vérifier que les fichiers sont bien uploadés
# Connectez-vous via FTP (FileZilla) et vérifiez manuellement
```

---

### 🐛 Upload très lent

**Optimisations :**

1. **Exclure les fichiers inutiles :**

   ```json
   "exclude": [
     "**/*.map",
     "**/*.md",
     ".git/**"
   ]
   ```

2. **Déployer seulement les fichiers modifiés** (avancé) :
   ```bash
   # Installer rsync-deploy à la place (plus rapide)
   npm install --save-dev rsync-deploy
   ```

---

## 🔐 Sécurité

### ✅ Bonnes Pratiques

1. **Ne jamais committer `.ftp-deploy.json`**

   ```bash
   # Vérifier avant chaque commit
   git status
   ```

2. **Utiliser des mots de passe forts** pour FTP

3. **Créer un compte FTP dédié** sur Hostinger (pas le compte principal)

4. **Limiter les permissions** :
   - Accès FTP uniquement au dossier `/public_html`
   - Pas d'accès shell

5. **Changer le mot de passe FTP régulièrement**

### ⚠️ À NE JAMAIS FAIRE

- ❌ Committer `.ftp-deploy.json` dans Git
- ❌ Partager vos identifiants FTP publiquement
- ❌ Utiliser le même mot de passe que votre compte Hostinger principal
- ❌ Laisser `deleteRemote: true` si vous avez des fichiers importants distants

---

## 📝 Workflow de Développement Recommandé

### 1. Développement Local

```bash
npm run dev  # Développer localement
```

### 2. Test du Build

```bash
npm run build
npm run preview  # Tester le build localement
```

### 3. Déploiement Production

```bash
npm run deploy:hostinger  # Build + Deploy automatique
```

---

## 🆘 Support

### Hostinger Support

- 📧 Email : support@hostinger.com
- 💬 Live Chat : [hpanel.hostinger.com](https://hpanel.hostinger.com)
- 📚 Documentation : [support.hostinger.com](https://support.hostinger.com)

### ZawajConnect

- 📖 Voir aussi : `DEPLOYMENT_GUIDE.md`
- 🐛 Issues : GitHub Issues (si configuré)

---

## 📚 Ressources

- [Documentation Hostinger FTP](https://support.hostinger.com/en/articles/1583245-how-to-upload-files-to-your-website-using-ftp)
- [FileZilla (client FTP graphique)](https://filezilla-project.org/)
- [Documentation ftp-deploy](https://www.npmjs.com/package/ftp-deploy)

---

## ✨ Résumé

```bash
# Configuration (une seule fois)
cp .ftp-deploy.example.json .ftp-deploy.json
# Éditer .ftp-deploy.json avec vos identifiants FTP Hostinger

# Déploiement (chaque fois)
npm run deploy:hostinger
```

**C'est tout !** Votre site est maintenant déployé sur Hostinger. 🎉
