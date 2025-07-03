-- Fix infinite recursion in user_roles RLS policies
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a security definer function to safely check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    AND user_roles.role = 'admin'::app_role
  );
$$;

-- Create new safe RLS policies using the security definer function
CREATE POLICY "Safe admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Safe users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());