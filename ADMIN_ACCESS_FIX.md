# Correction d'accès au Dashboard Admin

## 🔴 Problème identifié

L'utilisateur Admin ne peut pas accéder au dashboard admin malgré qu'il possède le rôle 'admin' dans la base de données.

### Cause racine : Dépendance circulaire dans les politiques RLS

Les politiques de sécurité au niveau des lignes (RLS) sur la table `user_roles` contenaient une **dépendance circulaire** :

1. **Migration `20250917170846`** a créé cette politique :
   ```sql
   CREATE POLICY "Admins can manage moderator and user roles only" ON user_roles
   FOR ALL  -- Inclut SELECT, INSERT, UPDATE, DELETE
   USING (
     has_role(auth.uid(), 'admin'::app_role)
     AND role IN ('moderator'::app_role, 'user'::app_role)
   )
   ```

2. **Le problème** :
   - Quand un admin essaie de lire son propre rôle depuis `user_roles`
   - La fonction `has_role()` est appelée pour vérifier s'il est admin
   - `has_role()` doit lire la table `user_roles` pour vérifier le rôle
   - Mais la politique bloque la lecture des lignes où `role = 'admin'` !
   - **Résultat** : L'admin ne peut pas voir son propre rôle → accès refusé

3. **Problème supplémentaire** :
   - Plusieurs migrations ont créé des politiques en double avec des noms similaires
   - Conflits entre les politiques créées à différentes dates
   - Exemple : "Users can view their own role" vs "Users can view their own roles"

## ✅ Solution implémentée

### Migration corrective : `20251128_fix_admin_access_policies.sql`

Cette migration résout le problème en :

1. **Supprimant toutes les politiques conflictuelles** :
   ```sql
   DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
   DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
   DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
   -- etc.
   ```

2. **Créant des politiques SELECT claires et sans dépendance circulaire** :
   ```sql
   -- Politique 1 : TOUS les utilisateurs peuvent voir leur propre rôle
   -- Pas de dépendance circulaire !
   CREATE POLICY "users_select_own_role" ON public.user_roles
   FOR SELECT
   USING (auth.uid() = user_id);

   -- Politique 2 : Les admins peuvent voir tous les rôles
   -- Dépend de la Politique 1, mais pas de dépendance circulaire
   CREATE POLICY "admins_select_all_roles" ON public.user_roles
   FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM public.user_roles ur
       WHERE ur.user_id = auth.uid()
       AND ur.role IN ('admin'::app_role, 'super_admin'::app_role)
     )
   );
   ```

3. **Séparant les politiques de gestion (INSERT/UPDATE/DELETE)** :
   - Politiques distinctes pour super_admin (peut tout gérer)
   - Politiques distinctes pour admin (peut gérer uniquement moderator et user)
   - Conservation de la fonctionnalité de bootstrap pour le premier super_admin

## 📋 Comment appliquer la correction

### Option 1 : Via Supabase CLI (Recommandé)

Si vous utilisez Supabase en local ou avez configuré le CLI :

```bash
# Appliquer toutes les migrations pendantes
npx supabase db push

# OU appliquer cette migration spécifique
npx supabase migration up
```

### Option 2 : Via Supabase Dashboard (Production)

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **Database** → **Migrations**
3. Uploadez le fichier `supabase/migrations/20251128_fix_admin_access_policies.sql`
4. Cliquez sur "Run migration"

### Option 3 : Exécution manuelle (SQL Editor)

1. Ouvrez le **SQL Editor** dans le Supabase Dashboard
2. Copiez le contenu de `supabase/migrations/20251128_fix_admin_access_policies.sql`
3. Collez et exécutez le SQL

## 🧪 Vérification de la correction

Après avoir appliqué la migration, vérifiez que l'admin peut accéder :

### Test 1 : Vérifier les politiques

```sql
-- Lister toutes les politiques sur user_roles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'user_roles'
ORDER BY policyname;
```

Vous devriez voir :
- `users_select_own_role` (SELECT)
- `admins_select_all_roles` (SELECT)
- `super_admins_manage_all_roles` (ALL)
- `admins_manage_limited_roles` (INSERT)
- `admins_update_limited_roles` (UPDATE)
- `admins_delete_limited_roles` (DELETE)
- `bootstrap_and_user_role_insertion` (INSERT)

### Test 2 : Vérifier l'accès admin

```sql
-- En tant qu'utilisateur admin, vérifier qu'il peut lire son propre rôle
SELECT role
FROM user_roles
WHERE user_id = auth.uid();
```

Cela devrait retourner `'admin'` sans erreur.

### Test 3 : Accès au dashboard

1. Connectez-vous avec l'utilisateur admin (akaisan07@gmail.com)
2. Naviguez vers `/admin`
3. Le dashboard admin devrait s'afficher correctement

## 📊 Impact et compatibilité

- ✅ **Pas de perte de données** : Seules les politiques RLS sont modifiées
- ✅ **Rétrocompatible** : Tous les rôles existants continuent de fonctionner
- ✅ **Bootstrap préservé** : Le premier super_admin peut toujours être créé
- ✅ **Sécurité maintenue** : La hiérarchie de rôles est respectée

## 🔍 Logs et débogage

Si l'accès est toujours refusé après la migration :

### 1. Vérifier l'existence du rôle admin

```sql
SELECT * FROM user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'akaisan07@gmail.com'
);
```

### 2. Vérifier RLS est activé

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_roles';
```

### 3. Vérifier l'authentification

- Ouvrir la console du navigateur (F12)
- Regarder les erreurs dans la console
- Vérifier l'onglet Network pour les requêtes à Supabase
- Chercher des erreurs du type "permission denied for table user_roles"

### 4. Forcer la recréation du rôle admin (dernier recours)

```sql
-- Supprimer et recréer le rôle admin pour l'utilisateur
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'akaisan07@gmail.com');

INSERT INTO user_roles (user_id, role, assigned_by)
SELECT id, 'admin'::app_role, id
FROM auth.users
WHERE email = 'akaisan07@gmail.com';
```

## 📞 Support

Si le problème persiste après l'application de cette migration :

1. Vérifiez que la migration a bien été exécutée (voir "Vérification de la correction")
2. Videz le cache du navigateur et reconnectez-vous
3. Vérifiez les logs Supabase pour des erreurs spécifiques
4. Contactez l'équipe de développement avec les logs d'erreur

---

**Fichier de migration** : `supabase/migrations/20251128_fix_admin_access_policies.sql`
**Date de création** : 28 novembre 2025
**Commit** : `db569a4`
