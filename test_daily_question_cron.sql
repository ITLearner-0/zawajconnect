-- Test Script for Daily Question Cron System
-- Run this script to verify the automated scheduling system is working

-- ============================================================================
-- TEST 1: Check if extensions are enabled
-- ============================================================================
\echo '=== TEST 1: Check Extensions ==='
SELECT
  extname,
  extversion,
  CASE WHEN extname IS NOT NULL THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_extension
WHERE extname IN ('pg_cron', 'http')
ORDER BY extname;

\echo ''

-- ============================================================================
-- TEST 2: Check if cron jobs are scheduled
-- ============================================================================
\echo '=== TEST 2: Check Cron Jobs ==='
SELECT
  jobid,
  jobname,
  schedule,
  command,
  active,
  CASE WHEN active THEN '✅ ACTIVE' ELSE '❌ INACTIVE' END as status
FROM cron.job
WHERE jobname IN (
  'auto-schedule-daily-questions',
  'send-daily-question-notification'
)
ORDER BY jobname;

\echo ''

-- ============================================================================
-- TEST 3: Check if functions exist
-- ============================================================================
\echo '=== TEST 3: Check Database Functions ==='
SELECT
  routine_name,
  routine_type,
  '✅ EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'schedule_daily_questions_batch',
    'mark_daily_question_sent',
    'get_users_for_daily_notification',
    'get_daily_question_schedule_stats',
    'trigger_daily_question_notification'
  )
ORDER BY routine_name;

\echo ''

-- ============================================================================
-- TEST 4: Test schedule_daily_questions_batch() function
-- ============================================================================
\echo '=== TEST 4: Run Schedule Function (Manual Test) ==='
SELECT * FROM schedule_daily_questions_batch();

\echo ''

-- ============================================================================
-- TEST 5: Check scheduled questions
-- ============================================================================
\echo '=== TEST 5: Check Scheduled Questions for Next 10 Days ==='
SELECT
  dqs.scheduled_date,
  LEFT(dq.question_fr, 60) || '...' as question_preview,
  dq.category,
  dq.difficulty_level,
  dqs.is_sent,
  dqs.total_responses,
  CASE
    WHEN dqs.scheduled_date = CURRENT_DATE THEN '📍 TODAY'
    WHEN dqs.scheduled_date > CURRENT_DATE THEN '📅 FUTURE'
    ELSE '✅ PAST'
  END as date_status
FROM daily_question_schedule dqs
JOIN daily_questions dq ON dq.id = dqs.question_id
WHERE dqs.scheduled_date >= CURRENT_DATE
ORDER BY dqs.scheduled_date
LIMIT 10;

\echo ''

-- ============================================================================
-- TEST 6: Get scheduling statistics
-- ============================================================================
\echo '=== TEST 6: Scheduling Statistics ==='
SELECT
  total_scheduled as "Total Scheduled",
  next_unscheduled_date as "Next Unscheduled Date",
  days_scheduled_ahead as "Days Ahead",
  total_questions_sent as "Questions Sent",
  ROUND(avg_daily_responses, 2) as "Avg Responses/Day",
  CASE
    WHEN days_scheduled_ahead >= 60 THEN '✅ HEALTHY (60+ days)'
    WHEN days_scheduled_ahead >= 30 THEN '⚠️ WARNING (30-60 days)'
    ELSE '❌ CRITICAL (< 30 days)'
  END as health_status
FROM get_daily_question_schedule_stats();

\echo ''

-- ============================================================================
-- TEST 7: Check active questions available for scheduling
-- ============================================================================
\echo '=== TEST 7: Active Questions Available ==='
SELECT
  COUNT(*) as total_active_questions,
  COUNT(*) FILTER (WHERE last_used_at IS NULL) as never_used,
  COUNT(*) FILTER (WHERE last_used_at < CURRENT_DATE - INTERVAL '60 days') as available_for_reuse,
  CASE
    WHEN COUNT(*) >= 100 THEN '✅ SUFFICIENT (100+)'
    WHEN COUNT(*) >= 50 THEN '⚠️ LOW (50-99)'
    ELSE '❌ CRITICAL (< 50)'
  END as status
FROM daily_questions
WHERE is_active = true;

\echo ''

-- ============================================================================
-- TEST 8: Check cron job execution history (last 5 runs)
-- ============================================================================
\echo '=== TEST 8: Recent Cron Job Executions ==='
SELECT
  j.jobname,
  jrd.status,
  jrd.start_time,
  jrd.end_time,
  jrd.end_time - jrd.start_time as duration,
  CASE
    WHEN jrd.status = 'succeeded' THEN '✅ SUCCESS'
    WHEN jrd.status = 'failed' THEN '❌ FAILED'
    ELSE '⚠️ ' || UPPER(jrd.status)
  END as result,
  LEFT(COALESCE(jrd.return_message, ''), 100) as message
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.jobid
WHERE j.jobname IN (
  'auto-schedule-daily-questions',
  'send-daily-question-notification'
)
ORDER BY jrd.start_time DESC
LIMIT 5;

\echo ''

-- ============================================================================
-- TEST 9: Check today's question
-- ============================================================================
\echo '=== TEST 9: Today\'s Question ==='
SELECT
  dqs.scheduled_date,
  dq.question_fr as question,
  dq.category,
  dq.subcategory,
  dq.difficulty_level,
  dqs.is_sent,
  dqs.total_responses,
  dqs.total_skips,
  CASE
    WHEN dqs.total_responses > 0
      THEN ROUND((dqs.total_responses::numeric / NULLIF(dqs.total_responses + dqs.total_skips, 0)) * 100, 1) || '%'
    ELSE 'No data'
  END as response_rate
FROM daily_question_schedule dqs
JOIN daily_questions dq ON dq.id = dqs.question_id
WHERE dqs.scheduled_date = CURRENT_DATE;

\echo ''

-- ============================================================================
-- TEST 10: Verify user notification eligibility
-- ============================================================================
\echo '=== TEST 10: Users Eligible for Notifications ==='
SELECT
  COUNT(*) as eligible_users,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ USERS READY'
    ELSE '⚠️ NO USERS ELIGIBLE'
  END as status
FROM get_users_for_daily_notification();

\echo ''

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================
\echo '=== SUMMARY REPORT ==='
\echo ''
SELECT
  '🔧 System Component' as category,
  'Status' as status,
  'Details' as details
UNION ALL
SELECT
  'Extensions (pg_cron, http)',
  CASE
    WHEN (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('pg_cron', 'http')) = 2
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END,
  (SELECT COUNT(*)::text FROM pg_extension WHERE extname IN ('pg_cron', 'http')) || ' of 2 enabled'
UNION ALL
SELECT
  'Cron Jobs Scheduled',
  CASE
    WHEN (SELECT COUNT(*) FROM cron.job WHERE jobname IN ('auto-schedule-daily-questions', 'send-daily-question-notification')) = 2
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END,
  (SELECT COUNT(*)::text FROM cron.job WHERE jobname IN ('auto-schedule-daily-questions', 'send-daily-question-notification')) || ' of 2 jobs'
UNION ALL
SELECT
  'Database Functions',
  CASE
    WHEN (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('schedule_daily_questions_batch', 'mark_daily_question_sent', 'get_users_for_daily_notification', 'get_daily_question_schedule_stats')) >= 4
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END,
  (SELECT COUNT(*)::text FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('schedule_daily_questions_batch', 'mark_daily_question_sent', 'get_users_for_daily_notification', 'get_daily_question_schedule_stats')) || ' functions found'
UNION ALL
SELECT
  'Scheduling Health',
  CASE
    WHEN (SELECT days_scheduled_ahead FROM get_daily_question_schedule_stats()) >= 60
    THEN '✅ HEALTHY'
    WHEN (SELECT days_scheduled_ahead FROM get_daily_question_schedule_stats()) >= 30
    THEN '⚠️ WARNING'
    ELSE '❌ CRITICAL'
  END,
  (SELECT days_scheduled_ahead::text FROM get_daily_question_schedule_stats()) || ' days ahead'
UNION ALL
SELECT
  'Active Questions',
  CASE
    WHEN (SELECT COUNT(*) FROM daily_questions WHERE is_active = true) >= 100
    THEN '✅ SUFFICIENT'
    WHEN (SELECT COUNT(*) FROM daily_questions WHERE is_active = true) >= 50
    THEN '⚠️ LOW'
    ELSE '❌ CRITICAL'
  END,
  (SELECT COUNT(*)::text FROM daily_questions WHERE is_active = true) || ' questions'
UNION ALL
SELECT
  'Today\'s Question',
  CASE
    WHEN EXISTS (SELECT 1 FROM daily_question_schedule WHERE scheduled_date = CURRENT_DATE)
    THEN '✅ SCHEDULED'
    ELSE '❌ MISSING'
  END,
  CASE
    WHEN EXISTS (SELECT 1 FROM daily_question_schedule WHERE scheduled_date = CURRENT_DATE)
    THEN 'Question ready for today'
    ELSE 'No question scheduled'
  END;

\echo ''
\echo '=== TEST COMPLETE ==='
\echo 'If all tests show ✅, the system is ready for production!'
\echo ''
\echo 'Next steps:'
\echo '1. Deploy edge function: supabase functions deploy send-daily-question-notification'
\echo '2. Set SMTP secrets if not already done'
\echo '3. Test notification in test mode'
\echo '4. Monitor cron job executions'
