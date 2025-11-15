import { executeSql } from './core';

/**
 * Sets up RPC functions for table operations
 */
export const setupRpcFunctions = async (): Promise<boolean> => {
  try {
    // Create function for checking if a table exists
    await executeSql(`
      CREATE OR REPLACE FUNCTION table_exists(table_name TEXT) 
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = table_name
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // Create function for executing SQL
    await executeSql(`
      CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT) 
      RETURNS JSONB AS $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE sql_query INTO result;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    return true;
  } catch (err) {
    console.error('Error setting up RPC functions:', err);
    return false;
  }
};
