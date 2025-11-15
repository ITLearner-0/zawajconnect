-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_wali_email_history(UUID, INTEGER);

-- Create wali_admin_alerts table
CREATE TABLE IF NOT EXISTS public.wali_admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  suspicious_pattern TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  admin_notified BOOLEAN DEFAULT FALSE,
  admin_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wali_admin_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wali_admin_alerts
DROP POLICY IF EXISTS "Admins can view all wali alerts" ON public.wali_admin_alerts;
CREATE POLICY "Admins can view all wali alerts"
ON public.wali_admin_alerts
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update wali alerts" ON public.wali_admin_alerts;
CREATE POLICY "Admins can update wali alerts"
ON public.wali_admin_alerts
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "System can insert wali alerts" ON public.wali_admin_alerts;
CREATE POLICY "System can insert wali alerts"
ON public.wali_admin_alerts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wali_admin_alerts_wali_user 
ON public.wali_admin_alerts(wali_user_id);

CREATE INDEX IF NOT EXISTS idx_wali_admin_alerts_risk_level 
ON public.wali_admin_alerts(risk_level);

CREATE INDEX IF NOT EXISTS idx_wali_admin_alerts_acknowledged 
ON public.wali_admin_alerts(acknowledged);

CREATE INDEX IF NOT EXISTS idx_wali_admin_alerts_created_at 
ON public.wali_admin_alerts(created_at DESC);

-- Now add alert_id column to wali_email_history
ALTER TABLE public.wali_email_history 
ADD COLUMN IF NOT EXISTS alert_id UUID REFERENCES public.wali_admin_alerts(id) ON DELETE CASCADE;

-- Create index for alert_id lookups
CREATE INDEX IF NOT EXISTS idx_wali_email_history_alert_id 
ON public.wali_email_history(alert_id);

-- Create the updated function with alert_id in return type
CREATE OR REPLACE FUNCTION public.get_wali_email_history(
  p_wali_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  wali_user_id UUID,
  sent_by UUID,
  sender_name TEXT,
  email_type TEXT,
  subject TEXT,
  message_content TEXT,
  delivery_status TEXT,
  resend_email_id TEXT,
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  alert_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin OU le wali lui-même
  IF NOT (is_admin(auth.uid()) OR auth.uid() = p_wali_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins or the wali can view email history';
  END IF;

  RETURN QUERY
  SELECT 
    eh.id,
    eh.wali_user_id,
    eh.sent_by,
    COALESCE(p.full_name, 'System') as sender_name,
    eh.email_type,
    eh.subject,
    eh.message_content,
    eh.delivery_status,
    eh.resend_email_id,
    eh.error_message,
    eh.metadata,
    eh.sent_at,
    eh.delivered_at,
    eh.opened_at,
    eh.clicked_at,
    eh.alert_id
  FROM public.wali_email_history eh
  LEFT JOIN public.profiles p ON p.user_id = eh.sent_by
  WHERE eh.wali_user_id = p_wali_user_id
  ORDER BY eh.sent_at DESC
  LIMIT p_limit;
END;
$$;