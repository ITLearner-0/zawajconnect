# 📘 Guide de Style TypeScript

Guide de référence rapide pour le développement TypeScript dans le projet, basé sur les patterns découverts pendant le refactoring complet de 33 fichiers.

---

## 🎯 Principes Fondamentaux

### 1. Préférer `undefined` à `null`

**Règle**: Toujours utiliser `undefined` pour représenter l'absence de valeur.

```typescript
// ✅ BON
const [user, setUser] = useState<User | undefined>(undefined);
const profile: Profile | undefined = undefined;

// ❌ MAUVAIS
const [user, setUser] = useState<User | null>(null);
const profile: Profile | null = null;
```

**Pourquoi?**

- Standard TypeScript et React moderne
- Cohérent avec les types optionnels (`?`)
- Meilleure intégration avec l'écosystème JavaScript
- Simplifie les vérifications de type

---

### 2. Utiliser le Nullish Coalescing (`??`)

**Règle**: Utiliser `??` pour les valeurs par défaut au lieu de `||`.

```typescript
// ✅ BON
const name = profile.full_name ?? 'Anonymous';
const age = profile.age ?? 0;
const items = data.items ?? [];

// ❌ MAUVAIS
const name = profile.full_name || 'Anonymous'; // ⚠️ Problème si full_name = ""
const age = profile.age || 0; // ⚠️ Problème si age = 0
```

**Pourquoi?**

- `??` ne considère que `null` et `undefined` comme "absents"
- `||` traite aussi `0`, `""`, `false` comme "absents"
- Évite les bugs subtils avec les valeurs falsy

**Cas d'usage courants**:

```typescript
// Valeurs par défaut
const title = post.title ?? 'Untitled';

// Tableaux vides
const tags = post.tags ?? [];

// Objets vides
const settings = user.settings ?? {};

// Nombres (y compris 0)
const score = profile.score ?? 0;

// Chaînes (y compris "")
const description = profile.bio ?? '';
```

---

### 3. Double Négation (`!!`) pour les Booléens

**Règle**: Utiliser `!!` pour convertir explicitement en booléen.

```typescript
// ✅ BON
const isActive: boolean = !!settings.is_active;
const hasProfile: boolean = !!user.profile_id;
const isVerified: boolean = !!verification.verified_at;

// ❌ MAUVAIS
const isActive = settings.is_active; // Type potentiellement unclear
const hasProfile = user.profile_id ? true : false; // Verbeux
```

**Pourquoi?**

- Conversion explicite et claire
- Type `boolean` garanti
- Évite les valeurs "truthy/falsy" ambiguës
- Plus concis que les ternaires

**Cas d'usage courants**:

```typescript
// Vérifier l'existence
const hasData: boolean = !!data;
const hasEmail: boolean = !!user.email;

// Champs optionnels
const isPublic: boolean = !!profile.is_public;

// Timestamps (vérifie si défini)
const isVerified: boolean = !!user.verified_at;
```

---

### 4. Optional Chaining (`?.`)

**Règle**: Utiliser `?.` pour accéder aux propriétés potentiellement `undefined`.

```typescript
// ✅ BON
const score = verification?.verification_score ?? 0;
const city = user?.profile?.location?.city ?? 'Unknown';
const count = data?.items?.length ?? 0;

// ❌ MAUVAIS
const score = verification && verification.verification_score ? verification.verification_score : 0;
const city = user && user.profile && user.profile.location ? user.profile.location.city : 'Unknown';
```

**Pourquoi?**

- Code plus lisible et concis
- Évite les vérifications `if` imbriquées
- Gestion sûre des propriétés nested
- Standard moderne JavaScript/TypeScript

**Cas d'usage courants**:

```typescript
// Accès nested sécurisé
const email = user?.profile?.contact?.email;

// Appel de méthode conditionnel
user?.updateProfile?.();

// Accès à des tableaux
const firstItem = array?.[0];

// Combiné avec ??
const name = user?.profile?.name ?? 'Guest';
```

---

### 5. Type Guards pour les Tableaux

**Règle**: Utiliser des type guards explicites pour filtrer les valeurs `null`/`undefined`.

```typescript
// ✅ BON
const validItems = (data ?? []).filter((item): item is string => item !== null);
const profiles = (results ?? []).filter((p): p is Profile => p !== undefined);

// ❌ MAUVAIS
const validItems = data.filter((item) => item !== null); // Type pas raffiné
const profiles = results.filter((p) => p !== undefined); // Type (Profile | undefined)[]
```

**Pourquoi?**

- Type final précis (`string[]` au lieu de `(string | null)[]`)
- TypeScript comprend le filtrage
- Évite les erreurs de type en aval

**Pattern complet**:

```typescript
interface Profile {
  id: string;
  name: string;
}

// Filtrage avec type guard
const profiles: Profile[] = (data ?? []).filter((item): item is Profile => {
  return item !== null && item !== undefined && 'id' in item;
});

// Ou plus simple si on sait que null/undefined sont les seuls cas
const profiles: Profile[] = (data ?? []).filter((item): item is Profile => item !== null);
```

---

### 6. Utilisation de `as any` (⚠️ À Éviter)

**Règle**: Utiliser `as any` UNIQUEMENT en dernier recours et toujours documenter.

```typescript
// ✅ BON (si vraiment nécessaire)
// TODO: Remove after adding moderation_rules to Supabase schema
const { data } = await supabase.from('moderation_rules' as any).select('*');

// ❌ MAUVAIS
const data = response as any; // Non documenté, pas de plan pour le supprimer
```

**Quand utiliser `as any`?**

1. **Tables Supabase manquantes du schéma TypeScript**

   ```typescript
   // Table existe en DB mais pas dans les types auto-générés
   const { data } = await supabase.from('custom_table' as any).select('*');
   ```

2. **Mocks de tests très complexes**

   ```typescript
   const mockSupabase = {
     from: vi.fn().mockReturnValue({
       select: vi.fn(),
     }),
   } as any; // Acceptable dans les tests
   ```

3. **APIs externes sans types**
   ```typescript
   // Quand une librairie externe n'a pas de types
   const result = externalAPI.call() as any;
   ```

**Documentation obligatoire**:

```typescript
// ✅ Format requis
// TODO: [Raison] - [Action à prendre] - [Deadline si applicable]
const data = something as any;

// Exemples
// TODO: Remove after Supabase schema update includes moderation_rules table
// TODO: Add proper typing when @types/external-lib is available
// TODO: Refactor after migrating to new API version (Q2 2025)
```

**Plan de suppression**:

- Court terme: Identifier tous les `as any` dans le code
- Moyen terme: Créer des types intermédiaires si possible
- Long terme: Éliminer tous les `as any` non-essentiels

---

## 🔧 Patterns Spécifiques

### Normalisation des Données Supabase

**Règle**: Normaliser immédiatement après les requêtes Supabase.

```typescript
// ✅ BON
const { data, error } = await supabase.from('profiles').select('*').single();

if (error) throw error;

const normalizedProfile: Profile = {
  id: data.id,
  full_name: data.full_name ?? '',
  age: data.age ?? 0,
  bio: data.bio ?? undefined,
  is_active: !!data.is_active,
  settings: data.settings ?? {},
  tags: data.tags ?? [],
};

// ❌ MAUVAIS
const { data } = await supabase.from('profiles').select('*').single();
// Utiliser data directement sans normalisation
setProfile(data);
```

**Pattern complet**:

```typescript
async function fetchProfile(userId: string): Promise<Profile | undefined> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return undefined;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    full_name: data.full_name ?? '',
    age: data.age ?? 0,
    bio: data.bio ?? undefined,
    is_active: !!data.is_active,
    verified_at: data.verified_at ?? undefined,
    settings: data.settings ?? {},
    preferences: data.preferences ?? [],
  };
}
```

---

### Gestion des États React

**Règle**: Typer explicitement les états avec `undefined` pour les valeurs optionnelles.

```typescript
// ✅ BON
const [user, setUser] = useState<User | undefined>(undefined);
const [profiles, setProfiles] = useState<Profile[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<string | undefined>(undefined);

// ❌ MAUVAIS
const [user, setUser] = useState(null); // Type inféré incorrect
const [profiles, setProfiles] = useState(); // Type any
const [error, setError] = useState<string | null>(null);
```

**Pattern avec useEffect**:

```typescript
const [data, setData] = useState<DataType | undefined>(undefined);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<Error | undefined>(undefined);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await apiCall();
      setData(result ?? undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

---

### Gestion des Erreurs

**Règle**: Typer les erreurs explicitement et utiliser des type guards.

```typescript
// ✅ BON
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  if (error instanceof Error) {
    console.error('Operation failed:', error.message);
    return undefined;
  }
  console.error('Unknown error:', error);
  return undefined;
}

// ❌ MAUVAIS
try {
  return await riskyOperation();
} catch (error) {
  console.error(error); // error est 'unknown'
  return null;
}
```

**Pattern avec PostgrestError (Supabase)**:

```typescript
import { PostgrestError } from '@supabase/supabase-js';

const { data, error } = await supabase.from('table').select('*');

if (error) {
  // error est déjà typé comme PostgrestError
  console.error('Database error:', {
    message: error.message,
    code: error.code,
    details: error.details,
  });
  return undefined;
}

return data ?? [];
```

---

## 📦 Types Complexes

### Interfaces vs Types

**Règle**: Préférer `interface` pour les objets, `type` pour les unions/intersections.

```typescript
// ✅ BON
interface User {
  id: string;
  name: string;
  email: string;
}

type UserStatus = 'active' | 'inactive' | 'pending';
type UserWithStatus = User & { status: UserStatus };

// ❌ MAUVAIS
type User = {
  id: string;
  name: string;
  email: string;
}; // Préférer interface

interface UserStatus = 'active' | 'inactive'; // ❌ Syntaxe invalide
```

**Quand utiliser quoi?**

- **Interface**: Objets, classes, extension (implements, extends)
- **Type**: Unions, intersections, tuples, mapped types

---

### Types Génériques

**Règle**: Utiliser des génériques pour la réutilisabilité et la sécurité de type.

```typescript
// ✅ BON
interface ApiResponse<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

function useApi<T>(url: string): ApiResponse<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  // ... implementation

  return { data, error, loading };
}

// Usage
const userApi = useApi<User>('/api/user');
const profileApi = useApi<Profile>('/api/profile');

// ❌ MAUVAIS
interface ApiResponse {
  data: any; // Perte de type safety
  error: any;
  loading: boolean;
}
```

---

## 🎨 Conventions de Nommage

### Variables et Fonctions

```typescript
// ✅ BON
const isUserActive = !!user.is_active;
const hasProfileData = !!profile;
const getUserById = (id: string) => {
  /* ... */
};

// ❌ MAUVAIS
const UserActive = !!user.is_active; // PascalCase pour variable
const has_profile_data = !!profile; // snake_case
const GetUserById = (id: string) => {
  /* ... */
}; // PascalCase pour fonction
```

**Règles**:

- Variables/fonctions: `camelCase`
- Booléens: préfixe `is`, `has`, `should`, `can`
- Types/Interfaces: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE` (si vraiment constantes globales)

---

### Types et Interfaces

```typescript
// ✅ BON
interface UserProfile {
  id: string;
  name: string;
}

type UserStatus = 'active' | 'inactive';
type UserWithStatus = UserProfile & { status: UserStatus };

// ❌ MAUVAIS
interface userProfile {
  /* ... */
} // camelCase
interface IUserProfile {
  /* ... */
} // Préfixe I (style ancien)
type TUserStatus = 'active' | 'inactive'; // Préfixe T
```

**Règles**:

- Pas de préfixes `I` ou `T`
- `PascalCase` pour tous les types
- Noms descriptifs et clairs

---

## 🧪 Tests

### Mocking avec TypeScript

```typescript
// ✅ BON
import { vi } from 'vitest';

const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
};

// Type assertion acceptable dans les tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase as any,
}));

// ❌ MAUVAIS
const mockSupabase = {
  from: () => ({ select: () => {} }),
}; // Pas de vi.fn(), difficile à tester les appels
```

**Règles pour les tests**:

- Utiliser `vi.fn()` pour tous les mocks
- `as any` acceptable pour les mocks complexes (documenter)
- Typer les données de test quand possible

---

## 📋 Checklist de Review

Avant de soumettre du code, vérifier:

- [ ] ✅ Pas de `null`, uniquement `undefined`
- [ ] ✅ Utilisation de `??` au lieu de `||` pour les valeurs par défaut
- [ ] ✅ `!!` pour toutes les conversions booléennes explicites
- [ ] ✅ `?.` pour l'accès aux propriétés optionnelles
- [ ] ✅ Type guards pour les filtres de tableaux
- [ ] ✅ Aucun `as any` sans documentation TODO
- [ ] ✅ Types explicites pour les états React
- [ ] ✅ Normalisation immédiate après Supabase
- [ ] ✅ Gestion d'erreurs avec type guards
- [ ] ✅ Nommage cohérent (camelCase, PascalCase)
- [ ] ✅ Pas d'erreurs TypeScript (`npm run type-check`)

---

## 🚀 Commandes Utiles

```bash
# Vérifier les erreurs TypeScript
npm run type-check

# Lancer les tests
npm run test

# Build de production
npm run build

# Linter
npm run lint
```

---

## 📚 Ressources

### Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

### Références Internes

- [REFACTORING_TYPESCRIPT_COMPLETE.md](./REFACTORING_TYPESCRIPT_COMPLETE.md) - Rapport complet du refactoring
- [TYPESCRIPT_REFACTORING_INDEX.md](./TYPESCRIPT_REFACTORING_INDEX.md) - Index de la documentation

---

## 💡 Questions Fréquentes

**Q: Pourquoi ne pas utiliser `null`?**  
R: `undefined` est le standard TypeScript moderne, plus cohérent avec les types optionnels et l'écosystème JS.

**Q: Quand utiliser `??` vs `||`?**  
R: Toujours `??` pour les valeurs par défaut. `||` peut causer des bugs avec `0`, `""`, ou `false`.

**Q: Les `as any` sont-ils toujours interdits?**  
R: Non, mais ils doivent être documentés avec un TODO expliquant pourquoi et quand les supprimer.

**Q: Faut-il typer tous les `useState`?**  
R: Oui, toujours typer explicitement les états, surtout si la valeur initiale est `undefined`.

**Q: Comment gérer les types Supabase manquants?**  
R: Utiliser `as any` temporairement avec TODO, puis mettre à jour le schéma et régénérer les types.

---

**Dernière mise à jour**: Janvier 2025  
**Version**: 1.0  
**Basé sur**: Refactoring TypeScript complet de 33 fichiers

---

_"Code is read more often than it is written."_ - Guido van Rossum

Écrivons du code TypeScript propre, sûr et maintenable! 🚀
