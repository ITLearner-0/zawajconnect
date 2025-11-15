# Fix: Page Blanche en Production (https://zawajconnect.me/)

**Date:** 2025-11-10
**Status:** 🔴 PROBLÈME IDENTIFIÉ - ACTION REQUISE

---

## 🔍 Diagnostic

Le site https://zawajconnect.me/ affiche une page blanche car les **variables d'environnement Supabase ne sont pas configurées** sur la plateforme de déploiement.

### Cause Technique

Le fichier `src/integrations/supabase/client.ts` (lignes 10-14) contient cette validation :

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}
```

**Pourquoi page blanche ?**

- Cette erreur est lancée AVANT que React ne commence à rendre l'application
- L'erreur se produit pendant l'import du module Supabase
- React ne peut jamais monter → page blanche
- Le build réussit localement car il compile seulement le code
- L'erreur se produit uniquement au runtime dans le navigateur

---

## ✅ Solution 1: Configurer les Variables d'Environnement

### Option A: Netlify (recommandé si votre site est sur Netlify)

1. **Aller sur Netlify Dashboard**

   ```
   https://app.netlify.com
   ```

2. **Sélectionner votre site**
   - Cherchez "zawajconnect" dans vos sites

3. **Configurer les variables**
   - Site settings → Environment variables
   - Cliquez "Add a variable"

4. **Ajouter ces 2 variables :**

   ```bash
   Variable 1:
   Key: VITE_SUPABASE_URL
   Value: https://votre-projet.supabase.co

   Variable 2:
   Key: VITE_SUPABASE_PUBLISHABLE_KEY
   Value: votre_clé_publique_supabase_ici
   ```

5. **Redéployer**
   - Deployments → Trigger deploy → Deploy site

---

### Option B: Vercel (si votre site est sur Vercel)

1. **Aller sur Vercel Dashboard**

   ```
   https://vercel.com/dashboard
   ```

2. **Sélectionner votre projet**

3. **Configurer les variables**
   - Settings → Environment Variables
   - Add New

4. **Ajouter ces 2 variables :**

   ```bash
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=votre_clé_publique_supabase
   ```

5. **Redéployer**
   - Deployments → Redeploy (avec les nouvelles variables)

---

### Comment Obtenir les Valeurs Supabase

1. **Se connecter à Supabase**

   ```
   https://app.supabase.com
   ```

2. **Sélectionner votre projet ZawajConnect**

3. **Aller dans Settings → API**

4. **Copier les valeurs :**
   - **Project URL** → Utiliser pour `VITE_SUPABASE_URL`
   - **anon/public key** → Utiliser pour `VITE_SUPABASE_PUBLISHABLE_KEY`

   Example:

   ```
   URL: https://abcdefghijklm.supabase.co
   anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Solution 2: Permissions WebRTC Fixées

**Problème trouvé et corrigé** dans `netlify.toml`:

### Avant (❌ Bloque micro/caméra) :

```toml
Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### Après (✅ Autorise micro/caméra pour WebRTC) :

```toml
Permissions-Policy = "geolocation=(), microphone=(self), camera=(self)"
```

**Ce changement a été committé** et permet maintenant aux appels audio/vidéo WebRTC de fonctionner.

---

## 🧪 Vérification

### Après avoir configuré les variables d'environnement :

1. **Redéployer le site** (Netlify/Vercel)

2. **Ouvrir le site**

   ```
   https://zawajconnect.me/
   ```

3. **Vérifier dans la console navigateur** (F12 → Console)
   - ✅ Plus d'erreur "Missing Supabase environment variables"
   - ✅ L'application React se charge normalement
   - ✅ Page d'accueil visible

4. **Si toujours page blanche** :
   - Ouvrir F12 → Console
   - Prendre screenshot de l'erreur
   - Vérifier Network tab pour erreurs 404/500

---

## 📋 Checklist de Déploiement

- [ ] Variables d'environnement configurées sur Netlify/Vercel
- [ ] `VITE_SUPABASE_URL` configuré
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` configuré
- [ ] Site redéployé avec les nouvelles variables
- [ ] Page d'accueil accessible
- [ ] Console navigateur sans erreurs
- [ ] Test de connexion fonctionne
- [ ] Permissions WebRTC fixées (netlify.toml)

---

## 🔧 Variables Optionnelles (pour features avancées)

Ces variables ne sont PAS obligatoires pour que le site fonctionne, mais activent des features supplémentaires :

```bash
# Mode développement (test user selector)
VITE_DEV_MODE=false

# Sentry (monitoring d'erreurs)
VITE_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
VITE_APP_VERSION=1.0.0

# Paiements Braintree
VITE_BRAINTREE_TOKEN_URL=your_url
VITE_BRAINTREE_MERCHANT_ID=your_id
```

---

## 📞 Support

**Si le problème persiste après avoir configuré les variables :**

1. Vérifiez les logs de déploiement (Netlify/Vercel)
2. Vérifiez que les variables sont bien dans "Production" environment
3. Faites un "Clear cache and deploy"
4. Ouvrez la console navigateur (F12) et partagez l'erreur exacte

---

## ✅ Résumé des Actions à Faire

1. **URGENT:** Configurer `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sur Netlify/Vercel
2. **URGENT:** Redéployer le site
3. **Fait:** Permissions WebRTC corrigées (déjà committé)
4. **Test:** Vérifier que https://zawajconnect.me/ charge normalement

**Après ces actions, le site devrait fonctionner normalement.**
