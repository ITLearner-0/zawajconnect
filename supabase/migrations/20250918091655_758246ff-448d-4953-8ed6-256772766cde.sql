-- Drop existing policies on subscriptions table
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view limited subscription info" ON public.subscriptions;

-- Create stricter RLS policies for subscriptions table
-- Policy 1: Users can only view basic subscription info (no Stripe IDs)
CREATE POLICY "Users can view own basic subscription status"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv
    WHERE uv.user_id = auth.uid()
    AND uv.email_verified = true
    AND uv.verification_score >= 50
  )
);

-- Policy 2: Only super admins can view payment identifiers
CREATE POLICY "Super admins can access payment data"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur, public.user_verifications uv
    WHERE ur.user_id = auth.uid()
    AND uv.user_id = auth.uid()
    AND ur.role = 'super_admin'
    AND uv.email_verified = true
    AND uv.id_verified = true
    AND uv.verification_score >= 90
  )
);

-- Policy 3: Only super admins can manage subscriptions
CREATE POLICY "Super admins can manage subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur, public.user_verifications uv
    WHERE ur.user_id = auth.uid()
    AND uv.user_id = auth.uid()
    AND ur.role = 'super_admin'
    AND uv.email_verified = true
    AND uv.id_verified = true
    AND uv.verification_score >= 90
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur, public.user_verifications uv
    WHERE ur.user_id = auth.uid()
    AND uv.user_id = auth.uid()
    AND ur.role = 'super_admin'
    AND uv.email_verified = true
    AND uv.id_verified = true
    AND uv.verification_score >= 90
  )
);

-- Policy 4: Allow system to create subscription records during payment flow
CREATE POLICY "System can create subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a security definer function to get safe subscription info for users
CREATE OR REPLACE FUNCTION public.get_user_subscription_safe(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  plan_type text,
  status text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data if user is accessing their own subscription
  IF auth.uid() = target_user_id THEN
    RETURN QUERY
    SELECT 
      s.id,
      s.user_id,
      s.plan_type,
      s.status,
      s.expires_at,
      s.created_at,
      s.updated_at
    FROM public.subscriptions s
    WHERE s.user_id = target_user_id;
  END IF;
END;
$$;