
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a table exists in the database schema
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use a more generic approach to bypass TypeScript constraints by casting
    const response = await supabase.rpc(
      'check_table_exists' as any,
      { table_name: tableName }
    );
    
    if (response.error) {
      console.error(`Error checking if table ${tableName} exists:`, response.error);
      return false;
    }
    
    return !!response.data;
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
    const response = await supabase.rpc(
      'execute_sql' as any,
      { sql_query: query }
    );
    
    if (response.error) {
      console.error(`Error executing SQL: ${query}`, response.error);
      return null;
    }
    
    return response.data;
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
    // Use a more generic approach to bypass TypeScript constraints
    const response = await supabase.rpc(
      'check_column_exists' as any,
      { 
        table_name: tableName,
        column_name: columnName
      }
    );
    
    if (response.error) {
      console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, response.error);
      return false;
    }
    
    return !!response.data;
  } catch (err) {
    console.error(`Error in columnExists check for ${columnName}:`, err);
    return false;
  }
};
