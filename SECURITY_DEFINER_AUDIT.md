# Audit des Fonctions SECURITY DEFINER

## 🔴 Fonctions CRITIQUES à Corriger Immédiatement

### 1. `is_user_in_active_conversation(check_user_id uuid)`
**Risque:** 🔴 ÉLEVÉ - Pas de vérification auth.uid()
```sql
-- PROBLÈME: N'importe qui peut vérifier si N'IMPORTE QUEL utilisateur est en conversation
CREATE OR REPLACE FUNCTION public.is_user_in_active_conversation(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user1_id = check_user_id OR user2_id = check_user_id)
    AND conversation_status = 'active'
  );
END;
$function$
```
**Impact:** Fuite d'informations - Un attaquant peut scanner tous les utilisateurs pour voir qui est en conversation active.

**Solution:**
```sql
CREATE OR REPLACE FUNCTION public.is_user_in_active_conversation(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SÉCURITÉ: Vérifier que l'utilisateur authentifié peut accéder à cette info
  IF check_user_id != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot check conversation status of other users';
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user1_id = check_user_id OR user2_id = check_user_id)
    AND conversation_status = 'active'
  );
END;
$function$
```

---

### 2. `has_previous_conversation(u1_id uuid, u2_id uuid)`
**Risque:** 🔴 ÉLEVÉ - Pas de vérification auth.uid()
```sql
-- PROBLÈME: N'importe qui peut vérifier si 2 utilisateurs ont déjà communiqué
CREATE OR REPLACE FUNCTION public.has_previous_conversation(u1_id uuid, u2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_match_pairs
    WHERE (user1_id = u1_id AND user2_id = u2_id)
       OR (user1_id = u2_id AND user2_id = u1_id)
  );
END;
$function$
```
**Impact:** Fuite de données relationnelles - Permet de mapper le graphe social complet.

**Solution:**
```sql
CREATE OR REPLACE FUNCTION public.has_previous_conversation(u1_id uuid, u2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SÉCURITÉ: L'utilisateur authentifié doit être l'un des deux participants
  IF auth.uid() != u1_id AND auth.uid() != u2_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own conversation history';
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_match_pairs
    WHERE (user1_id = u1_id AND user2_id = u2_id)
       OR (user1_id = u2_id AND user2_id = u1_id)
  );
END;
$function$
```

---

### 3. `is_premium_active(user_uuid uuid)`
**Risque:** 🟡 MOYEN - Information sensible sans restriction
```sql
-- PROBLÈME: N'importe qui peut vérifier le statut premium de n'importe quel utilisateur
CREATE OR REPLACE FUNCTION public.is_premium_active(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  );
$function$
```
**Impact:** Permet de cibler les utilisateurs premium pour des attaques spécifiques.

**Solution:**
```sql
CREATE OR REPLACE FUNCTION public.is_premium_active(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  )
  -- Restreindre l'accès: uniquement soi-même ou admins
  WHERE user_uuid = auth.uid() OR is_admin(auth.uid());
$function$
```

---

### 4. `get_family_member_contact_secure(member_id uuid)`
**Risque:** 🟢 BON - A des vérifications de sécurité robustes ✅
```sql
-- Cette fonction IMPLÉMENTE correctement les vérifications:
-- ✅ Vérifie auth.uid()
-- ✅ Vérifie l'invitation acceptée récemment (7 jours)
-- ✅ Vérifie les scores de vérification (≥75)
-- ✅ Retourne seulement les infos non-sensibles
```
**Recommandation:** Aucune correction nécessaire, cette fonction est bien sécurisée.

---

### 5. `get_current_user_role_secure()`
**Risque:** 🟢 BON - Accès restreint à l'utilisateur authentifié ✅
```sql
-- ✅ Utilise auth.uid() pour récupérer le rôle de l'utilisateur authentifié
-- ✅ Ne permet pas de vérifier le rôle d'autres utilisateurs
```
**Recommandation:** Aucune correction nécessaire.

---

### 6. `can_access_match_security_definer(match_user1_id uuid, match_user2_id uuid)`
**Risque:** 🟢 BON - Vérifie l'authentification et les relations ✅
```sql
-- ✅ Vérifie si auth.uid() est participant direct
-- ✅ Vérifie si auth.uid() est membre de famille avec droits de supervision
-- ✅ Vérifie l'acceptation récente de l'invitation (14 jours)
```
**Recommandation:** Aucune correction nécessaire, mais documenter l'usage.

---

### 7. `get_user_verification_status_secure(target_user_id uuid)`
**Risque:** 🔴 ÉLEVÉ - Pas de restriction d'accès
```sql
-- PROBLÈME: N'importe qui peut vérifier le statut de vérification de n'importe qui
CREATE OR REPLACE FUNCTION public.get_user_verification_status_secure(target_user_id uuid)
RETURNS TABLE(email_verified boolean, id_verified boolean, verification_score integer)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    uv.email_verified,
    uv.id_verified,
    uv.verification_score
  FROM public.user_verifications uv
  WHERE uv.user_id = target_user_id;
END;
$function$
```
**Impact:** Fuite d'informations critiques sur la vérification des utilisateurs.

**Solution:**
```sql
CREATE OR REPLACE FUNCTION public.get_user_verification_status_secure(target_user_id uuid)
RETURNS TABLE(email_verified boolean, id_verified boolean, verification_score integer)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SÉCURITÉ: Permettre uniquement:
  -- 1. L'utilisateur lui-même
  -- 2. Les admins
  -- 3. Les membres de famille avec invitation acceptée récemment
  -- 4. Les matches actifs
  IF target_user_id != auth.uid() 
     AND NOT is_admin(auth.uid())
     AND NOT EXISTS (
       SELECT 1 FROM family_members fm
       WHERE (fm.user_id = target_user_id AND fm.invited_user_id = auth.uid()
              OR fm.invited_user_id = target_user_id AND fm.user_id = auth.uid())
       AND fm.invitation_status = 'accepted'
       AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')
     )
     AND NOT EXISTS (
       SELECT 1 FROM matches m
       WHERE ((m.user1_id = auth.uid() AND m.user2_id = target_user_id)
              OR (m.user2_id = auth.uid() AND m.user1_id = target_user_id))
       AND m.is_mutual = true
     ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access verification status of this user';
  END IF;
  
  RETURN QUERY
  SELECT 
    uv.email_verified,
    uv.id_verified,
    uv.verification_score
  FROM public.user_verifications uv
  WHERE uv.user_id = target_user_id;
END;
$function$
```

---

### 8. `check_family_access_rate_limit(user_uuid uuid)`
**Risque:** 🟡 MOYEN - Devrait être restreint à l'utilisateur authentifié
```sql
-- PROBLÈME: Permet de vérifier les limites de rate d'autres utilisateurs
CREATE OR REPLACE FUNCTION public.check_family_access_rate_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  access_count integer;
BEGIN
  SELECT COUNT(*) INTO access_count
  FROM public.family_access_audit 
  WHERE accessed_by = user_uuid 
  AND access_timestamp > (now() - INTERVAL '1 hour');
  
  RETURN access_count < 50;
END;
$function$
```

**Solution:**
```sql
CREATE OR REPLACE FUNCTION public.check_family_access_rate_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  access_count integer;
BEGIN
  -- SÉCURITÉ: Uniquement pour l'utilisateur authentifié ou les admins
  IF user_uuid != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own rate limit';
  END IF;
  
  SELECT COUNT(*) INTO access_count
  FROM public.family_access_audit 
  WHERE accessed_by = user_uuid 
  AND access_timestamp > (now() - INTERVAL '1 hour');
  
  RETURN access_count < 50;
END;
$function$
```

---

### 9. `get_family_contact_secure(family_member_uuid uuid)`
**Risque:** 🟢 BON - Vérifications de sécurité ultra-strictes ✅
```sql
-- ✅ Vérifie auth.uid() = user_id OU invited_user_id
-- ✅ Vérifie email_verified ET id_verified (score ≥85)
-- ✅ Vérifie is_wali = true
-- ✅ Vérifie invitation acceptée récemment (7 jours)
-- ✅ Audit logging complet
-- ✅ Incrémente access_count
```
**Recommandation:** Excellente implémentation de sécurité. Aucune correction nécessaire.

---

### 10. Fonctions Helper (is_own_profile, is_family_supervised, etc.)
**Risque:** 🟢 BON - Utilisent auth.uid() correctement ✅
```sql
-- ✅ is_own_profile: Compare avec auth.uid()
-- ✅ is_family_supervised: Vérifie auth.uid()
-- ✅ is_family_wali: Vérifie auth.uid() + conditions strictes
-- ✅ is_matched_user: Vérifie auth.uid()
```
**Recommandation:** Ces fonctions sont correctement sécurisées.

---

## 📊 Résumé de l'Audit

### Fonctions à Corriger IMMÉDIATEMENT (🔴 Critique)
1. ❌ `is_user_in_active_conversation` - Aucune vérification d'autorisation
2. ❌ `has_previous_conversation` - Aucune vérification d'autorisation
3. ❌ `get_user_verification_status_secure` - Aucune restriction d'accès

### Fonctions à Améliorer (🟡 Moyen)
4. ⚠️ `is_premium_active` - Devrait restreindre l'accès
5. ⚠️ `check_family_access_rate_limit` - Devrait restreindre l'accès

### Fonctions Sécurisées (🟢 Bon)
6. ✅ `get_family_member_contact_secure` - Excellent
7. ✅ `get_current_user_role_secure` - Correct
8. ✅ `can_access_match_security_definer` - Correct
9. ✅ `get_family_contact_secure` - Excellent
10. ✅ Fonctions helper (is_own_profile, etc.) - Correctes

---

## 🔒 Principes de Sécurité pour SECURITY DEFINER

### ✅ TOUJOURS Faire:
1. **Vérifier auth.uid()** au début de la fonction
2. **Valider l'autorisation** avant de retourner des données
3. **Utiliser SET search_path = 'public'** pour éviter les attaques par search path
4. **Logger les accès** aux données sensibles
5. **Limiter les résultats** aux données strictement nécessaires
6. **Documenter** pourquoi SECURITY DEFINER est nécessaire

### ❌ JAMAIS Faire:
1. ❌ Permettre l'accès sans vérifier auth.uid()
2. ❌ Retourner des données d'autres utilisateurs sans validation
3. ❌ Utiliser des paramètres non validés directement
4. ❌ Oublier SET search_path
5. ❌ Créer des fonctions SECURITY DEFINER par défaut

---

## 🛠️ Plan de Correction

### Phase 1: Corrections Critiques (Aujourd'hui)
- [ ] Corriger `is_user_in_active_conversation`
- [ ] Corriger `has_previous_conversation`
- [ ] Corriger `get_user_verification_status_secure`

### Phase 2: Améliorations (Cette semaine)
- [ ] Améliorer `is_premium_active`
- [ ] Améliorer `check_family_access_rate_limit`
- [ ] Ajouter des tests de sécurité automatisés
- [ ] Documenter toutes les fonctions SECURITY DEFINER

### Phase 3: Prévention (Ce mois)
- [ ] Créer une checklist de revue pour les nouvelles fonctions
- [ ] Implémenter des tests de sécurité dans le CI/CD
- [ ] Former l'équipe sur les risques SECURITY DEFINER
- [ ] Audit trimestriel des fonctions existantes
