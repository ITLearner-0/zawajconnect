# Guide de Configuration Braintree - Étape par Étape

## Prérequis
- Un compte Braintree (gratuit pour commencer)
- Accès au tableau de bord Supabase de votre projet

---

## Étape 1: Créer un Compte Braintree

1. Allez sur [Braintree](https://www.braintreepayments.com/)
2. Cliquez sur **"Sign Up"**
3. Remplissez le formulaire d'inscription
4. Activez votre compte via email

---

## Étape 2: Récupérer vos Identifiants API

1. Connectez-vous au [Braintree Control Panel](https://www.braintreegateway.com/login)
2. Allez dans **Settings** → **API Keys**
3. Vous verrez vos identifiants:
   - **Merchant ID**
   - **Public Key**
   - **Private Key**

⚠️ **IMPORTANT**: Gardez ces identifiants en sécurité, ne les partagez jamais!

---

## Étape 3: Créer les Plans de Souscription

1. Dans le Control Panel, allez dans **Recurring Billing** → **Plans**
2. Cliquez sur **Create New Plan**

### Plan 3 mois
- **Plan ID**: `premium_3_months`
- **Name**: Abonnement 3 mois
- **Price**: 29.99 EUR
- **Billing Frequency**: Every 3 months
- **Number of Billing Cycles**: Leave blank for ongoing subscription

### Plan 6 mois
- **Plan ID**: `premium_6_months`
- **Name**: Abonnement 6 mois
- **Price**: 49.99 EUR
- **Billing Frequency**: Every 6 months

### Plan 12 mois
- **Plan ID**: `premium_12_months`
- **Name**: Abonnement 12 mois
- **Price**: 79.99 EUR
- **Billing Frequency**: Every 12 months

---

## Étape 4: Configurer les Secrets dans Supabase

Vous devez configurer ces secrets:

1. **BRAINTREE_MERCHANT_ID** - Votre Merchant ID
2. **BRAINTREE_PUBLIC_KEY** - Votre Public Key
3. **BRAINTREE_PRIVATE_KEY** - Votre Private Key
4. **BRAINTREE_ENVIRONMENT** - `sandbox` pour les tests, `production` pour la prod

---

## Étape 5: Tester l'Intégration

### Cartes de test en Sandbox

Braintree fournit des cartes de test:
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **CVV**: N'importe quel 3 chiffres
- **Expiration**: N'importe quelle date future

---

## Étape 6: Passer en Production

Une fois vos tests terminés:

1. Activez votre compte marchand dans le Control Panel
2. Obtenez vos identifiants de production
3. Remplacez les secrets dans Supabase:
   - Utilisez les identifiants de production
   - Changez `BRAINTREE_ENVIRONMENT` en `production`

---

## Prix Recommandés

Voici des suggestions de prix pour vos plans:

- **3 mois**: 29.99 EUR (soit 10€/mois)
- **6 mois**: 49.99 EUR (soit 8.33€/mois - économie de 17%)
- **12 mois**: 79.99 EUR (soit 6.67€/mois - économie de 33%)

Ajustez selon votre marché et vos besoins!

---

## Support

- **Documentation Braintree**: https://developer.paypal.com/braintree/docs
- **Support Braintree**: Disponible via le Control Panel
- **Logs des Edge Functions**: Dans votre dashboard Supabase
