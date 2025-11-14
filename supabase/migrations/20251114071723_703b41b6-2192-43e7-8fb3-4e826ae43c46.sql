-- Function to calculate Wali KPIs with period comparison
CREATE OR REPLACE FUNCTION public.get_wali_kpis(
  p_current_start DATE,
  p_current_end DATE,
  p_previous_start DATE,
  p_previous_end DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_current_data JSON;
  v_previous_data JSON;
BEGIN
  -- Calculate current period metrics
  WITH current_metrics AS (
    SELECT
      -- Registration metrics
      COUNT(*) FILTER (WHERE created_at >= p_current_start AND created_at < p_current_end) as total_registrations,
      COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at >= p_current_start AND reviewed_at < p_current_end) as approved_count,
      COUNT(*) FILTER (WHERE status = 'rejected' AND reviewed_at >= p_current_start AND reviewed_at < p_current_end) as rejected_count,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      
      -- Average processing time (in hours)
      AVG(
        EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600
      ) FILTER (WHERE reviewed_at IS NOT NULL AND reviewed_at >= p_current_start AND reviewed_at < p_current_end) as avg_processing_time_hours,
      
      -- Approval rate
      CASE 
        WHEN COUNT(*) FILTER (WHERE reviewed_at >= p_current_start AND reviewed_at < p_current_end) > 0
        THEN (COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at >= p_current_start AND reviewed_at < p_current_end)::FLOAT / 
              COUNT(*) FILTER (WHERE reviewed_at >= p_current_start AND reviewed_at < p_current_end)::FLOAT * 100)
        ELSE 0
      END as approval_rate
    FROM wali_registrations
  ),
  previous_metrics AS (
    SELECT
      COUNT(*) FILTER (WHERE created_at >= p_previous_start AND created_at < p_previous_end) as total_registrations,
      COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at >= p_previous_start AND reviewed_at < p_previous_end) as approved_count,
      COUNT(*) FILTER (WHERE status = 'rejected' AND reviewed_at >= p_previous_start AND reviewed_at < p_previous_end) as rejected_count,
      
      AVG(
        EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600
      ) FILTER (WHERE reviewed_at IS NOT NULL AND reviewed_at >= p_previous_start AND reviewed_at < p_previous_end) as avg_processing_time_hours,
      
      CASE 
        WHEN COUNT(*) FILTER (WHERE reviewed_at >= p_previous_start AND reviewed_at < p_previous_end) > 0
        THEN (COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at >= p_previous_start AND reviewed_at < p_previous_end)::FLOAT / 
              COUNT(*) FILTER (WHERE reviewed_at >= p_previous_start AND reviewed_at < p_previous_end)::FLOAT * 100)
        ELSE 0
      END as approval_rate
    FROM wali_registrations
  ),
  alert_metrics AS (
    SELECT
      COUNT(*) FILTER (WHERE created_at >= p_current_start AND created_at < p_current_end) as current_alerts,
      COUNT(*) FILTER (WHERE created_at >= p_previous_start AND created_at < p_previous_end) as previous_alerts,
      COUNT(*) FILTER (WHERE created_at >= p_current_start AND created_at < p_current_end AND risk_level = 'critical') as current_critical,
      COUNT(*) FILTER (WHERE created_at >= p_previous_start AND created_at < p_previous_end AND risk_level = 'critical') as previous_critical,
      ROUND(
        COUNT(*) FILTER (WHERE created_at >= p_current_start AND created_at < p_current_end)::NUMERIC / 
        GREATEST(EXTRACT(DAY FROM (p_current_end - p_current_start)), 1), 2
      ) as alerts_per_day
    FROM wali_admin_alerts
  )
  SELECT json_build_object(
    'current', json_build_object(
      'total_registrations', cm.total_registrations,
      'approved_count', cm.approved_count,
      'rejected_count', cm.rejected_count,
      'pending_count', cm.pending_count,
      'avg_processing_time_hours', ROUND(COALESCE(cm.avg_processing_time_hours, 0)::NUMERIC, 2),
      'approval_rate', ROUND(COALESCE(cm.approval_rate, 0)::NUMERIC, 2),
      'total_alerts', am.current_alerts,
      'critical_alerts', am.current_critical,
      'alerts_per_day', am.alerts_per_day
    ),
    'previous', json_build_object(
      'total_registrations', pm.total_registrations,
      'approved_count', pm.approved_count,
      'rejected_count', pm.rejected_count,
      'avg_processing_time_hours', ROUND(COALESCE(pm.avg_processing_time_hours, 0)::NUMERIC, 2),
      'approval_rate', ROUND(COALESCE(pm.approval_rate, 0)::NUMERIC, 2),
      'total_alerts', am.previous_alerts,
      'critical_alerts', am.previous_critical
    ),
    'comparison', json_build_object(
      'registrations_change', CASE 
        WHEN pm.total_registrations > 0 
        THEN ROUND(((cm.total_registrations - pm.total_registrations)::NUMERIC / pm.total_registrations::NUMERIC * 100), 2)
        ELSE 0 
      END,
      'approval_rate_change', ROUND((cm.approval_rate - pm.approval_rate)::NUMERIC, 2),
      'processing_time_change', CASE 
        WHEN pm.avg_processing_time_hours > 0 
        THEN ROUND(((cm.avg_processing_time_hours - pm.avg_processing_time_hours) / pm.avg_processing_time_hours * 100)::NUMERIC, 2)
        ELSE 0 
      END,
      'alerts_change', CASE 
        WHEN am.previous_alerts > 0 
        THEN ROUND(((am.current_alerts - am.previous_alerts)::NUMERIC / am.previous_alerts::NUMERIC * 100), 2)
        ELSE 0 
      END
    )
  ) INTO v_result
  FROM current_metrics cm, previous_metrics pm, alert_metrics am;

  RETURN v_result;
END;
$$;