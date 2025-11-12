-- Remove the anonymous public access policy
DROP POLICY IF EXISTS "Anonymous users can only read published guidance" ON public.islamic_guidance;

-- Keep the authenticated user policy but make it more explicit
DROP POLICY IF EXISTS "Everyone can read published guidance" ON public.islamic_guidance;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can read published guidance" 
ON public.islamic_guidance 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND published = true
);

-- Add a policy for premium users to access all content (if needed)
CREATE POLICY "Premium users can access all guidance" 
ON public.islamic_guidance 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND published = true
  AND EXISTS (
    SELECT 1 FROM public.subscriptions s 
    WHERE s.user_id = auth.uid() 
    AND s.status = 'active' 
    AND s.plan_type IN ('premium', 'family')
  )
);