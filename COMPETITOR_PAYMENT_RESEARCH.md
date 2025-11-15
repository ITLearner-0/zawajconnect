# Recherche des Processeurs de Paiement - Concurrents

**Date:** Janvier 2025  
**Objectif:** Identifier les processeurs de paiement utilisés par les plateformes matrimoniales musulmanes concurrentes

---

## 🔍 Résultats de la Recherche

### 1. **Muzz** (Anciennement Muzmatch)

- **Site:** https://muzz.com
- **Processeur identifié:** **Apple App Store & Google Play Store (In-App Purchases)**
- **Méthode:** Apple Pay et Google Pay
- **Statut:** ✅ Confirmé

**Détails:**

- Muzz utilise exclusivement les systèmes de paiement intégrés aux stores mobiles
- Citation de leur support: _"Apple/Google handle all payments and subscriptions, and Muzz is regrettably unable to intervene."_
- Les remboursements passent directement par Apple ou Google
- **Ils n'utilisent PAS Stripe** - tout passe par les app stores
- Plus de 500,000 mariages enregistrés
- Offre Gold à environ £14.99-24.99/mois

**Conclusion:** Muzz contourne le problème de Stripe en utilisant uniquement les paiements in-app des stores mobiles. Cela évite la classification "dating service" de Stripe.

---

### 2. **SingleMuslim.com**

- **Site:** https://singlemuslim.com
- **Processeur identifié:** ❓ **Non divulgué publiquement**
- **Méthode:** Cartes de crédit via "secure online payment gateway"
- **Statut:** ⚠️ Information non confirmée

**Détails:**

- Accepte les paiements par carte de crédit
- Mentionne une "secure online payment gateway" sans nommer le fournisseur
- Service établi depuis longtemps (UK-based)
- Offre des abonnements Gold mensuels et annuels

**Possibilités:**

- Pourrait utiliser Worldpay, Adyen, ou un processeur européen
- Peut-être un processeur spécialisé UK/EU
- Potentiellement un agreement spécial avec Stripe (ancien compte)

---

### 3. **Zawaj-Sounnah.com / ZS-MySpace.com**

- **Site:** https://zawaj-sounnah.com et https://zs-myspace.com
- **Processeur identifié:** ❓ **Non visible publiquement**
- **Statut:** ⚠️ Information non accessible

**Détails:**

- Plateforme francophone lancée en 2021
- Plus de 2000 membres, ~620 mariages
- Service payant (mentionné dans leur blog)
- L'espace membre (zs-myspace.com) nécessite une connexion
- Prix non affichés publiquement sur le site principal

**Note:** La plateforme a écrit un article défendant son modèle payant, suggérant qu'ils ont un système de paiement actif.

---

### 4. **EbeneZawaj.com**

- **Site:** https://app.ebenezawaj.com
- **Processeur identifié:** ❓ **Non visible publiquement**
- **Statut:** ⚠️ Information non accessible

**Détails:**

- Plateforme matrimoniale avec interface en français
- Inscription gratuite visible
- Aucune information de tarification sur la page d'accueil
- Copyright "LoveDate" (2024)

---

## 📊 Synthèse Comparative

| Plateforme        | Processeur          | Méthode         | Confirmé        |
| ----------------- | ------------------- | --------------- | --------------- |
| **Muzz**          | Apple/Google Stores | In-App Purchase | ✅ Oui          |
| **SingleMuslim**  | Non divulgué        | Carte de crédit | ⚠️ Non confirmé |
| **Zawaj-Sounnah** | Non accessible      | Inconnu         | ❌ Non          |
| **EbeneZawaj**    | Non accessible      | Inconnu         | ❌ Non          |

---

## 💡 Insights Clés

### 1. **Stratégie Mobile-First**

**Muzz évite complètement Stripe** en passant par les app stores. C'est une solution qui:

- ✅ Contourne les restrictions "dating service"
- ✅ Utilise des processeurs acceptés (Apple Pay, Google Pay)
- ✅ Simplifie la gestion des abonnements
- ❌ Nécessite une application mobile (pas de web-based checkout)
- ❌ Apple et Google prennent 15-30% de commission

### 2. **Processeurs Européens Alternatifs**

Plusieurs options potentiellement acceptables:

- **Mollie** (Pays-Bas) - Très populaire en Europe
- **Adyen** (Pays-Bas) - Utilisé par de grandes entreprises
- **GoCardless** (UK) - Spécialisé en prélèvements
- **PayPal/Braintree** - Largement accepté

### 3. **Discrétion des Concurrents**

Observation intéressante: **aucune plateforme ne divulgue publiquement son processeur de paiement** (sauf Muzz qui utilise les stores). Cela suggère:

- Soit ils ont des accords spéciaux/grandfathered
- Soit ils utilisent des processeurs moins connus
- Soit ils cachent cette info pour des raisons stratégiques

---

## 🎯 Recommandations pour Zawaj-Connect

### Option 1: Approche Mobile (Comme Muzz)

**Développer une application mobile** avec paiements in-app:

- Utiliser Apple App Store et Google Play Store
- Contourne complètement le problème Stripe
- Commission: 15-30%

### Option 2: Processeurs Européens

**Mollie** semble être l'alternative la plus prometteuse:

- Basé aux Pays-Bas, accepte les entreprises EU
- Support multi-devises (EUR, GBP, etc.)
- Commissions compétitives (~1.4% + €0.25)
- API moderne et facile à intégrer
- **Recherche nécessaire:** Vérifier leur politique sur les sites matrimoniaux

### Option 3: Paddle ou Lemon Squeezy

**Merchant of Record** solutions:

- Gèrent toute la conformité fiscale
- Peuvent être plus flexibles sur les catégories
- Commission plus élevée (~5% + frais)

### Option 4: Contact Direct avec SingleMuslim

**Action recommandée:** Contacter SingleMuslim directement (via LinkedIn ou email) pour leur demander quel processeur ils utilisent. En tant qu'acteur établi dans le même secteur, ils pourraient partager l'information.

---

## 📝 Prochaines Étapes Suggérées

1. **Immédiat:**
   - ✅ Recherche effectuée
   - 🔄 Tester une inscription sur Mollie pour voir leurs catégories acceptées
   - 🔄 Contacter le support de Paddle pour leur politique

2. **Court terme:**
   - Développer une version mobile pour utiliser Apple/Google Pay
   - Intégrer un processeur alternatif (Mollie/Paddle/PayPal)
   - Configurer des paiements SEPA en solution temporaire

3. **Long terme:**
   - Re-contacter Stripe dans 6-12 mois après croissance
   - Démontrer 500+ mariages légitimes
   - Présenter des métriques claires (taux de remboursement <2%, etc.)

---

## 📞 Contacts Utiles

**Mollie Support:** https://www.mollie.com/contact  
**Paddle Support:** https://www.paddle.com/contact  
**PayPal Business:** https://www.paypal.com/business

**SingleMuslim (pour info):** Via leur formulaire de contact ou réseaux sociaux
