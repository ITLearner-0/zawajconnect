# 🚀 Guide de Déploiement Production - ZawajConnect

**Date:** 5 Janvier 2025
**Version:** 1.0.0
**Statut:** ✅ Prêt pour production (85%)

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase](#configuration-supabase)
3. [Déploiement Frontend](#déploiement-frontend)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Vérifications Post-Déploiement](#vérifications-post-déploiement)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Rollback](#rollback-en-cas-de-problème)

---

## ✅ Prérequis

### Comptes Nécessaires
- [ ] Compte Supabase (avec projet existant)
- [ ] Compte Vercel/Netlify/AWS (pour hébergement)
- [ ] Compte Sentry (optionnel, monitoring erreurs)
- [ ] Compte Stripe (pour paiements)
- [ ] Domaine personnalisé (optionnel)

### Outils Installés
- [ ] Node.js 18+ installé
- [ ] Supabase CLI installé (`npm install -g supabase`)
- [ ] Git configuré
- [ ] Accès au repository GitHub

### Vérifications Préalables
```bash
# Vérifier que le build fonctionne
npm run build

# Vérifier que les tests passent
npm test

# Vérifier les variables d'environnement
cat .env.example
```

**Résultats Attendus:**
- ✅ Build réussi (~22s, 0 erreurs)
- ✅ 98/98 tests passent
- ✅ Toutes les variables documentées

---

## 🗄️ Configuration Supabase

### Étape 1: Connexion au Projet

```bash
# Se connecter à Supabase
supabase login

# Lier le projet local au projet distant
# Remplacer YOUR_PROJECT_REF par votre référence projet
supabase link --project-ref YOUR_PROJECT_REF
```

**Où trouver PROJECT_REF:**
- Dashboard Supabase → Settings → General → Reference ID
- Format: `abcdefghijklmnop`

### Étape 2: Appliquer les Migrations

```bash
# Vérifier les migrations à appliquer
supabase db diff

# Appliquer toutes les migrations
supabase db push

# Vérifier le statut
supabase db remote status
```

**Migrations à Appliquer:**
1. `20250105_performance_indexes.sql` - 20+ index pour performance
2. `20250105_moderation_tables.sql` - Tables modération

**Vérification:**
```sql
-- Dans Supabase SQL Editor
-- Vérifier que les index existent
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Vérifier que les tables de modération existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'moderation%';
```

**Résultats Attendus:**
- ✅ 20+ index créés (idx_profiles_gender, idx_matches_user1_status, etc.)
- ✅ 2 tables créées (moderation_rules, moderation_violations)

### Étape 3: Exécuter les Seeds

```bash
# Copier le contenu de supabase/seeds/moderation_rules_seed.sql
# Coller dans Supabase Dashboard → SQL Editor
# Cliquer sur "Run"
```

**OU via CLI:**
```bash
# Si vous avez configuré les seeds
supabase db seed
```

**Vérification:**
```sql
-- Dans Supabase SQL Editor
SELECT COUNT(*) as total_rules,
       COUNT(CASE WHEN is_active THEN 1 END) as active_rules
FROM moderation_rules;
```

**Résultats Attendus:**
- ✅ 17 règles totales
- ✅ 17 règles actives

### Étape 4: Configurer Row Level Security (RLS)

**Vérifier que RLS est activé:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'matches', 'messages', 'moderation_rules', 'moderation_violations');
```

**Si RLS n'est pas activé sur certaines tables:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_violations ENABLE ROW LEVEL SECURITY;
```

### Étape 5: Configurer les Storage Buckets

```sql
-- Créer le bucket pour les photos de profil (si pas déjà fait)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Configurer les policies de sécurité
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## 🌐 Déploiement Frontend

### Option 1: Déploiement sur Vercel (Recommandé)

#### A. Via Dashboard Vercel

1. **Aller sur vercel.com** et se connecter
2. **Cliquer "Add New Project"**
3. **Importer depuis GitHub:**
   - Sélectionner le repository `zawajconnect`
   - Sélectionner la branche `main` (ou votre branche de production)
4. **Configuration du Build:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Ajouter les Variables d'Environnement** (voir section suivante)
6. **Cliquer "Deploy"**

#### B. Via CLI Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer (depuis la racine du projet)
vercel --prod

# Suivre les prompts:
# - Set up and deploy? Yes
# - Which scope? [Votre compte]
# - Link to existing project? No
# - Project name? zawajconnect
# - Directory? ./
# - Override settings? No
```

**Configuration Vercel (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option 2: Déploiement sur Netlify

#### Via Dashboard Netlify

1. **Aller sur netlify.com** et se connecter
2. **Cliquer "Add new site" → "Import an existing project"**
3. **Connecter GitHub** et sélectionner le repository
4. **Configuration du Build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Branch: `main`
5. **Ajouter les Variables d'Environnement**
6. **Cliquer "Deploy site"**

#### Via CLI Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Initialiser
netlify init

# Déployer
netlify deploy --prod
```

**Configuration Netlify (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Déploiement sur AWS (Avancé)

**Ressources Nécessaires:**
- S3 bucket pour hébergement statique
- CloudFront pour CDN
- Route 53 pour DNS (optionnel)

```bash
# Installer AWS CLI
pip install awscli

# Configurer credentials
aws configure

# Sync avec S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalider cache CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## 🔐 Variables d'Environnement

### Production Environment Variables

**Créer un fichier `.env.production` (NE PAS commiter):**
```bash
# Supabase Configuration (OBLIGATOIRE)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id

# Sentry Error Monitoring (RECOMMANDÉ)
VITE_SENTRY_DSN=https://your_key@o123456.ingest.sentry.io/7654321
VITE_APP_VERSION=1.0.0

# Stripe Payment (SI ACTIVÉ)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Optional Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VIDEO_CALL=false
```

### Configuration dans Vercel

```bash
# Via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
vercel env add VITE_SUPABASE_PROJECT_ID production
vercel env add VITE_SENTRY_DSN production

# Ou via Dashboard:
# Settings → Environment Variables → Add
```

### Configuration dans Netlify

```bash
# Via Dashboard:
# Site settings → Environment variables → Add variable

# Ou via CLI
netlify env:set VITE_SUPABASE_URL "https://xxx.supabase.co"
netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY "your_key"
```

### ⚠️ Sécurité des Variables

**JAMAIS commiter:**
- ❌ `.env`
- ❌ `.env.production`
- ❌ `.env.local`

**Toujours commiter:**
- ✅ `.env.example` (sans vraies valeurs)

**Vérifier .gitignore:**
```bash
# S'assurer que .gitignore contient:
grep -E "\.env" .gitignore
```

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifications Automatiques

```bash
# Exécuter le script de vérification
./scripts/verify-deployment.sh https://your-production-url.com
```

### 2. Checklist Manuelle

#### A. Pages Publiques
- [ ] Landing page (/) charge correctement
- [ ] Page auth (/auth) accessible
- [ ] Pages légales accessibles (privacy, terms, etc.)
- [ ] Design responsive (mobile, tablet, desktop)

#### B. Authentification
- [ ] Signup fonctionne (créer compte test)
- [ ] Email vérification reçu
- [ ] Login fonctionne
- [ ] Redirection post-auth correcte
- [ ] Logout fonctionne

#### C. Onboarding
- [ ] Wizard profil accessible
- [ ] Auto-save fonctionne (rafraîchir page)
- [ ] Validation étapes OK
- [ ] Upload photos fonctionne
- [ ] Complétion profil redirige vers dashboard

#### D. Features Premium
- [ ] Browse page affiche profils
- [ ] Scores compatibilité calculés (fuzzy matching)
- [ ] Système de likes fonctionne
- [ ] Matches mutuels détectés
- [ ] Chat accessible (avec premium)
- [ ] Modération messages active

#### E. Paiements
- [ ] Page settings → Premium accessible
- [ ] Stripe checkout fonctionne (mode test)
- [ ] Callback success/cancel OK
- [ ] Historique paiements visible
- [ ] Téléchargement factures PDF fonctionne

#### F. Performance
- [ ] Lighthouse score > 80
- [ ] Temps chargement initial < 3s
- [ ] Images optimisées
- [ ] Console sans erreurs critiques

### 3. Tests de Charge (Optionnel)

```bash
# Installer k6
brew install k6  # macOS
# ou https://k6.io/docs/getting-started/installation/

# Exécuter test de charge
k6 run scripts/load-test.js
```

### 4. Monitoring Actif

**Configurer Sentry:**
```bash
# S'assurer que Sentry DSN est configuré
# Tester en déclenchant une erreur volontaire
# Vérifier que l'erreur apparaît dans Sentry Dashboard
```

**Configurer Supabase Alerts:**
- Dashboard Supabase → Database → Logs
- Activer alertes pour erreurs critiques
- Configurer webhook notifications (optionnel)

---

## 📊 Monitoring & Maintenance

### Métriques à Suivre

#### Supabase Dashboard
- **Database:** Connections actives, query performance
- **Auth:** Taux signup, taux vérification email
- **Storage:** Utilisation espace, uploads réussis
- **Functions:** Invocations, erreurs

#### Sentry Dashboard
- **Errors:** Taux erreurs, types erreurs
- **Performance:** Temps chargement pages
- **Releases:** Tracking versions déployées

#### Analytics (Google Analytics / Mixpanel)
- **Acquisition:** Sources trafic, conversions
- **Engagement:** Pages vues, temps session
- **Retention:** Utilisateurs actifs quotidiens/hebdo
- **Conversion:** Taux signup → premium

### Alertes Recommandées

**Critiques (Notification immédiate):**
- Taux erreur > 5%
- Temps réponse API > 2s
- Database connexions > 80% capacity
- Paiement échoué pour raison technique

**Importantes (Email quotidien):**
- Nouvelles inscriptions < baseline
- Taux conversion premium en baisse
- Contenu modéré > 10 violations/jour

### Maintenance Régulière

**Quotidien:**
- [ ] Vérifier dashboard Sentry (erreurs nouvelles)
- [ ] Vérifier logs Supabase (erreurs auth/db)
- [ ] Vérifier queue modération (contenu flaggé)

**Hebdomadaire:**
- [ ] Analyser métriques engagement
- [ ] Backup manuel base de données
- [ ] Review incidents Sentry résolus
- [ ] Vérifier mise à jour dépendances sécurité

**Mensuel:**
- [ ] Audit performance (Lighthouse)
- [ ] Review logs accès (patterns inhabituels)
- [ ] Optimiser requêtes lentes (Supabase slow queries)
- [ ] Mise à jour dépendances mineures
- [ ] Review feedback utilisateurs

---

## 🔄 Rollback en Cas de Problème

### Vercel Rollback

```bash
# Lister les déploiements
vercel ls

# Rollback au déploiement précédent
vercel rollback [deployment-url]

# Ou via Dashboard:
# Deployments → Sélectionner déploiement stable → Promote to Production
```

### Netlify Rollback

```bash
# Via Dashboard:
# Deploys → Sélectionner ancien deploy → Publish deploy

# Ou via CLI
netlify deploy --prod --dir=dist
```

### Rollback Supabase Migrations

```bash
# Créer une migration inverse
supabase migration new rollback_[nom_migration]

# Éditer la migration pour faire DROP au lieu de CREATE
# Exemple:
DROP INDEX IF EXISTS idx_profiles_gender;
DROP TABLE IF EXISTS moderation_violations;
DROP TABLE IF EXISTS moderation_rules;

# Appliquer le rollback
supabase db push
```

### Plan d'Urgence

**En cas de problème critique en production:**

1. **Immédiat (< 5 min):**
   - Rollback au déploiement précédent stable
   - Annoncer incident sur status page
   - Activer mode maintenance si nécessaire

2. **Court terme (< 1h):**
   - Identifier la cause (logs Sentry/Supabase)
   - Fixer sur branche hotfix
   - Tester localement
   - Déployer hotfix

3. **Post-incident:**
   - Documenter incident (cause, impact, résolution)
   - Créer tickets pour prévenir récurrence
   - Mise à jour runbook si nécessaire

---

## 🎯 Checklist Finale Pré-Déploiement

### Code & Build
- [x] Build production réussi sans warnings
- [x] 98/98 tests automatisés passent
- [x] Pas d'erreurs TypeScript
- [x] Code review complet effectué
- [x] Documentation à jour

### Configuration
- [ ] Variables environnement production configurées
- [ ] Supabase project lié correctement
- [ ] Migrations base de données appliquées
- [ ] Seeds de modération exécutés
- [ ] RLS activé sur toutes tables sensibles
- [ ] Storage buckets configurés

### Sécurité
- [ ] Pas de secrets hardcodés
- [ ] .env* dans .gitignore
- [ ] HTTPS activé (certificat SSL)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé (API Supabase)

### Monitoring
- [ ] Sentry DSN configuré
- [ ] Error tracking actif
- [ ] Performance monitoring activé
- [ ] Alertes configurées

### Backup
- [ ] Backup automatique Supabase activé
- [ ] Point de restauration créé avant déploiement
- [ ] Plan de rollback documenté

### Communication
- [ ] Équipe informée du déploiement
- [ ] Status page mise à jour (si applicable)
- [ ] Documentation utilisateur à jour

---

## 📞 Support & Ressources

### Documentation
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Netlify:** https://docs.netlify.com
- **Vite:** https://vitejs.dev/guide/

### Aide Dépannage

**Erreur: "Failed to fetch"**
- Vérifier CORS dans Supabase
- Vérifier URL Supabase correcte
- Vérifier anon key valide

**Erreur: "Row Level Security Policy Violation"**
- Vérifier policies RLS configurées
- Vérifier auth.uid() retourne valeur
- Tester requêtes via SQL Editor

**Build échoue sur Vercel/Netlify**
- Vérifier Node version (18+)
- Vérifier variables env configurées
- Vérifier commandes build dans settings

**Performance lente**
- Vérifier index base de données appliqués
- Analyser slow queries Supabase
- Vérifier bundle size (npm run build)
- Activer compression serveur

---

## ✅ Statut Déploiement

Une fois le déploiement terminé, mettre à jour:

```
Date Déploiement: [À remplir]
URL Production: [À remplir]
Version: 1.0.0
Déployé par: [À remplir]
Statut: [ ] Succès  [ ] Échec  [ ] Rollback

Vérifications:
[ ] Build réussi
[ ] Migrations appliquées
[ ] Tests passent
[ ] Site accessible
[ ] Features fonctionnelles
[ ] Monitoring actif

Notes:
[Ajouter notes spécifiques au déploiement]
```

---

**Prêt pour le déploiement ! 🚀**

Suivez ce guide étape par étape et n'hésitez pas à consulter les logs en cas de problème.
