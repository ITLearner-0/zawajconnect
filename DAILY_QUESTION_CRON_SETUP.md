# Daily Question Cron Job Setup Guide

This guide explains the automated daily question scheduling system for Zawaj-Connect.

## Overview

The Daily Question feature now includes **automated scheduling** and **email notifications** to keep users engaged. This system consists of:

1. **Auto-Scheduling**: Automatically generates question schedules for the next 90 days
2. **Daily Notifications**: Sends email reminders to users each morning with the daily question
3. **Cron Jobs**: PostgreSQL `pg_cron` jobs orchestrate the automation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CRON SCHEDULE                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  11:30 PM Daily                        8:00 AM Daily         │
│       │                                      │                │
│       ▼                                      ▼                │
│  ┌─────────────┐                    ┌──────────────┐        │
│  │ Schedule    │                    │ Send Email   │        │
│  │ Questions   │                    │ Notification │        │
│  │ (90 days)   │                    │ to Users     │        │
│  └─────────────┘                    └──────────────┘        │
│       │                                      │                │
│       ▼                                      ▼                │
│  ┌─────────────────────────────────────────────────┐        │
│  │  daily_question_schedule (Table)                 │        │
│  │  - scheduled_date                                 │        │
│  │  - question_id                                    │        │
│  │  - is_sent                                        │        │
│  └─────────────────────────────────────────────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Database Functions

Located in: `supabase/migrations/20251127000005_automate_daily_question_scheduling.sql`

#### `schedule_daily_questions_batch()`
- **Purpose**: Generates question schedules for the next 90 days
- **Schedule**: Runs daily at 11:30 PM via pg_cron
- **Algorithm**:
  - Finds questions not used in the last 60 days
  - Prioritizes by `priority` field (higher first)
  - Considers `used_count` (less used first)
  - Adds randomization for variety
- **Returns**: Count of scheduled questions, date range

**Usage:**
```sql
-- Manual execution (if needed)
SELECT * FROM schedule_daily_questions_batch();

-- Example output:
-- scheduled_count | next_scheduled_date | last_scheduled_date
-- 15              | 2025-11-28          | 2026-02-25
```

#### `mark_daily_question_sent(p_scheduled_date DATE)`
- **Purpose**: Marks a question as sent after notification delivery
- **Called by**: Email notification edge function
- **Updates**: Sets `is_sent = true` for the specified date

#### `get_users_for_daily_notification()`
- **Purpose**: Returns list of users eligible for daily notifications
- **Filters**:
  - Active users only
  - Email verified
  - Haven't answered today's question yet
  - Notification preferences enabled (if set)
- **Returns**: `user_id`, `email`, `full_name`, `preferred_language`

#### `get_daily_question_schedule_stats()`
- **Purpose**: Returns scheduling system statistics
- **Usage**: Admin dashboard monitoring

**Example:**
```sql
SELECT * FROM get_daily_question_schedule_stats();

-- Output:
-- total_scheduled | next_unscheduled_date | days_scheduled_ahead | total_questions_sent | avg_daily_responses
-- 90              | 2026-02-26            | 90                   | 45                   | 127.3
```

---

### 2. Edge Function: Email Notifications

Located in: `supabase/functions/send-daily-question-notification/index.ts`

**Purpose**: Sends beautiful HTML emails to users with the daily question

**Features**:
- 📧 Beautiful HTML email template
- 🌐 Multi-language support (French/Arabic/English)
- 🎨 Category-specific emojis and colors
- 🏆 Gamification elements (streaks, badges)
- 🧪 Test mode for safe testing

**Request Format:**
```typescript
POST /functions/v1/send-daily-question-notification

// Body (all optional)
{
  "scheduled_date": "2025-11-27",  // Defaults to today
  "test_mode": true,                // Send to test emails only
  "test_emails": ["test@example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "users_notified": 150,
  "failures": 2,
  "total_users": 152,
  "test_mode": false,
  "errors": ["Failed to send to user@example.com: SMTP error"]
}
```

---

### 3. Cron Jobs

#### Job 1: Auto-Schedule Questions
- **Name**: `auto-schedule-daily-questions`
- **Schedule**: `30 23 * * *` (11:30 PM daily)
- **Function**: `schedule_daily_questions_batch()`
- **Purpose**: Ensures we always have 90 days of questions scheduled

#### Job 2: Send Daily Notifications
- **Name**: `send-daily-question-notification`
- **Schedule**: `0 8 * * *` (8:00 AM daily)
- **Function**: `trigger_daily_question_notification()`
- **Purpose**: Sends email notifications to eligible users

---

## Setup Instructions

### Step 1: Run the Migration

```bash
# Apply the migration to your Supabase database
supabase db push

# Or if using migrations manually:
psql -h <your-db-host> -U postgres -d postgres -f supabase/migrations/20251127000005_automate_daily_question_scheduling.sql
```

### Step 2: Deploy the Edge Function

```bash
# Deploy the notification edge function
supabase functions deploy send-daily-question-notification

# Set required environment variables (if not already set)
supabase secrets set SMTP_HOST=your-smtp-host.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=your-email@example.com
supabase secrets set SMTP_PASSWORD=your-password
supabase secrets set SMTP_FROM_EMAIL=noreply@zawaj-connect.com
supabase secrets set SMTP_FROM_NAME="Zawaj Connect"
```

### Step 3: Verify Cron Jobs

```sql
-- Check that cron jobs are scheduled
SELECT * FROM cron.job;

-- Expected output:
-- jobid | schedule    | command                                        | nodename | ...
-- 1     | 30 23 * * * | SELECT public.schedule_daily_questions_batch() | ...
-- 2     | 0 8 * * *   | SELECT public.trigger_daily_question_notif...  | ...
```

### Step 4: Test the System

#### Test Auto-Scheduling (Manual)
```sql
-- Run the scheduler manually
SELECT * FROM schedule_daily_questions_batch();

-- Check scheduled questions
SELECT
  dqs.scheduled_date,
  dq.question_fr,
  dq.category,
  dqs.is_sent
FROM daily_question_schedule dqs
JOIN daily_questions dq ON dq.id = dqs.question_id
WHERE dqs.scheduled_date >= CURRENT_DATE
ORDER BY dqs.scheduled_date
LIMIT 10;
```

#### Test Email Notification (Test Mode)
```bash
# Test with your email
curl -X POST \
  'https://<your-project>.supabase.co/functions/v1/send-daily-question-notification' \
  -H 'Authorization: Bearer <your-service-role-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "test_mode": true,
    "test_emails": ["your-email@example.com"]
  }'
```

---

## Monitoring & Maintenance

### View Cron Job Execution History

```sql
-- See recent cron job runs
SELECT
  job.jobname,
  run.status,
  run.start_time,
  run.end_time,
  run.return_message
FROM cron.job_run_details run
JOIN cron.job ON job.jobid = run.jobid
ORDER BY run.start_time DESC
LIMIT 20;
```

### Check System Health

```sql
-- Get scheduling statistics
SELECT * FROM get_daily_question_schedule_stats();

-- Check if questions are being marked as sent
SELECT
  scheduled_date,
  is_sent,
  total_responses,
  total_skips
FROM daily_question_schedule
WHERE scheduled_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY scheduled_date DESC;
```

### Common Issues & Solutions

#### ❌ Problem: No questions being scheduled
**Diagnosis:**
```sql
-- Check if there are active questions
SELECT COUNT(*) FROM daily_questions WHERE is_active = true;

-- Check cron job status
SELECT * FROM cron.job WHERE jobname = 'auto-schedule-daily-questions';
```

**Solution:**
- Ensure you have active questions in the database
- Check if `is_active = true` for questions
- Verify the cron job is scheduled correctly

#### ❌ Problem: Emails not sending
**Diagnosis:**
```bash
# Check edge function logs
supabase functions logs send-daily-question-notification

# Test SMTP configuration
supabase secrets list | grep SMTP
```

**Solution:**
- Verify SMTP credentials are correct
- Check edge function deployment: `supabase functions deploy send-daily-question-notification`
- Test in test mode first before production

#### ❌ Problem: Cron job not running
**Diagnosis:**
```sql
-- Check if pg_cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check job execution history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

**Solution:**
```sql
-- Enable pg_cron if not enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Reschedule the job if needed
SELECT cron.unschedule('auto-schedule-daily-questions');
SELECT cron.schedule(
  'auto-schedule-daily-questions',
  '30 23 * * *',
  $$ SELECT public.schedule_daily_questions_batch(); $$
);
```

---

## Customization

### Change Notification Time

```sql
-- Unschedule existing job
SELECT cron.unschedule('send-daily-question-notification');

-- Reschedule for different time (e.g., 9:00 AM)
SELECT cron.schedule(
  'send-daily-question-notification',
  '0 9 * * *',  -- 9:00 AM
  $$ SELECT public.trigger_daily_question_notification(); $$
);
```

### Change Look-Ahead Days

Edit the migration file and change `v_lookahead_days`:
```sql
DECLARE
  v_lookahead_days INTEGER := 120; -- Changed from 90 to 120
```

### Customize Email Template

Edit: `supabase/functions/send-daily-question-notification/index.ts`

Look for the `generateEmailHTML()` function and customize:
- Colors
- Layout
- Text content
- CTA button

---

## Performance Considerations

### Batch Size Optimization

The current system schedules **90 days** in advance. For large user bases:

- **Small (<1000 users)**: 90 days is optimal
- **Medium (1000-10000 users)**: Consider 60 days
- **Large (>10000 users)**: Consider 30 days + more frequent runs

### Email Sending Rate Limits

Current implementation sends emails sequentially. For large user bases:

```typescript
// Consider implementing batch sending
const BATCH_SIZE = 100;
const BATCH_DELAY = 1000; // 1 second between batches

for (let i = 0; i < users.length; i += BATCH_SIZE) {
  const batch = users.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(user => sendEmail(...)));
  if (i + BATCH_SIZE < users.length) {
    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
  }
}
```

---

## Security Best Practices

1. **Service Role Key**: Never expose in client code
2. **SMTP Credentials**: Store in Supabase secrets only
3. **User Preferences**: Always respect `notification_preferences`
4. **Rate Limiting**: Consider implementing in edge function for public endpoints

---

## Next Steps

- [ ] Add user preference UI for notification times
- [ ] Implement timezone-aware notifications
- [ ] Add A/B testing for email templates
- [ ] Create admin dashboard for cron job monitoring
- [ ] Add webhook support for external integrations
- [ ] Implement SMS notifications (optional)

---

## Support

For issues or questions:
1. Check cron job logs: `SELECT * FROM cron.job_run_details`
2. Check edge function logs: `supabase functions logs send-daily-question-notification`
3. Review migration file: `supabase/migrations/20251127000005_automate_daily_question_scheduling.sql`

**Happy Automating! 🚀**
