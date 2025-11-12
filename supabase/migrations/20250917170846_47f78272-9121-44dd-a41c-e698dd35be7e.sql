-- Priority 2: Role Assignment Cleanup and Enhancement
-- Clean up duplicate role assignments and enhance role security

-- First, let's see what roles exist and clean up duplicates
-- Remove duplicate role assignments (keep the most privileged role)
WITH ranked_roles AS (
  SELECT 
    user_id, 
    role, 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY 
        CASE role
          WHEN 'super_admin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'moderator' THEN 3
          WHEN 'user' THEN 4
        END
    ) as rn
  FROM user_roles
)
DELETE FROM user_roles 
WHERE id IN (
  SELECT id FROM ranked_roles WHERE rn > 1
);

-- Create role change audit log table
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on role audit log
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view role audit logs
CREATE POLICY "Admins can view role audit logs" ON role_audit_log
FOR SELECT
USING (is_admin(auth.uid()));

-- Policy: Only super admins can modify roles (insert audit logs)
CREATE POLICY "System can create role audit logs" ON role_audit_log
FOR INSERT
WITH CHECK (true);

-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role insertions
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit_log (user_id, new_role, changed_by, reason)
    VALUES (NEW.user_id, NEW.role, NEW.assigned_by, 'Role assigned');
    RETURN NEW;
  END IF;
  
  -- Log role updates
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.role_audit_log (user_id, old_role, new_role, changed_by, reason)
    VALUES (NEW.user_id, OLD.role, NEW.role, NEW.assigned_by, 'Role updated');
    RETURN NEW;
  END IF;
  
  -- Log role deletions
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_audit_log (user_id, old_role, changed_by, reason)
    VALUES (OLD.user_id, OLD.role, auth.uid(), 'Role removed');
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for role audit logging
DROP TRIGGER IF EXISTS role_audit_trigger ON user_roles;
CREATE TRIGGER role_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION log_role_change();

-- Enhance user_roles table policies
DROP POLICY IF EXISTS "Admins can manage moderator and user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view admin and below roles" ON user_roles;

-- New enhanced policies with audit trail
CREATE POLICY "Super admins can manage all roles" ON user_roles
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can manage moderator and user roles only" ON user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND role IN ('moderator'::app_role, 'user'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND role IN ('moderator'::app_role, 'user'::app_role)
);

CREATE POLICY "Users can view their own role" ON user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create enhanced verification requirements table
CREATE TABLE IF NOT EXISTS public.verification_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  min_verification_score INTEGER NOT NULL DEFAULT 0,
  requires_email_verification BOOLEAN DEFAULT true,
  requires_id_verification BOOLEAN DEFAULT false,
  requires_family_approval BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default verification requirements
INSERT INTO public.verification_requirements (
  feature_name, 
  min_verification_score, 
  requires_email_verification, 
  requires_id_verification,
  requires_family_approval
) VALUES
  ('view_profiles', 30, true, false, false),
  ('send_messages', 50, true, false, false),
  ('access_premium_features', 60, true, true, false),
  ('family_supervision', 80, true, true, true),
  ('admin_access', 90, true, true, false)
ON CONFLICT (feature_name) DO NOTHING;

-- Enable RLS on verification requirements
ALTER TABLE public.verification_requirements ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage verification requirements
CREATE POLICY "Admins can manage verification requirements" ON verification_requirements
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy: All authenticated users can view requirements
CREATE POLICY "Users can view verification requirements" ON verification_requirements
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create function to check feature access
CREATE OR REPLACE FUNCTION public.check_feature_access(
  target_user_id UUID,
  feature_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  requirements RECORD;
  user_verification RECORD;
BEGIN
  -- Get feature requirements
  SELECT * INTO requirements
  FROM public.verification_requirements
  WHERE verification_requirements.feature_name = check_feature_access.feature_name
  AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Get user verification status
  SELECT * INTO user_verification
  FROM public.user_verifications
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check requirements
  IF requirements.requires_email_verification AND NOT user_verification.email_verified THEN
    RETURN false;
  END IF;
  
  IF requirements.requires_id_verification AND NOT user_verification.id_verified THEN
    RETURN false;
  END IF;
  
  IF user_verification.verification_score < requirements.min_verification_score THEN
    RETURN false;
  END IF;
  
  -- Check family approval if required
  IF requirements.requires_family_approval THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.user_id = target_user_id
      AND fm.is_wali = true
      AND fm.invitation_status = 'accepted'
    ) THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Update matching preferences to use verification requirements
DROP POLICY IF EXISTS "Users can manage their own matching preferences" ON matching_preferences;

CREATE POLICY "Verified users can manage matching preferences" ON matching_preferences
FOR ALL
USING (
  auth.uid() = user_id 
  AND check_feature_access(auth.uid(), 'view_profiles')
)
WITH CHECK (
  auth.uid() = user_id 
  AND check_feature_access(auth.uid(), 'view_profiles')
);