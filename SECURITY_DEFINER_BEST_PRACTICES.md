# Best Practices for SECURITY DEFINER Functions

## 🎯 Quand Utiliser SECURITY DEFINER

### ✅ Cas d'Usage Légitimes

1. **Fonctions Helper pour RLS Policies**
   - Pour éviter la récursion infinie dans les politiques RLS
   - Exemple: `is_admin()`, `has_role()`, `can_access_match()`

2. **Opérations Nécessitant des Privilèges Élevés**
   - Logging d'audit (insertion dans des tables protégées)
   - Rate limiting (vérification dans des tables d'audit)
   - Calculs de scores/statistiques nécessitant plusieurs tables

3. **Optimisation de Performance**
   - Requêtes complexes qui bénéficient de l'exécution avec les droits du propriétaire
   - Éviter les vérifications RLS multiples dans les sous-requêtes

### ❌ Quand NE PAS Utiliser SECURITY DEFINER

1. ❌ Pour contourner RLS par commodité
2. ❌ Pour des requêtes simples de lecture
3. ❌ Quand une politique RLS suffirait
4. ❌ Pour exposer des données sans validation

---

## 🔒 Template de Fonction Sécurisée

```sql
CREATE OR REPLACE FUNCTION public.secure_function_template(
  param1 uuid,
  param2 text
)
RETURNS some_type
LANGUAGE plpgsql
STABLE  -- ou VOLATILE selon le cas
SECURITY DEFINER
SET search_path TO 'public'  -- CRITIQUE: Empêche les attaques par search path
AS $function$
DECLARE
  -- Variables locales
  v_result some_type;
BEGIN
  -- ============================================================================
  -- ÉTAPE 1: VALIDATION DE L'AUTHENTIFICATION
  -- ============================================================================
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- ============================================================================
  -- ÉTAPE 2: VALIDATION DE L'AUTORISATION
  -- ============================================================================
  -- Vérifier que l'utilisateur a le droit d'accéder à cette ressource
  -- Options communes:
  -- 1. L'utilisateur accède à ses propres données
  IF param1 != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only access your own data';
  END IF;

  -- 2. L'utilisateur a une relation appropriée (famille, match, etc.)
  -- IF NOT EXISTS (
  --   SELECT 1 FROM appropriate_relationship_table
  --   WHERE user_id = auth.uid() AND related_id = param1
  --   AND status = 'active'
  -- ) THEN
  --   RAISE EXCEPTION 'Unauthorized: No valid relationship';
  -- END IF;

  -- ============================================================================
  -- ÉTAPE 3: AUDIT LOGGING (pour les opérations sensibles)
  -- ============================================================================
  -- Logger les accès aux données sensibles
  -- PERFORM log_security_event(
  --   auth.uid(),
  --   'function_name_accessed',
  --   'medium',
  --   'User accessed sensitive function',
  --   jsonb_build_object(
  --     'target_id', param1,
  --     'timestamp', now()
  --   )
  -- );

  -- ============================================================================
  -- ÉTAPE 4: LOGIQUE MÉTIER
  -- ============================================================================
  -- Exécuter la logique de la fonction
  SELECT something INTO v_result
  FROM some_table
  WHERE id = param1;

  -- ============================================================================
  -- ÉTAPE 5: RETOUR SÉCURISÉ
  -- ============================================================================
  -- Ne retourner QUE les données nécessaires et autorisées
  RETURN v_result;

EXCEPTION
  -- Gérer les erreurs de manière sécurisée
  WHEN OTHERS THEN
    -- Logger l'erreur (sans exposer de détails sensibles)
    RAISE EXCEPTION 'Operation failed: %', SQLERRM;
END;
$function$;

-- ============================================================================
-- DOCUMENTATION OBLIGATOIRE
-- ============================================================================
COMMENT ON FUNCTION public.secure_function_template(uuid, text) IS
'SECURITY DEFINER: [Description courte]
Restrictions: [Qui peut appeler cette fonction]
Security: [Quelles vérifications sont faites]
Logging: [Ce qui est logué]';
```

---

## ✅ Checklist de Sécurité SECURITY DEFINER

Avant de créer ou modifier une fonction SECURITY DEFINER:

### Avant l'Implémentation

- [ ] La fonction a-t-elle **vraiment** besoin de SECURITY DEFINER?
- [ ] Peut-on faire la même chose avec une politique RLS?
- [ ] Les risques sont-ils documentés?
- [ ] L'équipe de sécurité a-t-elle approuvé?

### Pendant l'Implémentation

- [ ] `SET search_path TO 'public'` est configuré
- [ ] Vérification de `auth.uid()` en début de fonction
- [ ] Validation des autorisations appropriées
- [ ] Gestion des erreurs sans exposer de détails sensibles
- [ ] Audit logging pour les opérations critiques
- [ ] Commentaires clairs expliquant les vérifications
- [ ] Limitation des données retournées au strict nécessaire

### Après l'Implémentation

- [ ] Tests avec différents utilisateurs (authenticated, unauthorized, admin)
- [ ] Tests de sécurité automatisés créés
- [ ] Documentation complète avec exemples
- [ ] Code review par un membre senior
- [ ] Ajout au registre des fonctions SECURITY DEFINER

---

## 🧪 Tests de Sécurité Automatisés

### Template de Test SQL

```sql
-- Test Suite for SECURITY DEFINER function
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000001';
  other_user_id uuid := '00000000-0000-0000-0000-000000000002';
  test_result boolean;
BEGIN
  -- Test 1: Unauthorized access should fail
  BEGIN
    -- Simulate unauthorized user
    PERFORM set_config('request.jwt.claims',
      jsonb_build_object('sub', other_user_id)::text, true);

    -- Try to access data of test_user_id
    SELECT function_name(test_user_id) INTO test_result;

    -- Should not reach here
    RAISE EXCEPTION 'SECURITY TEST FAILED: Unauthorized access allowed';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%Unauthorized%' THEN
        RAISE NOTICE 'PASS: Unauthorized access blocked';
      ELSE
        RAISE EXCEPTION 'SECURITY TEST FAILED: Wrong error: %', SQLERRM;
      END IF;
  END;

  -- Test 2: Authorized access should succeed
  BEGIN
    -- Simulate authorized user
    PERFORM set_config('request.jwt.claims',
      jsonb_build_object('sub', test_user_id)::text, true);

    -- Try to access own data
    SELECT function_name(test_user_id) INTO test_result;

    RAISE NOTICE 'PASS: Authorized access allowed';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'SECURITY TEST FAILED: Authorized access blocked: %', SQLERRM;
  END;

  -- Test 3: Admin access should succeed
  -- ... (similar pattern)

  RAISE NOTICE 'All security tests passed!';
END $$;
```

---

## 📊 Audit et Monitoring

### Métriques à Surveiller

1. **Appels de Fonctions SECURITY DEFINER**

   ```sql
   -- Créer une vue pour surveiller les appels
   CREATE VIEW security_definer_usage AS
   SELECT
     schemaname,
     funcname,
     calls,
     total_time,
     self_time
   FROM pg_stat_user_functions
   WHERE proname IN (
     SELECT proname
     FROM pg_proc
     WHERE prosecdef = true
   );
   ```

2. **Tentatives d'Accès Non Autorisées**

   ```sql
   -- Surveiller les exceptions dans les logs
   SELECT *
   FROM security_events
   WHERE event_type LIKE '%unauthorized%'
   AND severity IN ('high', 'critical')
   AND created_at > now() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   ```

3. **Patterns Suspects**
   - Nombre élevé d'appels d'un même utilisateur
   - Tentatives répétées sur différents user_ids
   - Appels depuis des IPs non habituelles

---

## 🚨 Red Flags à Surveiller

### Code Suspect

```sql
-- ❌ DANGER: Pas de vérification auth.uid()
CREATE FUNCTION dangerous_function(target_id uuid)
RETURNS sensitive_data
SECURITY DEFINER
AS $$
BEGIN
  -- PAS DE VÉRIFICATION!
  RETURN (SELECT * FROM sensitive_table WHERE id = target_id);
END;
$$;

-- ❌ DANGER: Utilise directement un paramètre sans validation
CREATE FUNCTION sql_injection_risk(user_input text)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  -- RISQUE D'INJECTION SQL!
  EXECUTE 'SELECT * FROM table WHERE name = ' || user_input;
END;
$$;

-- ❌ DANGER: Pas de SET search_path
CREATE FUNCTION path_manipulation_risk()
RETURNS text
SECURITY DEFINER
-- MANQUE: SET search_path
AS $$
BEGIN
  -- Vulnérable aux attaques par manipulation du search_path
  RETURN current_user;
END;
$$;
```

### Code Sécurisé

```sql
-- ✅ BON: Vérifications complètes
CREATE FUNCTION secure_function(target_id uuid)
RETURNS sensitive_data
SECURITY DEFINER
SET search_path TO 'public'  -- ✅
AS $$
BEGIN
  -- ✅ Vérifie l'authentification
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- ✅ Vérifie l'autorisation
  IF target_id != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- ✅ Utilise des requêtes paramétrées
  RETURN (SELECT * FROM sensitive_table WHERE id = target_id);
END;
$$;
```

---

## 📝 Registre des Fonctions SECURITY DEFINER

Maintenir un registre à jour de toutes les fonctions:

| Fonction                            | Raison                  | Restrictions      | Dernière Revue | Risque    |
| ----------------------------------- | ----------------------- | ----------------- | -------------- | --------- |
| is_user_in_active_conversation      | Helper RLS              | Self/Admin        | 2025-11-10     | ✅ Faible |
| has_previous_conversation           | Helper RLS              | Participants      | 2025-11-10     | ✅ Faible |
| get_user_verification_status_secure | Données sensibles       | Self/Family/Match | 2025-11-10     | ✅ Faible |
| is_premium_active                   | Business logic          | Self/Admin        | 2025-11-10     | ✅ Faible |
| get_family_contact_secure           | Données ultra-sensibles | Wali verified     | 2025-11-10     | ✅ Faible |

---

## 🔄 Process de Revue Trimestrielle

### Checklist de Revue

1. [ ] Lister toutes les fonctions SECURITY DEFINER actuelles
2. [ ] Vérifier que chacune a une raison valide
3. [ ] Tester les vérifications d'autorisation
4. [ ] Vérifier les logs d'audit
5. [ ] Rechercher des patterns d'abus
6. [ ] Mettre à jour la documentation
7. [ ] Former l'équipe sur les nouvelles pratiques

### SQL pour Identifier Toutes les Fonctions

```sql
SELECT
  n.nspname AS schema,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition,
  CASE WHEN prosecdef THEN '⚠️ SECURITY DEFINER' ELSE '✅ INVOKER' END AS security_type,
  CASE
    WHEN prosecdef AND pg_get_functiondef(p.oid) NOT LIKE '%auth.uid()%'
    THEN '🔴 MISSING AUTH CHECK'
    ELSE '✅ OK'
  END AS auth_check
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND prosecdef = true
ORDER BY p.proname;
```

---

## 📚 Ressources Additionnelles

- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [PostgreSQL SECURITY DEFINER Documentation](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Row Level Security Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Audit complet: `SECURITY_DEFINER_AUDIT.md`
