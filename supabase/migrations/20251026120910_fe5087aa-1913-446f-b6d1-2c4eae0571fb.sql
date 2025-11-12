-- Phase 1 : Insérer l'abonnement premium pour Aya Ka
INSERT INTO subscriptions (
  user_id,
  plan_type,
  status,
  expires_at,
  created_at,
  updated_at
)
SELECT 
  id,
  'premium_12_months',
  'active',
  '2026-10-23 23:59:59+00',
  now(),
  now()
FROM auth.users 
WHERE email = 'ayakamara531@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = 'premium_12_months',
  status = 'active',
  expires_at = '2026-10-23 23:59:59+00',
  updated_at = now();

-- Phase 2 : Créer une fonction RLS pour vérification directe
CREATE OR REPLACE FUNCTION public.is_premium_active(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- Phase 3 : Ajouter une politique RLS pour permettre la lecture
CREATE POLICY "Users can read own subscription"
ON subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);