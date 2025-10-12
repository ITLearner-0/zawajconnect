# 🧪 Test des Emails avec SMTP Hostinger

## Configuration Détectée

✅ **SMTP Host**: smtp.hostinger.com  
✅ **Port**: 465 (SSL)  
✅ **Username**: contact@zawajconnect.me  
✅ **From Email**: contact@zawajconnect.me

---

## 🚀 Test Rapide - Envoyer un Email de Test

### Option 1: Via SQL Editor (Recommandé)

Ouvrez le SQL Editor: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/sql/new

```sql
-- Test d'envoi d'email de bienvenue
-- ⚠️ Remplacez votre-email@example.com par votre vraie adresse email

SELECT net.http_post(
  url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-welcome-email',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAwNTk5NiwiZXhwIjoyMDcyNTgxOTk2fQ.aWbM0A7-_DgWA8H6jMzvSKNggfwUgl_eO20qLaq6D6c'
  ),
  body := jsonb_build_object(
    'userId', gen_random_uuid()::text,
    'email', 'votre-email@example.com',  -- ⚠️ CHANGEZ ICI
    'fullName', 'Test User'
  )
) as request_id;
```

**Résultat attendu:**
- Une ligne avec un `request_id`
- Un email reçu dans votre boîte mail en quelques secondes

---

### Option 2: Test de Notification de Match

```sql
-- Test d'email de match
SELECT net.http_post(
  url := 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/send-match-notification',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAwNTk5NiwiZXhwIjoyMDcyNTgxOTk2fQ.aWbM0A7-_DgWA8H6jMzvSKNggfwUgl_eO20qLaq6D6c'
  ),
  body := jsonb_build_object(
    'recipientEmail', 'votre-email@example.com',  -- ⚠️ CHANGEZ ICI
    'recipientName', 'Test User',
    'matchName', 'Sarah',
    'matchId', gen_random_uuid()::text
  )
) as request_id;
```

---

## 📊 Vérifier les Logs

### 1. Logs des Edge Functions

**send-welcome-email**:
https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/send-welcome-email/logs

**send-match-notification**:
https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/send-match-notification/logs

**Ce que vous devriez voir:**
```
✅ Sending welcome email to: votre-email@example.com
✅ Email sent successfully to votre-email@example.com
```

**En cas d'erreur:**
```
❌ SMTP configuration missing
❌ Authentication failed
❌ Connection timeout
```

### 2. Logs de Requêtes HTTP

```sql
-- Voir les dernières tentatives d'envoi d'emails
SELECT 
  id,
  created_at,
  status_code,
  content::text as response
FROM net._http_response
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔍 Diagnostic des Problèmes

### Problème 1: "SMTP configuration missing"

**Solution:**
1. Allez dans Edge Functions Secrets: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/functions
2. Ajoutez ces secrets:
   - `SMTP_HOST`: smtp.hostinger.com
   - `SMTP_PORT`: 465
   - `SMTP_USER`: contact@zawajconnect.me
   - `SMTP_PASSWORD`: [votre mot de passe]
   - `SMTP_FROM_EMAIL`: contact@zawajconnect.me
   - `SMTP_FROM_NAME`: Mariage-Halal

### Problème 2: "Authentication failed"

**Causes possibles:**
- Mot de passe SMTP incorrect
- Compte email suspendu ou inactif
- Authentification 2FA activée (désactiver pour SMTP)

**Solution:**
Vérifiez dans Hostinger que l'email est actif et que le mot de passe est correct.

### Problème 3: "Connection timeout"

**Causes possibles:**
- Firewall bloquant le port 465
- Serveur SMTP Hostinger indisponible
- Mauvaise configuration du port

**Solutions à tester:**
```
# Essayer le port 587 (TLS) au lieu de 465 (SSL)
SMTP_PORT=587

# Essayer avec STARTTLS
SMTP_TLS=true
```

### Problème 4: Email envoyé mais non reçu

**Vérifications:**
1. ✅ Regardez dans vos **Spams/Courriers indésirables**
2. ✅ Vérifiez que le domaine zawajconnect.me a des **enregistrements SPF/DKIM**
3. ✅ Consultez les logs Hostinger pour voir si l'email a été envoyé

**Configuration DNS recommandée (chez Hostinger):**
```
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:_spf.hostinger.com ~all

# DKIM Record
Disponible dans: Hostinger Panel > Email > DKIM Settings

# DMARC Record
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:contact@zawajconnect.me
```

---

## ✅ Checklist de Validation

- [ ] Les secrets SMTP sont configurés dans Edge Functions
- [ ] Les edge functions sont déployées (automatique avec le code)
- [ ] Test d'email de bienvenue fonctionne
- [ ] Test d'email de match fonctionne
- [ ] Email reçu dans la boîte de réception (pas spam)
- [ ] Les logs ne montrent pas d'erreurs
- [ ] Les 6 cron jobs sont actifs et utilisent SMTP

---

## 🎯 Prochaines Étapes

Une fois les tests réussis:

1. ✅ **Tester les cron jobs** (voir `TESTING_AND_MONITORING_CRON.md`)
2. ✅ **Configurer SPF/DKIM** pour éviter les spams
3. ✅ **Surveiller les logs** régulièrement
4. ✅ **Créer des templates d'emails personnalisés**

---

## 📧 Contenu des Emails de Test

### Email de Bienvenue
- **Subject**: Bienvenue sur Mariage-Halal ! 🌙
- **Content**: Message de bienvenue + CTA "Compléter mon profil"
- **Design**: Header violet gradient + sections claires

### Email de Match
- **Subject**: 🎉 Nouveau match mutuel !
- **Content**: Notification de match + CTA "Commencer la conversation"
- **Design**: Header vert gradient + conseils islamiques

---

## 🆘 Support

En cas de problème persistant:
1. Vérifiez les logs des Edge Functions
2. Testez manuellement avec `curl`
3. Contactez le support Hostinger si problème côté serveur
4. Vérifiez que le compte email est actif et non suspendu
