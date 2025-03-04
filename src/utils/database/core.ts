
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a table exists in the database schema
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use a more generic approach to bypass TypeScript constraints by casting the RPC function name
    const { data, error } = await (supabase.rpc(
      'check_table_exists' as any,
      { table_name: tableName }
    ) as unknown as Promise<{ data: boolean; error: any }>);
    
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
    // For security, we'll use a more direct approach with a generic response type
    const { data, error } = await (supabase.rpc(
      'execute_sql' as any,
      { sql_query: query }
    ) as unknown as Promise<{ data: any; error: any }>);
    
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
    // Use a more generic approach to bypass TypeScript constraints
    const { data, error } = await (supabase.rpc(
      'check_column_exists' as any,
      { 
        table_name: tableName,
        column_name: columnName
      }
    ) as unknown as Promise<{ data: boolean; error: any }>);
    
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
