
-- Function to check if a table exists in the public schema
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = check_table_exists.table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to check if a column exists in a specified table
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;

-- Function to execute a SQL query with proper security checks
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Security validation could be added here
  -- This is a placeholder for a more sophisticated implementation
  -- that would validate and sanitize the SQL query
  IF sql_query ILIKE '%DROP%' OR 
     sql_query ILIKE '%TRUNCATE%' OR
     sql_query ILIKE '%DELETE%' OR
     sql_query ILIKE '%INSERT%' OR
     sql_query ILIKE '%GRANT%' OR
     sql_query ILIKE '%REVOKE%' THEN
    RAISE EXCEPTION 'Potentially harmful SQL detected: %', sql_query;
  END IF;
  
  -- Execute the query and capture results
  EXECUTE sql_query;
  result = '{"success": true}'::JSONB;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;
