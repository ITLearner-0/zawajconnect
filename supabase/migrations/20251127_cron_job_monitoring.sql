-- =====================================================
-- CRON JOB MONITORING SYSTEM
-- =====================================================
-- This migration creates tables and functions for monitoring
-- scheduled jobs and cron tasks in the system

-- Table: cron_job_logs
-- Stores execution history of all cron jobs and scheduled tasks
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('edge_function', 'scheduled_task', 'database_function', 'external_api')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'error', 'timeout', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  error_stack TEXT,
  execution_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name ON cron_job_logs(job_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON cron_job_logs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_created ON cron_job_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_job_type ON cron_job_logs(job_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_errors ON cron_job_logs(status, created_at DESC) WHERE status = 'error';

-- RLS Policies for cron_job_logs
ALTER TABLE cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view cron logs
CREATE POLICY "Only admins can view cron logs"
  ON cron_job_logs FOR SELECT
  USING (is_admin(auth.uid()));

-- System can insert logs (service_role)
CREATE POLICY "System can insert cron logs"
  ON cron_job_logs FOR INSERT
  WITH CHECK (true);

-- System can update logs (service_role)
CREATE POLICY "System can update cron logs"
  ON cron_job_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Table: cron_job_schedules
-- Stores configuration and schedule for each cron job
CREATE TABLE IF NOT EXISTS cron_job_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL CHECK (job_type IN ('edge_function', 'scheduled_task', 'database_function', 'external_api')),
  description TEXT,
  schedule_cron TEXT NOT NULL, -- Cron expression (e.g., "0 9 * * *")
  is_active BOOLEAN DEFAULT true,
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  last_status TEXT CHECK (last_status IN ('success', 'error', 'timeout', 'cancelled')),
  config JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for schedules
CREATE INDEX IF NOT EXISTS idx_cron_schedules_active ON cron_job_schedules(is_active, next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cron_schedules_name ON cron_job_schedules(job_name);

-- RLS Policies for cron_job_schedules
ALTER TABLE cron_job_schedules ENABLE ROW LEVEL SECURITY;

-- Only admins can view schedules
CREATE POLICY "Only admins can view cron schedules"
  ON cron_job_schedules FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can manage schedules
CREATE POLICY "Only admins can manage cron schedules"
  ON cron_job_schedules FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to start a cron job execution log
CREATE OR REPLACE FUNCTION start_cron_job_log(
  p_job_name TEXT,
  p_job_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO cron_job_logs (
    job_name,
    job_type,
    status,
    started_at,
    metadata
  ) VALUES (
    p_job_name,
    p_job_type,
    'running',
    now(),
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a cron job execution log
CREATE OR REPLACE FUNCTION complete_cron_job_log(
  p_log_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL,
  p_error_stack TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_started_at TIMESTAMPTZ;
  v_duration_ms INTEGER;
BEGIN
  -- Get start time to calculate duration
  SELECT started_at INTO v_started_at
  FROM cron_job_logs
  WHERE id = p_log_id;

  v_duration_ms := EXTRACT(EPOCH FROM (now() - v_started_at)) * 1000;

  UPDATE cron_job_logs
  SET status = p_status,
      completed_at = now(),
      duration_ms = v_duration_ms,
      error_message = p_error_message,
      error_stack = p_error_stack,
      metadata = COALESCE(p_metadata, metadata),
      updated_at = now()
  WHERE id = p_log_id;

  -- Update schedule last run
  UPDATE cron_job_schedules
  SET last_run_at = now(),
      last_status = p_status,
      updated_at = now()
  WHERE job_name = (SELECT job_name FROM cron_job_logs WHERE id = p_log_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old cron logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_cron_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM cron_job_logs
  WHERE created_at < now() - INTERVAL '90 days'
  AND status IN ('success', 'cancelled');

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cron job statistics
CREATE OR REPLACE FUNCTION get_cron_job_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  job_name TEXT,
  total_executions BIGINT,
  success_count BIGINT,
  error_count BIGINT,
  avg_duration_ms NUMERIC,
  last_run_at TIMESTAMPTZ,
  last_status TEXT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.job_name,
    COUNT(*)::BIGINT as total_executions,
    COUNT(*) FILTER (WHERE l.status = 'success')::BIGINT as success_count,
    COUNT(*) FILTER (WHERE l.status = 'error')::BIGINT as error_count,
    ROUND(AVG(l.duration_ms)::NUMERIC, 2) as avg_duration_ms,
    MAX(l.completed_at) as last_run_at,
    (SELECT status FROM cron_job_logs WHERE job_name = l.job_name ORDER BY created_at DESC LIMIT 1) as last_status,
    ROUND((COUNT(*) FILTER (WHERE l.status = 'success')::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) as success_rate
  FROM cron_job_logs l
  WHERE l.created_at >= now() - (p_days || ' days')::interval
  GROUP BY l.job_name
  ORDER BY last_run_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert the daily question scheduler job
INSERT INTO cron_job_schedules (job_name, job_type, description, schedule_cron, is_active, config)
VALUES (
  'daily-question-scheduler',
  'edge_function',
  'Automated daily question scheduling - runs every day at 9 AM UTC',
  '0 9 * * *',
  true,
  '{"function": "daily-question-scheduler", "timeout_seconds": 60}'::jsonb
)
ON CONFLICT (job_name) DO UPDATE
SET description = EXCLUDED.description,
    schedule_cron = EXCLUDED.schedule_cron,
    updated_at = now();

-- Add comment for documentation
COMMENT ON TABLE cron_job_logs IS 'Logs all cron job executions for monitoring and debugging';
COMMENT ON TABLE cron_job_schedules IS 'Configuration and schedule for all cron jobs in the system';
