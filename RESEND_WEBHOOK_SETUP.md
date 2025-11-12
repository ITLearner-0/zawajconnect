# Configuration du Webhook Resend

## 📋 Vue d'ensemble

Ce guide explique comment configurer le webhook Resend pour tracker automatiquement les statuts de livraison des emails envoyés aux Walis.

## 🔧 Configuration du Webhook dans Resend

### 1. Accéder aux Webhooks Resend

1. Connectez-vous à votre compte Resend: https://resend.com/login
2. Accédez à **Settings** > **Webhooks**
3. Cliquez sur **Add Webhook**

### 2. Configurer l'URL du Webhook

**URL du Webhook:**

```
https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/resend-webhook
```

### 3. Sélectionner les Événements

Cochez les événements suivants pour être notifié:

- ✅ **email.sent** - Email envoyé avec succès
- ✅ **email.delivered** - Email délivré au destinataire
- ✅ **email.opened** - Email ouvert par le destinataire
- ✅ **email.clicked** - Lien cliqué dans l'email
- ✅ **email.bounced** - Email rejeté (bounce)
- ✅ **email.complained** - Plainte pour spam
- ⚠️ **email.delivery_delayed** - (Optionnel) Livraison retardée

### 4. Récupérer le Secret de Signature

Une fois le webhook créé, Resend va générer un **Signing Secret**.

**IMPORTANT:** Ce secret a déjà été configuré dans les secrets de l'edge function sous le nom `RESEND_WEBHOOK_SECRET`.

Si vous devez le mettre à jour:

1. Copiez le secret depuis Resend Dashboard
2. Allez dans Supabase: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/functions
3. Mettez à jour le secret `RESEND_WEBHOOK_SECRET`

### 5. Tester le Webhook

Dans Resend, vous pouvez:

1. Cliquer sur **Send test event** pour envoyer un événement de test
2. Vérifier les logs de l'edge function pour confirmer la réception

## 📊 Événements Trackés

| Événement          | Description                              | Action                                                       |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------ |
| `email.sent`       | Email envoyé avec succès                 | Met à jour `delivery_status = 'sent'`                        |
| `email.delivered`  | Email délivré au serveur du destinataire | Met à jour `delivery_status = 'delivered'` et `delivered_at` |
| `email.opened`     | Email ouvert par le destinataire         | Met à jour `opened_at`                                       |
| `email.clicked`    | Lien cliqué dans l'email                 | Met à jour `clicked_at`                                      |
| `email.bounced`    | Email rejeté (bounce)                    | Met à jour `delivery_status = 'bounced'` et `error_message`  |
| `email.complained` | Plainte pour spam                        | Met à jour `delivery_status = 'failed'` et `error_message`   |

## 🔐 Sécurité

Le webhook utilise la vérification de signature Svix (utilisé par Resend) pour garantir:

- L'authenticité des requêtes (proviennent bien de Resend)
- L'intégrité des données (non modifiées en transit)
- Protection contre les attaques replay

La vérification se fait via:

1. Header `svix-signature` - Signature HMAC-SHA256
2. Header `svix-timestamp` - Timestamp de la requête
3. Header `svix-id` - ID unique de la requête

## 📝 Logs et Monitoring

### Vérifier les Logs

Accédez aux logs de l'edge function:
https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/resend-webhook/logs

### Événements Logués

Vous verrez des messages comme:

```
📨 Webhook Resend reçu: email.delivered pour email em_1234567890
✅ Email em_1234567890 mis à jour: email.delivered
```

### Erreurs Courantes

1. **"Missing webhook verification headers"**
   - Cause: Headers Svix manquants
   - Solution: Vérifier la configuration du webhook dans Resend

2. **"Invalid webhook signature"**
   - Cause: Secret incorrect ou expiré
   - Solution: Mettre à jour `RESEND_WEBHOOK_SECRET` avec le bon secret

3. **"Email not tracked in wali_email_history"**
   - Info: L'email n'est pas un email Wali
   - Action: Normal, aucune action requise

## 🔍 Vérifier les Mises à Jour

Pour vérifier que les webhooks fonctionnent:

1. **Envoyer un email de test:**

   ```sql
   SELECT * FROM wali_email_history
   WHERE resend_email_id = 'em_VOTRE_EMAIL_ID'
   ORDER BY sent_at DESC;
   ```

2. **Vérifier les statuts:**
   - `delivery_status` devrait passer de `pending` → `sent` → `delivered`
   - `opened_at` et `clicked_at` seront remplis quand l'utilisateur ouvre/clique

3. **Voir les statistiques:**
   ```sql
   SELECT
     COUNT(*) as total,
     COUNT(*) FILTER (WHERE delivery_status = 'delivered') as delivered,
     COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
     COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked
   FROM wali_email_history;
   ```

## 🚀 Prochaines Étapes

Une fois configuré, le système trackera automatiquement:

- ✅ Tous les emails envoyés aux Walis
- ✅ Leur statut de livraison en temps réel
- ✅ Les ouvertures et clics
- ✅ Les bounces et plaintes

Ces données seront visibles dans le dashboard admin via le bouton "Voir historique emails" de chaque alerte.

## 🆘 Support

Si vous rencontrez des problèmes:

1. **Vérifier les logs Supabase:**
   https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions/resend-webhook/logs

2. **Vérifier les webhooks Resend:**
   https://resend.com/webhooks

3. **Tester manuellement:**
   ```bash
   curl -X POST https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/resend-webhook \
     -H "Content-Type: application/json" \
     -H "svix-id: test_123" \
     -H "svix-timestamp: $(date +%s)" \
     -H "svix-signature: v1,test_signature" \
     -d '{"type":"email.delivered","data":{"email_id":"test"}}'
   ```

## 📚 Ressources

- [Documentation Resend Webhooks](https://resend.com/docs/dashboard/webhooks/introduction)
- [Documentation Svix](https://docs.svix.com/receiving/verifying-payloads/how)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
