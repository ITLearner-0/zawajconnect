
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a table exists in the database schema
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use a direct SQL query to check if the table exists
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', tableName)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error(`Error in tableExists check for ${tableName}:`, err);
    return false;
  }
};

/**
 * Safely executes SQL queries through Supabase
 */
export const executeSql = async (query: string): Promise<any> => {
  try {
    // For safety, we'll use the supabase SQL API directly
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: query 
    });
    
    if (error) {
      console.error(`Error executing SQL: ${query}`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Error in executeSql:`, err);
    return null;
  }
};

/**
 * Checks if a column exists in a table
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Since we don't have direct access to information_schema via RPC,
    // we'll check by attempting to select the column in a limit 0 query
    const query = `
      SELECT ${columnName} FROM ${tableName} LIMIT 0;
    `;
    
    const result = await executeSql(query);
    return result !== null;
  } catch (err) {
    console.error(`Error in columnExists check for ${columnName}:`, err);
    return false;
  }
};
