-- Create enum for admin permission levels
CREATE TYPE public.wali_admin_role AS ENUM ('viewer', 'editor', 'approver', 'super_admin');

-- Create table for wali admin permissions
CREATE TABLE public.wali_admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role wali_admin_role NOT NULL DEFAULT 'viewer',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.wali_admin_permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check wali admin role
CREATE OR REPLACE FUNCTION public.has_wali_admin_role(_user_id UUID, _role wali_admin_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wali_admin_permissions
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has at least a certain permission level
CREATE OR REPLACE FUNCTION public.has_wali_admin_permission(_user_id UUID, _min_role wali_admin_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wali_admin_permissions
    WHERE user_id = _user_id
      AND (
        (role = 'super_admin') OR
        (role = 'approver' AND _min_role IN ('approver', 'editor', 'viewer')) OR
        (role = 'editor' AND _min_role IN ('editor', 'viewer')) OR
        (role = 'viewer' AND _min_role = 'viewer')
      )
  )
$$;

-- RLS Policies for wali_admin_permissions
CREATE POLICY "Super admins can view all wali admin permissions"
  ON public.wali_admin_permissions
  FOR SELECT
  USING (public.has_wali_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view their own permissions"
  ON public.wali_admin_permissions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Only super admins can insert wali admin permissions"
  ON public.wali_admin_permissions
  FOR INSERT
  WITH CHECK (public.has_wali_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super admins can update wali admin permissions"
  ON public.wali_admin_permissions
  FOR UPDATE
  USING (public.has_wali_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super admins can delete wali admin permissions"
  ON public.wali_admin_permissions
  FOR DELETE
  USING (public.has_wali_admin_role(auth.uid(), 'super_admin'));

-- Create indexes for performance
CREATE INDEX idx_wali_admin_permissions_user_id ON public.wali_admin_permissions(user_id);
CREATE INDEX idx_wali_admin_permissions_role ON public.wali_admin_permissions(role);

-- Create audit log for permission changes
CREATE TABLE public.wali_admin_permission_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role wali_admin_role,
  new_role wali_admin_role NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.wali_admin_permission_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view permission audit logs"
  ON public.wali_admin_permission_audit
  FOR SELECT
  USING (public.has_wali_admin_role(auth.uid(), 'super_admin'));

-- Create trigger to log permission changes
CREATE OR REPLACE FUNCTION public.log_wali_admin_permission_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.wali_admin_permission_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, OLD.role, NEW.role, auth.uid());
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.wali_admin_permission_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, NULL, NEW.role, COALESCE(auth.uid(), NEW.assigned_by));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_wali_admin_permission_changes
  AFTER INSERT OR UPDATE ON public.wali_admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_wali_admin_permission_change();