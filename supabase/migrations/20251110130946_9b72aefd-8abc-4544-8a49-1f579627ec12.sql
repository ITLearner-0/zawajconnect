-- Fonction pour marquer une alerte comme traitée
CREATE OR REPLACE FUNCTION acknowledge_wali_alert(
  p_alert_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Only admins can acknowledge alerts';
  END IF;

  UPDATE public.wali_admin_alerts
  SET 
    acknowledged = TRUE,
    acknowledged_by = p_admin_id,
    acknowledged_at = now()
  WHERE id = p_alert_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour suspendre un Wali
CREATE OR REPLACE FUNCTION suspend_wali_user(
  p_wali_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT,
  p_duration_days INT DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
  v_suspension_id UUID;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Only admins can suspend users';
  END IF;

  -- Créer une table de suspension si elle n'existe pas
  CREATE TABLE IF NOT EXISTS public.wali_suspensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wali_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    suspended_by UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    suspended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Enable RLS
  ALTER TABLE public.wali_suspensions ENABLE ROW LEVEL SECURITY;

  -- Policy pour les admins
  DROP POLICY IF EXISTS "Admins can manage suspensions" ON public.wali_suspensions;
  CREATE POLICY "Admins can manage suspensions"
  ON public.wali_suspensions
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

  -- Désactiver les suspensions existantes
  UPDATE public.wali_suspensions
  SET is_active = FALSE
  WHERE wali_user_id = p_wali_user_id
  AND is_active = TRUE;

  -- Créer la nouvelle suspension
  INSERT INTO public.wali_suspensions (
    wali_user_id,
    suspended_by,
    reason,
    expires_at
  ) VALUES (
    p_wali_user_id,
    p_admin_id,
    p_reason,
    now() + (p_duration_days || ' days')::INTERVAL
  )
  RETURNING id INTO v_suspension_id;

  -- Logger l'action
  INSERT INTO public.wali_action_audit (
    wali_user_id,
    action_type,
    action_details,
    success,
    risk_level,
    suspicious_pattern
  ) VALUES (
    p_wali_user_id,
    'wali_suspended',
    jsonb_build_object(
      'suspended_by', p_admin_id,
      'reason', p_reason,
      'duration_days', p_duration_days,
      'suspension_id', v_suspension_id
    ),
    TRUE,
    'critical',
    'Admin suspension'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un Wali est suspendu
CREATE OR REPLACE FUNCTION is_wali_suspended(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.wali_suspensions
    WHERE wali_user_id = p_user_id
    AND is_active = TRUE
    AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques globales des alertes
CREATE OR REPLACE FUNCTION get_wali_alerts_statistics()
RETURNS TABLE (
  total_alerts BIGINT,
  critical_alerts BIGINT,
  high_alerts BIGINT,
  medium_alerts BIGINT,
  low_alerts BIGINT,
  unacknowledged_alerts BIGINT,
  alerts_today BIGINT,
  alerts_this_week BIGINT,
  alerts_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_alerts,
    COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_alerts,
    COUNT(*) FILTER (WHERE risk_level = 'high') as high_alerts,
    COUNT(*) FILTER (WHERE risk_level = 'medium') as medium_alerts,
    COUNT(*) FILTER (WHERE risk_level = 'low') as low_alerts,
    COUNT(*) FILTER (WHERE acknowledged = FALSE) as unacknowledged_alerts,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE) as alerts_today,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '7 days') as alerts_this_week,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as alerts_this_month
  FROM public.wali_admin_alerts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les tendances d'alertes par jour
CREATE OR REPLACE FUNCTION get_wali_alerts_trend(p_days INT DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_count BIGINT,
  critical_count BIGINT,
  high_count BIGINT,
  medium_count BIGINT,
  low_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE as date
  )
  SELECT
    ds.date,
    COALESCE(COUNT(waa.id), 0) as total_count,
    COALESCE(COUNT(waa.id) FILTER (WHERE waa.risk_level = 'critical'), 0) as critical_count,
    COALESCE(COUNT(waa.id) FILTER (WHERE waa.risk_level = 'high'), 0) as high_count,
    COALESCE(COUNT(waa.id) FILTER (WHERE waa.risk_level = 'medium'), 0) as medium_count,
    COALESCE(COUNT(waa.id) FILTER (WHERE waa.risk_level = 'low'), 0) as low_count
  FROM date_series ds
  LEFT JOIN public.wali_admin_alerts waa 
    ON DATE(waa.created_at) = ds.date
  GROUP BY ds.date
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;