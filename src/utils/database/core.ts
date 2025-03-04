
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a table exists in the database schema
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use any type to bypass TS RPC function name checking
    const { data, error } = await supabase.rpc<boolean, { table_name: string }>(
      'check_table_exists' as any,
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
    // For security, we'll use a more direct approach with any type for RPC function name
    const { data, error } = await supabase.rpc<any, { sql_query: string }>(
      'execute_sql' as any,
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
    // Use any type to bypass TS RPC function name checking
    const { data, error } = await supabase.rpc<boolean, { table_name: string; column_name: string }>(
      'check_column_exists' as any,
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
