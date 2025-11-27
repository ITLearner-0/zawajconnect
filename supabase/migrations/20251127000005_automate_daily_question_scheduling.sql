-- Migration: Automate Daily Question Scheduling
-- Description: Create functions and cron jobs to automatically schedule daily questions

-- ============================================================================
-- FUNCTION 1: Auto-generate daily question schedules
-- ============================================================================
-- This function ensures we always have questions scheduled for the next 90 days
-- It intelligently selects questions based on:
-- - Priority (higher priority questions scheduled first)
-- - Usage frequency (avoids recently used questions)
-- - Active status (only active questions)
CREATE OR REPLACE FUNCTION public.schedule_daily_questions_batch()
RETURNS TABLE(
  scheduled_count INTEGER,
  next_scheduled_date DATE,
  last_scheduled_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_scheduled_count INTEGER := 0;
  v_next_date DATE;
  v_last_date DATE;
  v_lookahead_days INTEGER := 90; -- Schedule 90 days in advance
  v_target_date DATE;
  v_question_id UUID;
BEGIN
  -- Find the last scheduled date
  SELECT COALESCE(MAX(scheduled_date), CURRENT_DATE - 1)
  INTO v_last_date
  FROM public.daily_question_schedule;

  -- Start scheduling from the next available date
  v_next_date := v_last_date + 1;
  v_target_date := CURRENT_DATE + v_lookahead_days;

  -- Loop through each date that needs a scheduled question
  WHILE v_next_date <= v_target_date LOOP
    -- Check if this date already has a scheduled question
    IF NOT EXISTS (
      SELECT 1 FROM public.daily_question_schedule
      WHERE scheduled_date = v_next_date
    ) THEN
      -- Select the best question for this date
      -- Priority: high priority, not recently used, active questions
      SELECT id INTO v_question_id
      FROM public.daily_questions
      WHERE is_active = true
        AND (
          last_used_at IS NULL
          OR last_used_at < CURRENT_DATE - INTERVAL '60 days'
        )
      ORDER BY
        priority DESC,
        used_count ASC,
        last_used_at ASC NULLS FIRST,
        RANDOM()
      LIMIT 1;

      -- If we found a question, schedule it
      IF v_question_id IS NOT NULL THEN
        INSERT INTO public.daily_question_schedule (
          question_id,
          scheduled_date,
          is_sent
        ) VALUES (
          v_question_id,
          v_next_date,
          false
        );

        v_scheduled_count := v_scheduled_count + 1;
      ELSE
        -- If no questions available, log a warning (could add to a logs table)
        RAISE WARNING 'No available questions for date: %', v_next_date;
      END IF;
    END IF;

    -- Move to next date
    v_next_date := v_next_date + 1;
  END LOOP;

  -- Return summary
  RETURN QUERY
  SELECT
    v_scheduled_count,
    v_last_date + 1,
    v_target_date;
END;
$$;

-- Grant execute permission to authenticated users (in case called from edge function)
GRANT EXECUTE ON FUNCTION public.schedule_daily_questions_batch() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.schedule_daily_questions_batch() IS
'Automatically schedules daily questions for the next 90 days. Run daily via cron job.';


-- ============================================================================
-- FUNCTION 2: Mark daily question as sent (called by notification system)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mark_daily_question_sent(p_scheduled_date DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.daily_question_schedule
  SET is_sent = true
  WHERE scheduled_date = p_scheduled_date
    AND is_sent = false;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_daily_question_sent(DATE) TO authenticated;

COMMENT ON FUNCTION public.mark_daily_question_sent(DATE) IS
'Marks a scheduled question as sent after notification delivery.';


-- ============================================================================
-- FUNCTION 3: Get active users for daily notification
-- ============================================================================
-- Returns users who should receive the daily question notification
CREATE OR REPLACE FUNCTION public.get_users_for_daily_notification()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  preferred_language TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    au.email,
    p.full_name,
    COALESCE(p.preferred_language, 'fr') as preferred_language
  FROM auth.users au
  INNER JOIN public.profiles p ON p.id = au.id
  WHERE p.is_active = true
    AND p.email_verified = true
    -- Only include users who haven't already answered today's question
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_daily_answers uda
      INNER JOIN public.daily_question_schedule dqs
        ON dqs.question_id = uda.question_id
      WHERE uda.user_id = p.id
        AND dqs.scheduled_date = CURRENT_DATE
    )
    -- Respect notification preferences if they exist
    AND (
      p.notification_preferences IS NULL
      OR (p.notification_preferences->>'daily_question_enabled')::boolean IS NOT FALSE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_for_daily_notification() TO authenticated;

COMMENT ON FUNCTION public.get_users_for_daily_notification() IS
'Returns list of active users who should receive daily question notifications.';


-- ============================================================================
-- FUNCTION 4: Get scheduling statistics (useful for admin dashboard)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_daily_question_schedule_stats()
RETURNS TABLE(
  total_scheduled INTEGER,
  next_unscheduled_date DATE,
  days_scheduled_ahead INTEGER,
  total_questions_sent INTEGER,
  avg_daily_responses NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_scheduled_date DATE;
BEGIN
  -- Get the last scheduled date
  SELECT MAX(scheduled_date) INTO v_last_scheduled_date
  FROM public.daily_question_schedule;

  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_scheduled,
    COALESCE(v_last_scheduled_date + 1, CURRENT_DATE) as next_unscheduled_date,
    CASE
      WHEN v_last_scheduled_date IS NULL THEN 0
      ELSE (v_last_scheduled_date - CURRENT_DATE)::INTEGER
    END as days_scheduled_ahead,
    COUNT(*) FILTER (WHERE is_sent = true)::INTEGER as total_questions_sent,
    AVG(total_responses)::NUMERIC as avg_daily_responses
  FROM public.daily_question_schedule;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_daily_question_schedule_stats() TO authenticated;

COMMENT ON FUNCTION public.get_daily_question_schedule_stats() IS
'Returns statistics about the daily question scheduling system.';


-- ============================================================================
-- SETUP pg_cron EXTENSION (if not already enabled)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres (cron runs as postgres user)
GRANT USAGE ON SCHEMA cron TO postgres;


-- ============================================================================
-- CRON JOB 1: Auto-schedule questions daily at 11:30 PM
-- ============================================================================
-- This ensures we always have questions scheduled 90 days in advance
SELECT cron.schedule(
  'auto-schedule-daily-questions',           -- Job name
  '30 23 * * *',                             -- Run at 11:30 PM every day (cron format)
  $$
  SELECT public.schedule_daily_questions_batch();
  $$
);

COMMENT ON EXTENSION pg_cron IS
'Cron job: auto-schedule-daily-questions runs daily at 11:30 PM to ensure questions are scheduled 90 days ahead.';


-- ============================================================================
-- CRON JOB 2: Send daily question notifications at 8:00 AM
-- ============================================================================
-- This will call the edge function to send email notifications
-- First, we need to enable the http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Create a helper function to call the edge function
CREATE OR REPLACE FUNCTION public.trigger_daily_question_notification()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_edge_function_url TEXT;
  v_service_role_key TEXT;
  v_response TEXT;
BEGIN
  -- Get Supabase project URL from config (update this with your actual URL)
  -- This should be set as a database secret or environment variable
  v_edge_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-daily-question-notification';
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Make HTTP POST request to edge function
  -- Note: This requires the http extension and pg_net
  -- If using pg_net instead:
  -- PERFORM net.http_post(
  --   url := v_edge_function_url,
  --   headers := jsonb_build_object('Authorization', 'Bearer ' || v_service_role_key),
  --   body := jsonb_build_object('scheduled_date', CURRENT_DATE)
  -- );

  -- For now, just log that we attempted to trigger (update with actual implementation)
  RAISE NOTICE 'Daily question notification trigger attempted for date: %', CURRENT_DATE;

  -- Mark question as sent
  PERFORM public.mark_daily_question_sent(CURRENT_DATE);

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to trigger daily question notification: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.trigger_daily_question_notification() TO postgres;

-- Schedule the notification job for 8:00 AM daily
SELECT cron.schedule(
  'send-daily-question-notification',        -- Job name
  '0 8 * * *',                               -- Run at 8:00 AM every day
  $$
  SELECT public.trigger_daily_question_notification();
  $$
);


-- ============================================================================
-- INITIAL POPULATION: Schedule questions for next 90 days if not already done
-- ============================================================================
-- Run the batch scheduler immediately to populate initial schedule
SELECT public.schedule_daily_questions_batch();


-- ============================================================================
-- HELPFUL QUERIES FOR MONITORING
-- ============================================================================

-- View all cron jobs
-- SELECT * FROM cron.job;

-- View cron job run history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Unschedule a job if needed:
-- SELECT cron.unschedule('auto-schedule-daily-questions');
-- SELECT cron.unschedule('send-daily-question-notification');

-- Check scheduled questions for next 30 days:
-- SELECT
--   dqs.scheduled_date,
--   dq.question_text,
--   dq.category,
--   dqs.is_sent,
--   dqs.total_responses
-- FROM daily_question_schedule dqs
-- JOIN daily_questions dq ON dq.id = dqs.question_id
-- WHERE dqs.scheduled_date >= CURRENT_DATE
-- ORDER BY dqs.scheduled_date
-- LIMIT 30;

-- Check scheduling statistics:
-- SELECT * FROM public.get_daily_question_schedule_stats();
