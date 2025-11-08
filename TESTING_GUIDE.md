# Guide de Testing WebRTC - Pour Votre Équipe

**Important:** Ce guide est destiné à votre équipe de développement ou à toute personne ayant accès à l'environnement de développement local.

---

## 🎯 Options de Testing Disponibles

### Option 1: Testing Local (Développeur/Équipe)

**Qui:** Un développeur avec accès au repository et npm installé

**Prérequis:**
```bash
# Cloner le repository (si pas déjà fait)
git clone <votre-repo-url>
cd zawajconnect

# Checkout de la branche avec l'implémentation
git checkout claude/code-analysis-review-011CUpezU2yMpdA4Tw5Emid5

# Installer les dépendances
npm install
```

**Étapes de Test:**
```bash
# 1. Démarrer le serveur de développement
npm run dev

# 2. Le serveur démarre généralement sur http://localhost:5173 ou http://localhost:3000
# Vérifier la console pour l'URL exacte

# 3. Ouvrir DEUX onglets dans le même navigateur:
#    Onglet 1: http://localhost:5173
#    Onglet 2: http://localhost:5173

# 4. Se connecter dans chaque onglet avec des utilisateurs différents
#    - Onglet 1: Utilisateur A (exemple: test1@zawajconnect.com)
#    - Onglet 2: Utilisateur B (exemple: test2@zawajconnect.com)

# 5. S'assurer qu'il existe un match entre les deux utilisateurs
#    (Créer un match si nécessaire via l'interface admin)

# 6. Dans les DEUX onglets: Naviguer vers la page Chat
#    et ouvrir la conversation avec l'autre utilisateur

# 7. TEST APPEL AUDIO:
#    - Onglet 1: Cliquer sur l'icône 📞 (téléphone)
#    - Le navigateur demandera: "Autoriser l'accès au microphone?" → Accepter
#    - Onglet 2: Une notification d'appel entrant apparaîtra
#    - Onglet 2: Cliquer sur le bouton vert "Accepter"
#    - Le navigateur demandera: "Autoriser l'accès au microphone?" → Accepter
#    - RÉSULTAT ATTENDU: Les deux utilisateurs peuvent s'entendre

# 8. TEST APPEL VIDÉO:
#    - Onglet 1: Cliquer sur l'icône 📹 (caméra)
#    - Le navigateur demandera: "Autoriser caméra + micro?" → Accepter
#    - Onglet 2: Notification apparaît → Cliquer "Accepter"
#    - Le navigateur demandera: "Autoriser caméra + micro?" → Accepter
#    - RÉSULTAT ATTENDU: Les deux utilisateurs peuvent se voir et s'entendre

# 9. TEST DES CONTRÔLES:
#    - Pendant un appel actif:
#      - Cliquer sur l'icône micro → Son devrait se couper
#      - Cliquer sur l'icône caméra (vidéo) → Vidéo devrait se couper
#      - Cliquer sur le bouton rouge → Appel devrait se terminer

# 10. TEST DU REJET:
#    - Onglet 1: Initier un appel
#    - Onglet 2: Cliquer sur le bouton rouge "Refuser"
#    - RÉSULTAT ATTENDU: Onglet 1 reçoit notification de rejet
```

**Checklist de Validation:**
```
□ Appel audio fonctionne
□ Appel vidéo fonctionne
□ Notification d'appel entrant s'affiche
□ Sonnerie joue quand appel entrant
□ Bouton accepter fonctionne
□ Bouton refuser fonctionne
□ Toggle micro fonctionne
□ Toggle caméra fonctionne (vidéo)
□ Bouton terminer appel fonctionne
□ Timer de durée s'incrémente
□ Vidéo locale visible en PiP
□ Vidéo distante visible en plein écran
□ Cleanup automatique après fin d'appel
```

---

### Option 2: Testing en Staging/Production

**Qui:** Toute personne avec accès à l'environnement staging/production

**Prérequis:**
- ✅ Application déployée avec HTTPS (obligatoire pour WebRTC)
- ✅ Branche `claude/code-analysis-review-011CUpezU2yMpdA4Tw5Emid5` déployée

**Étapes:**
```bash
# 1. Merger la branche dans staging ou créer un déploiement de la branche
git checkout staging  # ou main, selon votre workflow
git merge claude/code-analysis-review-011CUpezU2yMpdA4Tw5Emid5

# 2. Déployer vers staging
# (Selon votre processus de déploiement - Vercel, Netlify, etc.)

# 3. Ouvrir deux NAVIGATEURS DIFFÉRENTS (ou mode incognito)
#    - Navigateur 1: User A
#    - Navigateur 2: User B

# 4. Suivre les mêmes étapes de test que ci-dessus
```

**⚠️ IMPORTANT pour Production:**
- HTTPS est **OBLIGATOIRE** (WebRTC ne fonctionne pas en HTTP)
- Les utilisateurs doivent autoriser micro/caméra
- Tester sur différents navigateurs (Chrome, Firefox, Safari)
- Tester sur mobile (Android Chrome, iOS Safari)

---

### Option 3: Tests Automatisés (Avancé)

**Pour l'avenir - Tests E2E avec Playwright/Cypress**

Créer des tests automatisés qui simulent deux utilisateurs:

```typescript
// Exemple de test E2E (à implémenter)
test('Audio call between two users', async () => {
  // User A initie appel
  await userA.page.click('[data-testid="audio-call-button"]');
  await userA.page.waitForSelector('[data-testid="calling-state"]');

  // User B accepte
  await userB.page.waitForSelector('[data-testid="incoming-call"]');
  await userB.page.click('[data-testid="accept-call-button"]');

  // Vérifier connexion établie
  await expect(userA.page.locator('[data-testid="call-state"]')).toHaveText('connected');
  await expect(userB.page.locator('[data-testid="call-state"]')).toHaveText('connected');
});
```

---

## 🔍 Scénarios de Test Spécifiques

### Test 1: Appel Audio Basique
```
1. User A ouvre chat avec User B
2. User A clique sur 📞
3. User A autorise micro
4. User B voit notification d'appel entrant
5. User B clique "Accepter"
6. User B autorise micro
7. ✅ Les deux s'entendent
8. User A parle → User B entend
9. User B parle → User A entend
10. Timer s'incrémente: 00:01, 00:02, 00:03...
11. User A clique "Terminer"
12. ✅ Appel se termine pour les deux
```

### Test 2: Appel Vidéo Complet
```
1. User A ouvre chat avec User B
2. User A clique sur 📹
3. User A autorise caméra + micro
4. User A voit sa propre vidéo en petit (PiP)
5. User B voit notification d'appel vidéo
6. User B clique "Accepter"
7. User B autorise caméra + micro
8. ✅ User A voit User B en grand écran
9. ✅ User B voit User A en grand écran
10. Les deux voient leur propre vidéo en PiP
11. User A toggle caméra OFF
12. ✅ User B ne voit plus User A (écran noir/avatar)
13. User A toggle caméra ON
14. ✅ User B voit de nouveau User A
15. User B clique "Terminer"
16. ✅ Appel se termine pour les deux
```

### Test 3: Rejet d'Appel
```
1. User A clique sur 📞
2. User B voit notification
3. User B clique "Refuser" (bouton rouge)
4. ✅ User A reçoit notification "Appel rejeté"
5. ✅ Les deux reviennent au chat normal
```

### Test 4: Timeout Automatique
```
1. User A clique sur 📞
2. User B voit notification
3. User B ne fait RIEN
4. Attendre 30 secondes
5. ✅ Notification disparaît automatiquement
6. ✅ User A reçoit notification de timeout/rejet
```

### Test 5: Contrôles Pendant Appel
```
1. Établir un appel vidéo
2. User A clique sur icône micro (mute)
3. ✅ User B ne doit plus entendre User A
4. User A clique de nouveau (unmute)
5. ✅ User B entend de nouveau
6. User A clique sur icône caméra
7. ✅ User B ne voit plus la vidéo de A
8. User A clique de nouveau
9. ✅ User B voit de nouveau la vidéo
```

---

## 🐛 Tests de Cas d'Erreur

### Test 6: Permission Micro Refusée
```
1. User A clique sur 📞
2. Navigateur demande permission micro
3. User A clique "Bloquer"
4. ✅ Toast d'erreur affiché: "Impossible de démarrer l'appel"
5. ✅ Pas d'appel envoyé à User B
```

### Test 7: Connexion Perdue
```
1. Établir un appel actif
2. Simuler perte de connexion (couper WiFi de User A)
3. ✅ Après quelques secondes: état passe à "failed"
4. ✅ Appel se termine automatiquement
5. ✅ Ressources nettoyées (micro/caméra libérés)
```

### Test 8: Fermeture d'Onglet Pendant Appel
```
1. Établir un appel actif
2. User A ferme l'onglet/navigateur
3. ✅ User B voit que l'appel s'est terminé
4. ✅ User B revient au chat
```

---

## 📱 Tests Mobile

### iOS Safari
```
1. Ouvrir https://votre-app.com sur iPhone/iPad
2. Se connecter comme User A
3. Tester appels (même procédure que desktop)
4. ✅ Vérifier que permissions fonctionnent
5. ✅ Vérifier que vidéo s'affiche correctement
6. ✅ Tester rotation d'écran
```

### Android Chrome
```
1. Ouvrir https://votre-app.com sur Android
2. Se connecter comme User B
3. Tester appels
4. ✅ Vérifier permissions
5. ✅ Vérifier vidéo
6. ✅ Tester rotation
```

---

## 📊 Métriques à Surveiller

### Console Browser (DevTools)

**Messages attendus (normaux):**
```
✅ Signaling channel initialized for match: xxx
✅ Call offer sent
✅ Received call offer
✅ ICE candidate added
✅ Connection state: connected
✅ Cleanup complete
```

**Messages d'erreur à investiguer:**
```
❌ Failed to initialize signaling channel
❌ Failed to initiate call
❌ Failed to add ICE candidate
❌ Connection state: failed
```

### Logs Supabase Realtime

**Dans Supabase Dashboard → Logs:**
```
Vérifier les broadcasts sur le canal webrtc:{matchId}
- Events: call-offer, call-answer, ice-candidate
- Fréquence normale: plusieurs ice-candidate par appel
```

---

## 🔧 Dépannage Rapide

### Problème: Pas de son
**Solutions:**
1. Vérifier permissions micro dans navigateur
2. Vérifier que micro n'est pas utilisé par autre app
3. Vérifier console pour erreurs getUserMedia
4. Tester avec écouteurs/casque

### Problème: Pas de vidéo
**Solutions:**
1. Vérifier permissions caméra
2. Vérifier que caméra fonctionne (tester dans autre app)
3. Vérifier que c'est bien un appel vidéo (icône 📹)
4. Vérifier console pour erreurs

### Problème: Connexion échoue
**Solutions:**
1. Vérifier HTTPS (obligatoire en production)
2. Vérifier firewall/réseau
3. Vérifier console Supabase (canal créé?)
4. Pour NAT strict: ajouter serveur TURN

### Problème: Notification n'apparaît pas
**Solutions:**
1. Vérifier que les deux users sont dans le même match
2. Vérifier console: "Received call offer" doit apparaître
3. Vérifier que IncomingCallNotification se rend
4. Vérifier z-index CSS

---

## ✅ Rapport de Test Template

```markdown
# Rapport de Test WebRTC - [Date]

## Environnement
- URL: [localhost / staging / production]
- Navigateur User A: [Chrome 120 / Firefox / Safari]
- Navigateur User B: [Chrome 120 / Firefox / Safari]
- OS: [Windows / Mac / Linux]

## Tests Effectués

### Appel Audio
- [ ] Initiation: ✅ / ❌
- [ ] Réception: ✅ / ❌
- [ ] Audio bidirectionnel: ✅ / ❌
- [ ] Toggle mute: ✅ / ❌
- [ ] Terminaison: ✅ / ❌

### Appel Vidéo
- [ ] Initiation: ✅ / ❌
- [ ] Réception: ✅ / ❌
- [ ] Vidéo bidirectionnelle: ✅ / ❌
- [ ] PiP local: ✅ / ❌
- [ ] Toggle caméra: ✅ / ❌
- [ ] Terminaison: ✅ / ❌

### Contrôles
- [ ] Accepter appel: ✅ / ❌
- [ ] Rejeter appel: ✅ / ❌
- [ ] Timer durée: ✅ / ❌
- [ ] Qualité connexion: ✅ / ❌

### Erreurs Rencontrées
[Décrire ici...]

### Notes
[Observations additionnelles...]

## Conclusion
- [ ] Prêt pour production
- [ ] Nécessite corrections
- [ ] Nécessite tests supplémentaires
```

---

## 📞 Support

**Si vous rencontrez des problèmes:**

1. **Vérifier la console navigateur** (F12)
   - Onglet Console pour erreurs JavaScript
   - Onglet Network pour requêtes WebSocket

2. **Vérifier Supabase Dashboard**
   - Logs → Realtime
   - Chercher broadcasts sur `webrtc:{matchId}`

3. **Vérifier les prérequis:**
   - ✅ HTTPS activé (production)
   - ✅ Permissions micro/caméra accordées
   - ✅ Navigateur compatible WebRTC
   - ✅ Pas de firewall bloquant WebRTC

---

**Ce document peut être partagé avec votre équipe de développement pour effectuer les tests.**

**Prochaine étape recommandée:** Faire tester par un développeur ayant accès à `npm run dev` ou déployer en environnement de staging.
