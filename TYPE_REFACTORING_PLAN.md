# Plan de Refactoring TypeScript

## État actuel

Les fichiers avec `// @ts-nocheck` nécessitent une refactorisation progressive pour résoudre les incompatibilités de types entre Supabase (`null`) et TypeScript (`undefined`).

## Problèmes identifiés

### 1. Incompatibilité null/undefined
- **Problème**: Supabase retourne `null` pour les valeurs vides, TypeScript attend `undefined`
- **Solution**: Utiliser les fonctions de normalisation dans `src/types/supabase.ts`
- **Exemples**: `normalizeProfile()`, `normalizeMatch()`, `normalizeMessage()`

### 2. Booléens nullable
- **Problème**: `boolean | null` vs `boolean`
- **Solution**: Utiliser l'opérateur `!!` pour convertir
- **Exemple**: `subscribed: !!isValid` au lieu de `subscribed: isValid`

### 3. Types Supabase auto-générés
- **Problème**: `src/integrations/supabase/types.ts` est en lecture seule
- **Solution**: Créer des types normalisés manuellement dans `src/types/supabase.ts`

## Fichiers à refactoriser (par priorité)

### Priorité 1 - Hooks critiques (✅ Partiellement fait)
- [x] `src/hooks/useAuth.tsx` - Booléen normalisé
- [x] `src/hooks/useChatMatch.tsx` - Avec @ts-nocheck temporaire
- [x] `src/hooks/useChatMessages.tsx` - Avec @ts-nocheck temporaire
- [ ] `src/hooks/useChatPresence.tsx`
- [ ] `src/hooks/useCompatibility.tsx`
- [ ] `src/hooks/useFamilyApproval.tsx`
- [ ] `src/hooks/useFamilySupervision.tsx`

### Priorité 2 - Hooks métier
- [ ] `src/hooks/useMatchApproval.tsx`
- [ ] `src/hooks/useInsightsAnalytics.tsx`
- [ ] `src/hooks/useIslamicModeration.tsx`
- [ ] `src/hooks/useEnhancedSessionMonitor.tsx`
- [ ] `src/hooks/useFormAutosave.ts`

### Priorité 3 - Composants
- [ ] Tous les composants avec `// @ts-nocheck`

## Méthodologie de refactoring

### Étape 1: Pour chaque hook
1. Lire le fichier complet
2. Identifier les appels Supabase et leurs types de retour
3. Appliquer les fonctions de normalisation appropriées

### Étape 2: Conversion des types
```typescript
// ❌ AVANT
const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
setProfile(data); // Type error: null vs undefined

// ✅ APRÈS
const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
setProfile(data ? normalizeProfile(data) : undefined);
```

### Étape 3: Booléens
```typescript
// ❌ AVANT
const isActive = data.is_active; // boolean | null
setActive(isActive); // Type error

// ✅ APRÈS  
const isActive = !!data.is_active; // boolean
setActive(isActive);
```

### Étape 4: Optionals
```typescript
// ❌ AVANT
const name = profile.full_name || 'Unknown'; // string | null

// ✅ APRÈS
const name = profile.full_name ?? 'Unknown'; // string
```

## Fonctions de normalisation disponibles

Dans `src/types/supabase.ts`:
- `normalizeProfile(data)` - Normalise les profils utilisateurs
- `normalizeMatch(data)` - Normalise les matches
- `normalizeMessage(data)` - Normalise les messages
- `normalizeIslamicPreferences(data)` - Normalise les préférences islamiques
- `normalizeFamilyMember(data)` - Normalise les membres de famille
- `normalizePrivacySettings(data)` - Normalise les paramètres de confidentialité
- `normalizeUserVerification(data)` - Normalise les vérifications utilisateur
- `normalizeNotification(data)` - Normalise les notifications
- `normalizeSubscription(data)` - Normalise les abonnements

## Stratégie progressive

1. **Phase 1** (Actuelle): Stabiliser avec `@ts-nocheck` temporaire
2. **Phase 2**: Refactoriser 2-3 hooks par itération
3. **Phase 3**: Supprimer progressivement les `@ts-nocheck`
4. **Phase 4**: Tests de non-régression

## Notes importantes

- **NE PAS** modifier `src/integrations/supabase/types.ts` (fichier auto-généré)
- **TOUJOURS** tester après chaque refactoring
- **PRÉFÉRER** les petits changements incrémentaux
- **DOCUMENTER** les patterns de conversion trouvés
