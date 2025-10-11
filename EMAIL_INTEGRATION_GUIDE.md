# 📧 Guide d'intégration des E-mails

## Vue d'ensemble

Ce guide explique comment utiliser le système d'envoi d'e-mails automatiques de Mariage-Halal, basé sur **Resend**.

---

## 🎯 E-mails automatiques disponibles

### 1. E-mail de bienvenue (`send-welcome-email`)

**Déclenché :** Lors de l'inscription d'un nouvel utilisateur

**Contenu :**
- Message de bienvenue personnalisé
- Guide des prochaines étapes
- Bouton CTA vers l'onboarding
- Conseils pour optimiser le profil

**Utilisation dans le code :**

```typescript
import { supabase } from "@/integrations/supabase/client";

// Après l'inscription réussie
const { data: user } = await supabase.auth.getUser();

if (user) {
  await supabase.functions.invoke('send-welcome-email', {
    body: {
      userId: user.id,
      email: user.email,
      fullName: user.user_metadata.full_name
    }
  });
}
```

---

### 2. E-mail de match mutuel (`send-match-notification`)

**Déclenché :** Quand deux utilisateurs ont un match mutuel

**Contenu :**
- Annonce du nouveau match
- Présentation du match
- Bouton CTA vers le chat
- Rappel des bonnes pratiques

**Utilisation dans le code :**

```typescript
import { supabase } from "@/integrations/supabase/client";

// Quand un match devient mutuel
await supabase.functions.invoke('send-match-notification', {
  body: {
    recipientEmail: recipient.email,
    recipientName: recipient.full_name,
    matchName: match.full_name,
    matchId: match.id
  }
});
```

---

## 🔧 Intégration technique

### Configuration requise

1. **Secret Resend** : Déjà configuré (`RESEND_API_KEY`)
2. **Edge Functions** : Déjà déployées automatiquement
3. **Variables d'environnement** :
   - `RESEND_API_KEY` : Clé API Resend
   - `SUPABASE_URL` : URL du projet Supabase

### Appel depuis le frontend

```typescript
// Exemple générique
const { data, error } = await supabase.functions.invoke('nom-fonction', {
  body: {
    // Paramètres requis
  }
});

if (error) {
  console.error('Erreur envoi email:', error);
  toast.error("Erreur lors de l'envoi de l'email");
} else {
  console.log('Email envoyé:', data);
}
```

---

## 📝 E-mails à implémenter (exemples)

### 1. Dans le trigger d'inscription

**Fichier :** `src/pages/Auth.tsx`

```typescript
// Après signUp réussi
const handleSignUp = async (values) => {
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        terms_accepted_at: new Date().toISOString(),
        terms_version: '1.0'
      }
    }
  });

  if (!error && data.user) {
    // Envoyer l'email de bienvenue
    await supabase.functions.invoke('send-welcome-email', {
      body: {
        userId: data.user.id,
        email: data.user.email,
        fullName: values.fullName
      }
    });
  }
};
```

### 2. Dans la fonction de match

**Fichiers :** `src/pages/Browse.tsx` et `src/pages/Profile.tsx`

```typescript
// Quand un match devient mutuel
const handleLike = async (userId: string) => {
  try {
    // ... logique de création/mise à jour du match ...
    
    // Si le match est devenu mutuel, envoyer les notifications
    if (isNowMutual && match?.id) {
      // La fonction send-match-notifications gère automatiquement
      // l'envoi aux DEUX utilisateurs du match de manière sécurisée
      const { error: emailError } = await supabase.functions.invoke(
        'send-match-notifications',
        { body: { matchId: match.id } }
      );
      
      if (emailError) {
        console.error('Erreur notification email:', emailError);
      } else {
        console.log('Emails de match envoyés aux deux utilisateurs');
      }
    }
  } catch (err) {
    console.error('Erreur:', err);
  }
};
```

**Note importante :** La fonction `send-match-notifications` (avec un "s") récupère automatiquement les emails des deux utilisateurs via la service role key et envoie les notifications aux deux parties. Pas besoin d'appeler la fonction deux fois.

---

## 🎨 Personnalisation des templates

Les templates HTML sont dans les edge functions. Pour modifier :

1. **Éditer le fichier de la fonction** (ex: `supabase/functions/send-welcome-email/index.ts`)
2. **Modifier la section HTML** dans `resend.emails.send()`
3. **Les changements sont déployés automatiquement**

### Structure des templates :

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Meta tags -->
</head>
<body style="inline styles">
  <table> <!-- Structure email -->
    <!-- Header avec gradient -->
    <!-- Contenu principal -->
    <!-- Footer -->
  </table>
</body>
</html>
```

---

## 🚀 Bonnes pratiques

### 1. Gestion des erreurs

```typescript
try {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { /* ... */ }
  });
  
  if (error) throw error;
  
  console.log('Email envoyé:', data.messageId);
} catch (err) {
  console.error('Erreur email:', err);
  // Ne pas bloquer l'expérience utilisateur
  // Juste logger l'erreur
}
```

### 2. Éviter les doublons

```typescript
// Utiliser un flag local ou en DB
const [emailSent, setEmailSent] = useState(false);

if (!emailSent && shouldSendEmail) {
  await sendEmail();
  setEmailSent(true);
}
```

### 3. Logs et monitoring

Les edge functions loguent automatiquement :
- Succès de l'envoi
- Erreurs avec détails
- ID du message Resend

Consultez les logs : [Supabase Edge Functions Logs](https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions)

---

## 📧 Types d'e-mails recommandés (à implémenter)

### Priorité haute :
- ✅ **Bienvenue** : Implémenté dans `src/pages/Auth.tsx`
- ✅ **Match mutuel** : Implémenté dans `src/pages/Browse.tsx` et `src/pages/Profile.tsx`
- ✅ **Fin de conversation** : Implémenté dans `src/hooks/useConversationStatus.tsx`
- ✅ **Invitation famille** : Implémenté dans `src/components/FamilyInvitationForm.tsx` et `src/components/FamilyInvitationManager.tsx`

### Priorité moyenne :
- ✅ **Vérification d'identité approuvée** : Implémenté dans `src/hooks/useIslamicModeration.tsx` et `src/utils/verificationEmailTrigger.ts`
- ⏳ **Message important non lu (rappel)** : Edge function créée - Configuration Cron requise (voir `CRON_JOBS_SETUP.md`)
- ⏳ **Expiration abonnement Premium** : Edge function créée - Configuration Cron requise (voir `CRON_JOBS_SETUP.md`)
- ✅ **Notification modération** : Implémenté dans `src/hooks/useIslamicModeration.tsx` (envoi automatique)

### Comment utiliser les nouveaux emails (Priorité moyenne)

#### 1. Vérification d'identité approuvée ✅

**Implémentation automatique dans le système de modération :**

L'email de vérification est déjà intégré et se déclenche automatiquement via le fichier utilitaire :

```typescript
import { triggerVerificationApprovedEmail } from '@/utils/verificationEmailTrigger';

// Appeler quand un admin approuve une vérification
await triggerVerificationApprovedEmail(
  userId,
  'id', // 'email' | 'phone' | 'id'
  85 // Score de vérification
);
```

**Déclenchement automatique par seuils :**

```typescript
import { checkVerificationMilestone } from '@/utils/verificationEmailTrigger';

// Vérifie si un seuil a été atteint et envoie l'email approprié
await checkVerificationMilestone(userId, oldScore, newScore);
```

#### 2. Rappel de messages non lus ⏳

**Configuration requise :** Cron job (voir `CRON_JOBS_SETUP.md`)

Cette fonctionnalité nécessite la configuration d'une tâche programmée qui s'exécute quotidiennement.
L'edge function est prête, il suffit de configurer le cron job décrit dans le guide.

#### 3. Expiration d'abonnement Premium ⏳

**Configuration requise :** Cron job (voir `CRON_JOBS_SETUP.md`)

Cette fonctionnalité nécessite la configuration d'une tâche programmée pour envoyer des rappels :
- 7 jours avant expiration
- 3 jours avant expiration
- 1 jour avant expiration

L'edge function est prête, il suffit de configurer le cron job décrit dans le guide.

#### 4. Notification de modération ✅

**Implémentation automatique :**

L'email de modération est **déjà intégré** dans `src/hooks/useIslamicModeration.tsx` et s'envoie automatiquement :
- Quand un contenu est **bloqué** (severity: critical ou high selon confidence)
- Quand un contenu reçoit un **avertissement** avec confidence > 0.7 (severity: medium)

**Aucune action requise** - Le système fonctionne automatiquement !

### Priorité basse :
- ⏳ Newsletter mensuelle
- ⏳ Conseils hebdomadaires
- ⏳ Rappel de compléter le profil
- ⏳ Suggestions de profils compatibles

---

## 🔐 Sécurité

- ✅ Les edge functions ne nécessitent pas de JWT (verify_jwt = false)
- ✅ Validation des données d'entrée côté fonction
- ✅ Logs complets pour audit
- ✅ Rate limiting Resend (100 emails/jour en mode dev)

---

## 📊 Monitoring Resend

**Dashboard Resend :** https://resend.com/emails

Consultez :
- Taux de délivrabilité
- E-mails ouverts
- Clics sur les liens
- Bounces et rejets
- Logs d'erreurs

---

## 🆘 Support

**Problème d'envoi ?**

1. Vérifier la clé API Resend : [Settings](https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/functions)
2. Consulter les logs : [Edge Functions](https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/functions)
3. Vérifier le domaine validé sur Resend : [Domains](https://resend.com/domains)

**Erreur commune :**
```
Error: Domain not verified
```
→ Aller sur https://resend.com/domains et valider votre domaine

---

## 🎁 Template d'e-mail à créer

Pour créer un nouvel e-mail :

1. **Copier une fonction existante** (ex: `send-welcome-email`)
2. **Renommer** le dossier et la fonction
3. **Modifier le template HTML**
4. **Ajouter à `config.toml`** :

```toml
[functions.mon-nouvel-email]
verify_jwt = false
```

5. **Utiliser dans le code** :

```typescript
await supabase.functions.invoke('mon-nouvel-email', {
  body: { /* params */ }
});
```

---

**Dernière mise à jour :** 2025-01-05  
**Auteur :** Équipe Mariage-Halal
