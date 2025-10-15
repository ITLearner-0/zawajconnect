# Guide de Configuration PayPal - Étape par Étape

## Prérequis
- Un compte PayPal Business (gratuit)
- Accès au tableau de bord Supabase de votre projet

---

## Étape 1: Créer un Compte PayPal Business

1. Allez sur [PayPal Developer](https://developer.paypal.com/)
2. Cliquez sur **"Log in to Dashboard"** en haut à droite
3. Connectez-vous avec votre compte PayPal (ou créez-en un)
4. Une fois connecté, vous arrivez sur le tableau de bord développeur

---

## Étape 2: Créer une Application PayPal

1. Dans le menu de gauche, cliquez sur **"Apps & Credentials"**
2. Assurez-vous d'être sur l'onglet **"Sandbox"** (pour les tests) ou **"Live"** (pour la production)
3. Cliquez sur **"Create App"**
4. Donnez un nom à votre application (ex: "Mariage Halal Subscriptions")
5. Sélectionnez **"Merchant"** comme type d'application
6. Cliquez sur **"Create App"**

### Récupérer vos identifiants

Une fois l'application créée:
- **Client ID**: Visible directement sur la page
- **Secret**: Cliquez sur "Show" sous "Secret" pour le révéler

⚠️ **IMPORTANT**: Gardez ces identifiants en sécurité, ne les partagez jamais!

---

## Étape 3: Créer les Plans de Souscription

### 3.1 Accéder à l'interface de création de plans

1. Toujours sur [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Allez dans **"Apps & Credentials"**
3. Cliquez sur votre application créée précédemment
4. Descendez jusqu'à la section **"Features"**
5. Activez **"Subscriptions"** si ce n'est pas déjà fait

### 3.2 Créer les plans via l'API (Méthode recommandée)

Utilisez Postman ou curl pour créer vos plans. Voici comment:

#### A. Obtenir un token d'accès

```bash
curl -v -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -u "VOTRE_CLIENT_ID:VOTRE_SECRET" \
  -d "grant_type=client_credentials"
```

Vous recevrez un `access_token`. Copiez-le.

#### B. Créer un produit

```bash
curl -v -X POST https://api-m.sandbox.paypal.com/v1/catalogs/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -d '{
    "name": "Abonnement Premium Mariage Halal",
    "description": "Accès premium à toutes les fonctionnalités",
    "type": "SERVICE",
    "category": "SOFTWARE"
  }'
```

Vous recevrez un `product_id`. Copiez-le.

#### C. Créer le plan 3 mois

```bash
curl -v -X POST https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -d '{
    "product_id": "VOTRE_PRODUCT_ID",
    "name": "Abonnement 3 mois",
    "description": "Abonnement premium pour 3 mois",
    "billing_cycles": [
      {
        "frequency": {
          "interval_unit": "MONTH",
          "interval_count": 3
        },
        "tenure_type": "REGULAR",
        "sequence": 1,
        "total_cycles": 0,
        "pricing_scheme": {
          "fixed_price": {
            "value": "29.99",
            "currency_code": "EUR"
          }
        }
      }
    ],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "payment_failure_threshold": 3
    }
  }'
```

Copiez le `plan_id` retourné: **PAYPAL_PLAN_3_MONTHS**

#### D. Créer le plan 6 mois

```bash
curl -v -X POST https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -d '{
    "product_id": "VOTRE_PRODUCT_ID",
    "name": "Abonnement 6 mois",
    "description": "Abonnement premium pour 6 mois",
    "billing_cycles": [
      {
        "frequency": {
          "interval_unit": "MONTH",
          "interval_count": 6
        },
        "tenure_type": "REGULAR",
        "sequence": 1,
        "total_cycles": 0,
        "pricing_scheme": {
          "fixed_price": {
            "value": "49.99",
            "currency_code": "EUR"
          }
        }
      }
    ],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "payment_failure_threshold": 3
    }
  }'
```

Copiez le `plan_id` retourné: **PAYPAL_PLAN_6_MONTHS**

#### E. Créer le plan 12 mois

```bash
curl -v -X POST https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -d '{
    "product_id": "VOTRE_PRODUCT_ID",
    "name": "Abonnement 12 mois",
    "description": "Abonnement premium pour 12 mois",
    "billing_cycles": [
      {
        "frequency": {
          "interval_unit": "MONTH",
          "interval_count": 12
        },
        "tenure_type": "REGULAR",
        "sequence": 1,
        "total_cycles": 0,
        "pricing_scheme": {
          "fixed_price": {
            "value": "79.99",
            "currency_code": "EUR"
          }
        }
      }
    ],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "payment_failure_threshold": 3
    }
  }'
```

Copiez le `plan_id` retourné: **PAYPAL_PLAN_12_MONTHS**

### 3.3 Activer les plans

Pour chaque plan créé, vous devez l'activer:

```bash
curl -v -X POST https://api-m.sandbox.paypal.com/v1/billing/plans/PLAN_ID/activate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

Remplacez `PLAN_ID` par chaque ID de plan créé.

---

## Étape 4: Configurer les Secrets dans Supabase

Vous avez maintenant 5 secrets à configurer:

1. **PAYPAL_CLIENT_ID** - Le Client ID de votre application PayPal
2. **PAYPAL_CLIENT_SECRET** - Le Secret de votre application PayPal
3. **PAYPAL_PLAN_3_MONTHS** - L'ID du plan 3 mois
4. **PAYPAL_PLAN_6_MONTHS** - L'ID du plan 6 mois
5. **PAYPAL_PLAN_12_MONTHS** - L'ID du plan 12 mois

### Comment ajouter les secrets:

Pour chaque secret, je vais vous proposer de l'ajouter via Lovable. Dites-moi simplement "ajoute les secrets PayPal" et je vous guiderai pour chacun.

---

## Étape 5: Passer en Production

Une fois vos tests terminés en Sandbox:

1. Répétez les étapes 2 et 3 en sélectionnant **"Live"** au lieu de "Sandbox"
2. Utilisez l'URL de production: `https://api-m.paypal.com` (au lieu de `api-m.sandbox.paypal.com`)
3. Remplacez tous les secrets dans Supabase par les valeurs de production

---

## Vérification

Pour vérifier que tout fonctionne:

1. Allez sur votre page d'abonnement
2. Cliquez sur un plan
3. Vous devriez être redirigé vers PayPal
4. Complétez le paiement (en Sandbox, utilisez les comptes test PayPal)
5. Vous serez redirigé vers la page de succès

---

## Aide Supplémentaire

- **Documentation PayPal**: https://developer.paypal.com/docs/subscriptions/
- **Comptes test Sandbox**: https://developer.paypal.com/dashboard/accounts
- **Logs des Edge Functions**: Dans votre dashboard Supabase

---

## Prix Recommandés

Voici des suggestions de prix pour vos plans:

- **3 mois**: 29.99 EUR (soit 10€/mois)
- **6 mois**: 49.99 EUR (soit 8.33€/mois - économie de 17%)
- **12 mois**: 79.99 EUR (soit 6.67€/mois - économie de 33%)

Ajustez selon votre marché et vos besoins!
