
-- Function to insert content flags
CREATE OR REPLACE FUNCTION insert_content_flag(
  content_id TEXT,
  content_type TEXT,
  flag_type TEXT,
  severity TEXT,
  flagged_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN
) RETURNS VOID AS $$
BEGIN
  INSERT INTO content_flags (
    content_id,
    content_type,
    flag_type,
    severity,
    flagged_by,
    created_at,
    resolved
  ) VALUES (
    content_id,
    content_type,
    flag_type,
    severity,
    flagged_by,
    created_at,
    resolved
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to insert content reports
CREATE OR REPLACE FUNCTION insert_content_report(
  reported_user_id TEXT,
  reporting_user_id TEXT,
  report_type TEXT,
  content_reference TEXT,
  report_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  status TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO content_reports (
    reported_user_id,
    reporting_user_id,
    report_type,
    content_reference,
    report_details,
    created_at,
    status
  ) VALUES (
    reported_user_id,
    reporting_user_id,
    report_type,
    content_reference,
    report_details,
    created_at,
    status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION column_exists(
  table_name TEXT,
  column_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  exists_check BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = column_exists.table_name
    AND column_name = column_exists.column_name
  ) INTO exists_check;
  
  RETURN exists_check;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add retention_policy column to conversations table
CREATE OR REPLACE FUNCTION add_retention_policy_column()
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'conversations'
    AND column_name = 'retention_policy'
  ) THEN
    EXECUTE 'ALTER TABLE conversations ADD COLUMN retention_policy JSONB';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add scheduled_deletion column to messages table
CREATE OR REPLACE FUNCTION add_scheduled_deletion_column()
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'messages'
    AND column_name = 'scheduled_deletion'
  ) THEN
    EXECUTE 'ALTER TABLE messages ADD COLUMN scheduled_deletion TIMESTAMP WITH TIME ZONE';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve content report
CREATE OR REPLACE FUNCTION resolve_content_report(
  report_id TEXT,
  resolution_action TEXT,
  admin_notes TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE content_reports
  SET 
    status = 'resolved',
    resolution_action = resolution_action,
    admin_notes = admin_notes
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve content flag
CREATE OR REPLACE FUNCTION resolve_content_flag(
  flag_id TEXT,
  resolved_by_user TEXT,
  resolution_notes TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE content_flags
  SET 
    resolved = TRUE,
    resolved_by = resolved_by_user,
    resolved_at = NOW(),
    notes = resolution_notes
  WHERE id = flag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all content reports
CREATE OR REPLACE FUNCTION get_all_content_reports()
RETURNS SETOF content_reports AS $$
BEGIN
  RETURN QUERY SELECT * FROM content_reports ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all content flags
CREATE OR REPLACE FUNCTION get_all_content_flags()
RETURNS SETOF content_flags AS $$
BEGIN
  RETURN QUERY SELECT * FROM content_flags ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count pending reports
CREATE OR REPLACE FUNCTION count_pending_reports()
RETURNS INTEGER AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count FROM content_reports WHERE status = 'pending';
  RETURN report_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count unresolved flags
CREATE OR REPLACE FUNCTION count_unresolved_flags()
RETURNS INTEGER AS $$
DECLARE
  flag_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO flag_count FROM content_flags WHERE resolved = FALSE;
  RETURN flag_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count resolved reports
CREATE OR REPLACE FUNCTION count_resolved_reports()
RETURNS INTEGER AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count FROM content_reports WHERE status = 'resolved';
  RETURN report_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Scheduled task to delete expired messages
CREATE OR REPLACE FUNCTION delete_expired_messages()
RETURNS VOID AS $$
BEGIN
  DELETE FROM messages
  WHERE scheduled_deletion IS NOT NULL
  AND scheduled_deletion < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the function to run daily
SELECT cron.schedule(
  'delete-expired-messages', -- name of the cron job
  '0 0 * * *',             -- run at midnight every day
  $$SELECT delete_expired_messages()$$
);
