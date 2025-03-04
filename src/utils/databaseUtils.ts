
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely executes SQL queries through Supabase
 */
export const executeSql = async (query: string): Promise<any> => {
  try {
    // First make a simple query to ensure connection
    await supabase.from('spatial_ref_sys').select('*').limit(1);
    
    // Then execute the actual query
    const { data, error } = await supabase
      .from('spatial_ref_sys')
      .select('*')
      .limit(1)
      .then(() => {
        // Use custom SQL execution format to avoid RPC type errors
        return supabase.from('_exec_sql')
          .insert({ query })
          .select('result')
          .single();
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
 * Checks if a table exists in the database
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const result = await executeSql(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = '${tableName}'
      )
    `);
    
    return !!result?.result?.exists;
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
    const result = await executeSql(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}' 
        AND column_name = '${columnName}'
      )
    `);
    
    return !!result?.result?.exists;
  } catch (err) {
    console.error(`Error in columnExists check for ${columnName}:`, err);
    return false;
  }
};

/**
 * Creates a table if it doesn't exist
 */
export const createTableIfNotExists = async (
  tableName: string, 
  schema: string
): Promise<boolean> => {
  try {
    const exists = await tableExists(tableName);
    
    if (!exists) {
      await executeSql(schema);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error creating table ${tableName}:`, err);
    return false;
  }
};

/**
 * Adds a column to a table if it doesn't exist
 */
export const addColumnIfNotExists = async (
  tableName: string,
  columnName: string,
  columnDefinition: string
): Promise<boolean> => {
  try {
    const exists = await columnExists(tableName, columnName);
    
    if (!exists) {
      await executeSql(`
        ALTER TABLE ${tableName}
        ADD COLUMN ${columnName} ${columnDefinition}
      `);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error adding column ${columnName} to ${tableName}:`, err);
    return false;
  }
};
