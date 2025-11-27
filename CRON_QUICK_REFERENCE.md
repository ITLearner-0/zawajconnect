# Daily Question Cron - Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Apply migration
supabase db push

# 2. Deploy edge function
supabase functions deploy send-daily-question-notification

# 3. Set SMTP secrets (if not already done)
supabase secrets set SMTP_HOST=smtp.example.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=user@example.com
supabase secrets set SMTP_PASSWORD=yourpassword
supabase secrets set SMTP_FROM_EMAIL=noreply@zawaj-connect.com

# 4. Test the system
psql -h your-db-host -U postgres -d postgres -f test_daily_question_cron.sql
```

---

## 📋 Essential Commands

### Check Cron Jobs
```sql
SELECT * FROM cron.job;
```

### View Job History
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Get System Stats
```sql
SELECT * FROM get_daily_question_schedule_stats();
```

### Manual Schedule Generation
```sql
SELECT * FROM schedule_daily_questions_batch();
```

### View Next 7 Days
```sql
SELECT dqs.scheduled_date, dq.question_fr, dq.category
FROM daily_question_schedule dqs
JOIN daily_questions dq ON dq.id = dqs.question_id
WHERE dqs.scheduled_date >= CURRENT_DATE
ORDER BY dqs.scheduled_date LIMIT 7;
```

---

## 🔧 Cron Job Management

### Stop a Job
```sql
SELECT cron.unschedule('auto-schedule-daily-questions');
```

### Restart a Job
```sql
-- Schedule: 11:30 PM daily
SELECT cron.schedule(
  'auto-schedule-daily-questions',
  '30 23 * * *',
  $$ SELECT public.schedule_daily_questions_batch(); $$
);
```

### Change Notification Time
```sql
-- Unschedule existing
SELECT cron.unschedule('send-daily-question-notification');

-- Reschedule for 9 AM
SELECT cron.schedule(
  'send-daily-question-notification',
  '0 9 * * *',
  $$ SELECT public.trigger_daily_question_notification(); $$
);
```

---

## 🧪 Testing

### Test Email (Safe Mode)
```bash
curl -X POST \
  'https://YOUR-PROJECT.supabase.co/functions/v1/send-daily-question-notification' \
  -H 'Authorization: Bearer YOUR-SERVICE-ROLE-KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "test_mode": true,
    "test_emails": ["your-email@example.com"]
  }'
```

### Test Scheduling Function
```sql
-- Check before
SELECT COUNT(*) FROM daily_question_schedule;

-- Run scheduler
SELECT * FROM schedule_daily_questions_batch();

-- Check after (should be more)
SELECT COUNT(*) FROM daily_question_schedule;
```

---

## 📊 Monitoring

### System Health Dashboard
```sql
SELECT
  (SELECT COUNT(*) FROM daily_question_schedule WHERE scheduled_date >= CURRENT_DATE) as "Questions Scheduled",
  (SELECT days_scheduled_ahead FROM get_daily_question_schedule_stats()) as "Days Ahead",
  (SELECT COUNT(*) FROM daily_questions WHERE is_active = true) as "Active Questions",
  (SELECT COUNT(*) FROM get_users_for_daily_notification()) as "Eligible Users Today";
```

### Last 24 Hours Activity
```sql
SELECT
  scheduled_date,
  is_sent,
  total_responses,
  total_skips,
  ROUND((total_responses::numeric / NULLIF(total_responses + total_skips, 0)) * 100, 1) as response_rate_pct
FROM daily_question_schedule
WHERE scheduled_date >= CURRENT_DATE - 1
ORDER BY scheduled_date DESC;
```

---

## ⚠️ Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| No emails sending | Edge function logs | `supabase functions logs send-daily-question-notification` |
| Cron not running | Job status | `SELECT * FROM cron.job WHERE active = false;` |
| No questions scheduled | Active questions count | Add more active questions or check `is_active` flag |
| Duplicate dates | Unique constraint | Migration has UNIQUE constraint, should auto-prevent |

---

## 📁 File Locations

| Component | Path |
|-----------|------|
| Migration | `supabase/migrations/20251127000005_automate_daily_question_scheduling.sql` |
| Edge Function | `supabase/functions/send-daily-question-notification/index.ts` |
| Documentation | `DAILY_QUESTION_CRON_SETUP.md` |
| Test Script | `test_daily_question_cron.sql` |

---

## 🎯 Cron Schedule Syntax

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

**Common Patterns:**
- `0 8 * * *` - Every day at 8:00 AM
- `30 23 * * *` - Every day at 11:30 PM
- `0 */4 * * *` - Every 4 hours
- `0 0 * * 0` - Every Sunday at midnight

---

## 🔐 Security Checklist

- [x] Service role key never exposed in client
- [x] SMTP credentials stored in Supabase secrets
- [x] User notification preferences respected
- [x] SQL injection prevented (parameterized queries)
- [x] CORS headers properly configured

---

**Need more details?** See `DAILY_QUESTION_CRON_SETUP.md`
