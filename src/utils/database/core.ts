
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a table exists in the database
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_table_exists' as any, {
      table_name: tableName
    });

    if (error) {
      console.error('Error checking if table exists:', error);
      return false;
    }

    return data || false;
  } catch (err) {
    console.error('Error checking if table exists:', err);
    return false;
  }
};

/**
 * Execute a SQL query directly
 * Note: This should be used carefully and only for admin functions
 */
export const executeSql = async (sql: string): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('execute_sql' as any, {
      query: sql
    });

    if (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error executing SQL:', err);
    throw err;
  }
};

/**
 * Check if a column exists in a table
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_column_exists' as any, {
      table_name: tableName,
      column_name: columnName
    });

    if (error) {
      console.error('Error checking if column exists:', error);
      return false;
    }

    return data || false;
  } catch (err) {
    console.error('Error checking if column exists:', err);
    return false;
  }
};
