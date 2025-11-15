# Configuration SMTP Hostinger pour les Edge Functions

## 📧 Étape 1: Configurer les Secrets SMTP dans Supabase

Vous devez ajouter ces secrets dans vos Edge Functions:

1. **Accédez aux secrets**: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/functions

2. **Ajoutez ces secrets**:

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASSWORD=votre-mot-de-passe-email
SMTP_FROM_EMAIL=noreply@votre-domaine.com
SMTP_FROM_NAME=Zawaj Connect
```

### Détails pour Hostinger

- **SMTP_HOST**: `smtp.hostinger.com`
- **SMTP_PORT**:
  - `465` pour SSL (recommandé)
  - `587` pour TLS
  - `25` pour non-sécurisé (non recommandé)
- **SMTP_USER**: Votre adresse email complète (ex: `contact@votre-domaine.com`)
- **SMTP_PASSWORD**: Le mot de passe de votre compte email
- **SMTP_FROM_EMAIL**: L'adresse d'expédition (ex: `noreply@votre-domaine.com`)
- **SMTP_FROM_NAME**: Le nom affiché comme expéditeur (ex: `Zawaj Connect`)

## 🔒 Sécurité

⚠️ **Important**:

- Ne jamais mettre ces informations directement dans le code
- Utilisez toujours les secrets de Supabase Edge Functions
- Ces secrets sont chiffrés et sécurisés par Supabase

## 🧪 Test de Configuration

Une fois les secrets configurés, vous pouvez tester l'envoi d'email avec:

```sql
-- Via SQL Editor
SELECT net.http_post(
  url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-welcome-email',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAwNTk5NiwiZXhwIjoyMDcyNTgxOTk2fQ.aWbM0A7-_DgWA8H6jMzvSKNggfwUgl_eO20qLaq6D6c'
  ),
  body := jsonb_build_object(
    'userId', 'test-user-id',
    'email', 'votre-email-test@example.com',
    'fullName', 'Test User'
  )
);
```

## 📝 Vérification

Pour vérifier que tout fonctionne:

1. Les secrets sont bien configurés ✅
2. Les edge functions sont déployées ✅
3. Un email de test arrive dans la boîte mail ✅
4. Les logs des edge functions ne montrent pas d'erreurs ✅

## ⚡ Migration depuis Resend

Les nouvelles fonctions utilisent SMTP au lieu de Resend:

- ❌ Ancienne méthode: `Resend API`
- ✅ Nouvelle méthode: `SMTP Hostinger`

Avantages:

- ✅ Pas de dépendance externe (Resend)
- ✅ Utilisation de votre propre serveur email
- ✅ Plus de contrôle sur les emails envoyés
- ✅ Pas de limite d'API externe
