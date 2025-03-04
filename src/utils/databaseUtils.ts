
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a table exists in the database
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use execute to run raw SQL instead of rpc
    const { data, error } = await supabase.from('spatial_ref_sys')
      .select('*')
      .limit(1)
      .then(() => supabase
        .rpc('execute_sql', { 
          sql_query: `SELECT EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = '${tableName}'
          )` 
        })
      );
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return !!data?.[0]?.exists;
  } catch (err) {
    console.error(`Error in tableExists check for ${tableName}:`, err);
    return false;
  }
};

/**
 * Checks if a column exists in a table
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Use execute to run raw SQL instead of rpc
    const { data, error } = await supabase.from('spatial_ref_sys')
      .select('*')
      .limit(1)
      .then(() => supabase
        .rpc('execute_sql', { 
          sql_query: `SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}' 
            AND column_name = '${columnName}'
          )` 
        })
      );
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists:`, error);
      return false;
    }
    
    return !!data?.[0]?.exists;
  } catch (err) {
    console.error(`Error in columnExists check for ${columnName}:`, err);
    return false;
  }
};
