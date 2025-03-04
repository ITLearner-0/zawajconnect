
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a table exists in the database schema
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use a raw query approach to check for table existence
    const { data, error } = await supabase.rpc(
      'check_table_exists',
      { table_name: tableName }
    );
    
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
    const { data, error } = await supabase.rpc(
      'execute_sql',
      { sql_query: query }
    );
    
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
    // Use RPC function to check column existence
    const { data, error } = await supabase.rpc(
      'check_column_exists',
      { 
        table_name: tableName,
        column_name: columnName
      }
    );
    
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
