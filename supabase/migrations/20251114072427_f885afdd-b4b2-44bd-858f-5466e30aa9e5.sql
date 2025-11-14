-- Create Wali admin audit trail table
CREATE TABLE IF NOT EXISTS public.wali_admin_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  registration_id UUID REFERENCES public.wali_registrations(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wali_audit_admin_user ON public.wali_admin_audit_trail(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_wali_audit_registration ON public.wali_admin_audit_trail(registration_id);
CREATE INDEX IF NOT EXISTS idx_wali_audit_created_at ON public.wali_admin_audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wali_audit_action_type ON public.wali_admin_audit_trail(action_type);

-- Enable RLS
ALTER TABLE public.wali_admin_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Wali admins can view audit logs"
  ON public.wali_admin_audit_trail
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wali_admin_permissions
      WHERE user_id = auth.uid()
      AND role IN ('viewer', 'editor', 'approver', 'super_admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.wali_admin_audit_trail
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create view for audit logs with admin names
CREATE OR REPLACE VIEW public.wali_audit_trail_with_details AS
SELECT 
  wat.id,
  wat.admin_user_id,
  p.full_name as admin_name,
  wat.action_type,
  wat.registration_id,
  wr.full_name as registration_name,
  wat.target_user_id,
  wat.action_details,
  wat.old_values,
  wat.new_values,
  wat.ip_address,
  wat.user_agent,
  wat.success,
  wat.error_message,
  wat.created_at
FROM public.wali_admin_audit_trail wat
LEFT JOIN public.profiles p ON p.user_id = wat.admin_user_id
LEFT JOIN public.wali_registrations wr ON wr.id = wat.registration_id;

-- Grant access to the view
GRANT SELECT ON public.wali_audit_trail_with_details TO authenticated;

-- Create function to log audit actions
CREATE OR REPLACE FUNCTION public.log_wali_admin_action(
  p_action_type TEXT,
  p_registration_id UUID DEFAULT NULL,
  p_target_user_id UUID DEFAULT NULL,
  p_action_details JSONB DEFAULT '{}'::jsonb,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.wali_admin_audit_trail (
    admin_user_id,
    action_type,
    registration_id,
    target_user_id,
    action_details,
    old_values,
    new_values,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_registration_id,
    p_target_user_id,
    p_action_details,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    p_success,
    p_error_message
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;