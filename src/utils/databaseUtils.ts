
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a table exists in the database
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('table_exists', { 
      table_name: tableName 
    });
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error(`Failed to check if table ${tableName} exists:`, err);
    return false;
  }
};

/**
 * Check if a column exists in a table
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('column_exists', {
      table_name: tableName,
      column_name: columnName
    });
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error(`Failed to check if column ${columnName} exists in ${tableName}:`, err);
    return false;
  }
};
