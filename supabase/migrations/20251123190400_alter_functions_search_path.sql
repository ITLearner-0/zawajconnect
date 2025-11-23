-- Alternative approach: Use ALTER FUNCTION to set search_path for all existing functions
-- This is safer than recreating functions as it preserves all function attributes
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- Generate ALTER FUNCTION statements for all functions missing search_path
DO $$
DECLARE
  func_record RECORD;
  alter_statement TEXT;
BEGIN
  RAISE NOTICE 'Starting search_path security fix for all functions...';

  FOR func_record IN
    SELECT
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as function_args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    LEFT JOIN unnest(p.proconfig) AS config ON config LIKE 'search_path=%'
    WHERE n.nspname IN ('public', 'auth', 'storage')
      AND p.prokind = 'f'
      AND config IS NULL
  LOOP
    -- Build ALTER FUNCTION statement
    alter_statement := format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = ''''',
      func_record.schema_name,
      func_record.function_name,
      func_record.function_args
    );

    -- Execute the ALTER statement
    BEGIN
      EXECUTE alter_statement;
      RAISE NOTICE 'Fixed: %.%(%) ',
        func_record.schema_name,
        func_record.function_name,
        func_record.function_args;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to fix %.%(%): %',
        func_record.schema_name,
        func_record.function_name,
        func_record.function_args,
        SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Search path security fix completed!';
END $$;

-- Verify the fix
DO $$
DECLARE
  unfixed_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unfixed_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  LEFT JOIN unnest(p.proconfig) AS config ON config LIKE 'search_path=%'
  WHERE n.nspname IN ('public', 'auth', 'storage')
    AND p.prokind = 'f'
    AND config IS NULL;

  IF unfixed_count > 0 THEN
    RAISE WARNING 'Still have % functions without search_path set', unfixed_count;
  ELSE
    RAISE NOTICE 'All functions now have search_path protection!';
  END IF;
END $$;
