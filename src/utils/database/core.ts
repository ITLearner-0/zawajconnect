
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a table exists in the database schema
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use a direct query approach to check for table existence
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
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
    // For security, we'll use a more direct approach
    // This assumes you have the appropriate permissions set up
    const { data, error } = await supabase.rpc('run_sql_query', { 
      query: query 
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
    // Direct query to check column existence
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error(`Error in columnExists check for ${columnName}:`, err);
    return false;
  }
};
