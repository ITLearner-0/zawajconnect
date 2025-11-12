-- Mettre à jour la fonction is_premium_user pour supporter les nouveaux types de plans
CREATE OR REPLACE FUNCTION public.is_premium_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM subscriptions s
    WHERE s.user_id = (SELECT auth.uid())
      AND s.status = 'active'
      AND (
        s.plan_type LIKE 'premium%' 
        OR s.plan_type IN ('premium', 'family', 'family_plus')
      )
      AND (s.expires_at IS NULL OR s.expires_at > now())
  );
$function$;