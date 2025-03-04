
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a table exists in the database schema
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use a direct SQL query to check if the table exists
    const { data, error } = await supabase.rpc('table_exists', { 
      table_name: tableName 
    });
    
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
    // Use RPC to execute custom SQL
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
    const result = await executeSql(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}' 
        AND column_name = '${columnName}'
      ) as exists
    `);
    
    return !!result?.exists;
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

/**
 * Creates the required moderation tables if they don't exist
 */
export const setupModerationTables = async (): Promise<boolean> => {
  try {
    // Create content_flags table
    await createTableIfNotExists('content_flags', `
      CREATE TABLE content_flags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content_id TEXT NOT NULL,
        content_type TEXT NOT NULL,
        flag_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        flagged_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved BOOLEAN DEFAULT FALSE,
        resolved_by UUID,
        resolved_at TIMESTAMP WITH TIME ZONE,
        notes TEXT
      )
    `);
    
    // Create content_reports table
    await createTableIfNotExists('content_reports', `
      CREATE TABLE content_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reported_user_id UUID NOT NULL,
        reporting_user_id UUID NOT NULL,
        report_type TEXT NOT NULL,
        content_reference TEXT,
        report_details TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT DEFAULT 'pending',
        resolution_action TEXT,
        admin_notes TEXT,
        resolved_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // Create wali_profiles table if it doesn't exist
    await createTableIfNotExists('wali_profiles', `
      CREATE TABLE wali_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        contact_information TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_date TIMESTAMP WITH TIME ZONE,
        availability_status TEXT DEFAULT 'offline',
        last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        managed_users TEXT[],
        chat_preferences JSONB DEFAULT '{
          "auto_approve_known_contacts": false,
          "notification_level": "important",
          "keyword_alerts": [],
          "supervision_level": "passive"
        }'::jsonb
      )
    `);
    
    // Add RPC functions for table existence and SQL execution if not existing
    await executeSql(`
      CREATE OR REPLACE FUNCTION table_exists(table_name TEXT) 
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = table_name
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    
    await executeSql(`
      CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT) 
      RETURNS JSONB AS $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE sql_query INTO result;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    
    return true;
  } catch (err) {
    console.error('Error setting up moderation tables:', err);
    return false;
  }
};

/**
 * Updates the profile table to include privacy and blocking fields if needed
 */
export const updateProfileSchema = async (): Promise<boolean> => {
  try {
    // Add privacy_settings column if it doesn't exist
    await addColumnIfNotExists(
      'profiles',
      'privacy_settings',
      'JSONB DEFAULT \'{"profileVisibilityLevel": 1, "showAge": true, "showLocation": true, "showOccupation": true, "allowNonMatchMessages": true}\'::jsonb'
    );
    
    // Add blocked_users column if it doesn't exist
    await addColumnIfNotExists(
      'profiles',
      'blocked_users',
      'TEXT[] DEFAULT \'{}\'::text[]'
    );
    
    // Add is_visible column if it doesn't exist
    await addColumnIfNotExists(
      'profiles',
      'is_visible',
      'BOOLEAN DEFAULT true'
    );
    
    // Add role column if it doesn't exist for admin features
    await addColumnIfNotExists(
      'profiles',
      'role',
      'TEXT DEFAULT \'user\''
    );
    
    return true;
  } catch (err) {
    console.error('Error updating profile schema:', err);
    return false;
  }
};
