# Fix: Page Blanche sur Hostinger - Configuration Complète

**Date:** 2025-11-10
**Hébergeur:** Hostinger
**Status:** 🔴 CONFIGURATION REQUISE

---

## 🔍 Problème Identifié

Votre site https://zawajconnect.me/ affiche une page blanche car **les variables d'environnement Supabase ne sont pas configurées** sur Hostinger.

### Erreur Technique

L'application nécessite deux variables d'environnement pour fonctionner :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Sans ces variables, l'application ne peut pas se connecter à votre base de données Supabase.

---

## ✅ Solution Complète pour Hostinger

### Étape 1: Obtenir les Valeurs Supabase

1. **Connectez-vous à Supabase**
   ```
   https://app.supabase.com
   ```

2. **Sélectionnez votre projet ZawajConnect**

3. **Allez dans Settings → API**

4. **Copiez ces deux valeurs :**
   - **Project URL** (exemple: `https://abcdefg.supabase.co`)
   - **anon public key** (commence par `eyJhbGciOi...`)

---

### Étape 2: Configuration sur Hostinger

Hostinger gère les variables d'environnement différemment selon votre type d'hébergement :

#### Option A: Si vous utilisez **Hostinger avec Node.js** (recommandé)

1. **Connectez-vous à hPanel Hostinger**
   ```
   https://hpanel.hostinger.com
   ```

2. **Allez dans votre site web**

3. **Configuration Node.js** :
   - Cliquez sur "Node.js" dans le panneau
   - Trouvez la section "Environment Variables"
   - Ajoutez les variables :
     ```
     VITE_SUPABASE_URL = https://votre-projet.supabase.co
     VITE_SUPABASE_PUBLISHABLE_KEY = votre_clé_publique_ici
     ```

4. **Redémarrez l'application Node.js**

#### Option B: Si vous utilisez **Hostinger hébergement Web classique**

Pour l'hébergement web classique, vous devez :

1. **Construire l'application en local avec les variables**

   Créez un fichier `.env` dans votre projet (en local sur votre ordinateur) :
   ```bash
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=votre_clé_publique_ici
   ```

2. **Construire le projet**
   ```bash
   npm install
   npm run build
   ```

3. **Uploader via FTP/File Manager**
   - Connectez-vous au File Manager Hostinger
   - Allez dans `public_html` (ou votre dossier web)
   - Uploadez TOUT le contenu du dossier `dist/` :
     - `index.html`
     - Dossier `assets/`
     - Fichiers `_redirects`, `.htaccess`
     - Tous les autres fichiers

4. **Configuration .htaccess** (important pour React Router)

   Vérifiez que le fichier `.htaccess` existe dans `public_html` avec ce contenu :
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   Ce fichier est crucial pour que React Router fonctionne correctement.

---

### Étape 3: Vérification

1. **Videz le cache du navigateur** (Ctrl+Shift+R ou Cmd+Shift+R)

2. **Accédez au site**
   ```
   https://zawajconnect.me/
   ```

3. **Ouvrez la console du navigateur** (F12 → Console)
   - ✅ Plus d'erreur "Missing Supabase environment variables"
   - ✅ L'application se charge normalement

4. **Si une page d'erreur s'affiche maintenant** (au lieu d'une page blanche) :
   - C'est normal ! C'est notre nouveau système d'erreur amélioré
   - Lisez le message d'erreur qui vous guidera vers la solution

---

## 🔧 Améliorations Appliquées

### 1. **Système de Gestion d'Erreur Amélioré** ✅

Au lieu d'une page blanche, vous verrez maintenant une **page d'erreur détaillée** avec :
- Le message d'erreur exact
- Instructions de résolution
- Informations de débogage

**Fichiers créés/modifiés :**
- `src/components/ErrorFallback.tsx` (nouveau) - Page d'erreur visible
- `src/components/ErrorBoundary.tsx` (modifié) - Capture les erreurs React
- `src/errorHandler.ts` (nouveau) - Gestionnaire d'erreur global
- `src/main.tsx` (modifié) - Intégration du gestionnaire d'erreur
- `src/integrations/supabase/client.ts` (modifié) - Erreur non-bloquante

### 2. **Permissions WebRTC Fixées** ✅

Pour que les appels audio/vidéo fonctionnent :

**Avant :**
```toml
Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

**Après :**
```toml
Permissions-Policy = "geolocation=(), microphone=(self), camera=(self)"
```

### 3. **Package xlsx Ajouté** ✅

Le package manquant a été ajouté pour l'export des données.

---

## 📋 Checklist de Déploiement Hostinger

### Configuration Initiale
- [ ] Variables d'environnement Supabase obtenues (URL + Key)
- [ ] Variables configurées sur Hostinger (Node.js ou build local)
- [ ] Fichier `.htaccess` présent dans `public_html`
- [ ] Build réussi sans erreurs

### Premier Déploiement
- [ ] Dossier `dist/` complet uploadé sur Hostinger
- [ ] Tous les fichiers dans `public_html` (ou dossier web)
- [ ] `.htaccess` configuré pour React Router
- [ ] Cache navigateur vidé

### Vérification Finale
- [ ] Site accessible (pas de page blanche)
- [ ] Console navigateur sans erreurs critiques
- [ ] Login/registration fonctionne
- [ ] Navigation entre pages fonctionne
- [ ] Appels audio/vidéo fonctionnent (permissions accordées)

---

## 🚀 Workflow de Déploiement Automatisé (Optionnel)

Pour automatiser vos déploiements futurs :

### Option 1: FTP Automatique avec GitHub Actions

Créez `.github/workflows/deploy-hostinger.yml` :

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
      run: npm run build

    - name: Deploy to Hostinger via FTP
      uses: SamKirkland/FTP-Deploy-Action@4.3.0
      with:
        server: ftp.zawajconnect.me
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./dist/
        server-dir: /public_html/
```

**Configuration des secrets GitHub** :
1. Allez dans Settings → Secrets and variables → Actions
2. Ajoutez :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `FTP_USERNAME` (votre username FTP Hostinger)
   - `FTP_PASSWORD` (votre mot de passe FTP Hostinger)

### Option 2: Script de Déploiement Manuel

Créez `deploy-hostinger.sh` :

```bash
#!/bin/bash

echo "🚀 Déploiement vers Hostinger..."

# Build du projet
echo "📦 Build du projet..."
npm run build

# Upload via FTP (nécessite lftp)
echo "📤 Upload vers Hostinger..."
lftp -c "
set ftp:ssl-allow no;
open ftp://ftp.zawajconnect.me;
user VOTRE_USERNAME VOTRE_PASSWORD;
mirror -R dist/ /public_html/ --delete --verbose;
bye;
"

echo "✅ Déploiement terminé !"
```

Rendez-le exécutable :
```bash
chmod +x deploy-hostinger.sh
```

---

## 🐛 Débogage

### Si la page blanche persiste :

1. **Vérifiez les variables d'environnement**
   - F12 → Console → Vous devriez voir les erreurs exactes maintenant

2. **Vérifiez que tous les fichiers sont uploadés**
   ```
   public_html/
   ├── index.html
   ├── .htaccess
   ├── _redirects
   ├── assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── ...
   ├── favicon.ico
   └── ...
   ```

3. **Vérifiez les permissions des fichiers**
   - Fichiers : 644 (rw-r--r--)
   - Dossiers : 755 (rwxr-xr-x)

4. **Vérifiez le .htaccess**
   - Doit être dans `public_html/`
   - Doit contenir les règles de réécriture

### Si vous voyez maintenant une page d'erreur (au lieu d'une page blanche) :

**C'est bon signe !** 🎉 Notre système d'erreur fonctionne. Lisez simplement le message d'erreur affiché qui vous guidera vers la solution.

---

## 📞 Support Hostinger

Si vous avez besoin d'aide avec Hostinger :

- **Chat en direct** : Disponible 24/7 sur hPanel
- **Email** : support@hostinger.com
- **Tutoriels** : https://support.hostinger.com

Questions fréquentes à poser :
- "Comment configurer les variables d'environnement pour une application Node.js ?"
- "Comment configurer le .htaccess pour une Single Page Application ?"
- "Comment vider le cache CDN de mon site ?"

---

## 📝 Résumé des Fichiers Modifiés

| Fichier | Changement | Status |
|---------|------------|--------|
| `src/components/ErrorFallback.tsx` | ✅ Créé | Nouveau composant d'erreur |
| `src/components/ErrorBoundary.tsx` | ✅ Modifié | Utilise ErrorFallback |
| `src/errorHandler.ts` | ✅ Créé | Gestionnaire d'erreur global |
| `src/main.tsx` | ✅ Modifié | Intégration ErrorBoundary |
| `src/integrations/supabase/client.ts` | ✅ Modifié | Erreur non-bloquante |
| `netlify.toml` | ✅ Modifié | Permissions WebRTC |
| `package.json` | ✅ Modifié | Ajout de xlsx |

---

## ✅ Prochaines Étapes

1. **URGENT:** Configurer les variables d'environnement sur Hostinger
2. **URGENT:** Builder et déployer le site
3. **Test:** Vérifier que https://zawajconnect.me/ fonctionne
4. **Optionnel:** Configurer le déploiement automatique

**Une fois ces étapes complétées, votre site devrait fonctionner normalement !** 🚀
