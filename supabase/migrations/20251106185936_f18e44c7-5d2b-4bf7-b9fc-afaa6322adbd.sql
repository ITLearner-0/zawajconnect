-- Create onboarding analytics events table
CREATE TABLE IF NOT EXISTS public.onboarding_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  step_number INTEGER,
  step_name TEXT,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  time_spent_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_user_id ON public.onboarding_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_event_type ON public.onboarding_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_created_at ON public.onboarding_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_step_number ON public.onboarding_analytics(step_number);

-- Enable RLS
ALTER TABLE public.onboarding_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own analytics events
CREATE POLICY "Users can insert own analytics events"
ON public.onboarding_analytics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own analytics
CREATE POLICY "Users can view own analytics"
ON public.onboarding_analytics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
ON public.onboarding_analytics
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Create a view for onboarding analytics summary
CREATE OR REPLACE VIEW public.onboarding_analytics_summary AS
SELECT 
  step_number,
  step_name,
  COUNT(*) as total_visits,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(time_spent_seconds) as avg_time_spent,
  COUNT(CASE WHEN event_type = 'step_abandoned' THEN 1 END) as abandonment_count,
  COUNT(CASE WHEN event_type = 'validation_error' THEN 1 END) as validation_error_count,
  ROUND(
    (COUNT(CASE WHEN event_type = 'step_abandoned' THEN 1 END)::numeric / 
     NULLIF(COUNT(CASE WHEN event_type = 'step_started' THEN 1 END), 0) * 100), 2
  ) as abandonment_rate,
  MAX(created_at) as last_event_at
FROM public.onboarding_analytics
WHERE step_number IS NOT NULL
GROUP BY step_number, step_name
ORDER BY step_number;

-- Grant access to the view for admins
GRANT SELECT ON public.onboarding_analytics_summary TO authenticated;

-- Create a function to get validation error statistics
CREATE OR REPLACE FUNCTION public.get_validation_error_stats(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  field_name TEXT,
  error_count BIGINT,
  error_percentage NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    error_detail->>'field' as field_name,
    COUNT(*) as error_count,
    ROUND(
      (COUNT(*)::numeric / 
       (SELECT COUNT(*) FROM onboarding_analytics 
        WHERE event_type = 'validation_error' 
        AND created_at >= now() - (days_back || ' days')::interval) * 100
      ), 2
    ) as error_percentage
  FROM onboarding_analytics,
       jsonb_array_elements(validation_errors) as error_detail
  WHERE event_type = 'validation_error'
    AND created_at >= now() - (days_back || ' days')::interval
  GROUP BY error_detail->>'field'
  ORDER BY error_count DESC;
END;
$$;

-- Create a function to get onboarding completion funnel
CREATE OR REPLACE FUNCTION public.get_onboarding_funnel(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  step_number INTEGER,
  step_name TEXT,
  users_started BIGINT,
  users_completed BIGINT,
  completion_rate NUMERIC,
  avg_time_seconds NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oa.step_number,
    oa.step_name,
    COUNT(DISTINCT CASE WHEN oa.event_type = 'step_started' THEN oa.user_id END) as users_started,
    COUNT(DISTINCT CASE WHEN oa.event_type = 'step_completed' THEN oa.user_id END) as users_completed,
    ROUND(
      (COUNT(DISTINCT CASE WHEN oa.event_type = 'step_completed' THEN oa.user_id END)::numeric / 
       NULLIF(COUNT(DISTINCT CASE WHEN oa.event_type = 'step_started' THEN oa.user_id END), 0) * 100
      ), 2
    ) as completion_rate,
    ROUND(AVG(oa.time_spent_seconds)::numeric, 2) as avg_time_seconds
  FROM onboarding_analytics oa
  WHERE oa.created_at >= now() - (days_back || ' days')::interval
    AND oa.step_number IS NOT NULL
  GROUP BY oa.step_number, oa.step_name
  ORDER BY oa.step_number;
END;
$$;

COMMENT ON TABLE public.onboarding_analytics IS 'Stores analytics events for the onboarding process';
COMMENT ON COLUMN public.onboarding_analytics.event_type IS 'Type of event: step_started, step_completed, step_abandoned, validation_error, onboarding_completed';
COMMENT ON COLUMN public.onboarding_analytics.validation_errors IS 'Array of validation errors encountered';
COMMENT ON COLUMN public.onboarding_analytics.time_spent_seconds IS 'Time spent on a particular step or action';