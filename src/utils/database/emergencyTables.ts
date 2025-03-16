
import { supabase } from "@/integrations/supabase/client";
import { executeSql, tableExists } from "./core";

/**
 * Setup emergency tables for the application
 */
export const setupEmergencyTables = async () => {
  console.log('Setting up emergency tables...');
  
  try {
    // Check if emergency_reports table exists
    const emergencyTableExists = await tableExists('emergency_reports');
    
    if (!emergencyTableExists) {
      console.log('Creating emergency_reports table...');
      
      // Create emergency_reports table
      await executeSql(`
        CREATE TABLE IF NOT EXISTS emergency_reports (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          reporter_id UUID NOT NULL REFERENCES auth.users(id),
          reported_user_id UUID NOT NULL REFERENCES auth.users(id),
          conversation_id UUID REFERENCES conversations(id),
          emergency_type TEXT NOT NULL,
          description TEXT,
          location_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT DEFAULT 'pending',
          resolved_at TIMESTAMP WITH TIME ZONE,
          resolved_by UUID REFERENCES auth.users(id),
          resolution_notes TEXT
        );
      `);
      
      // Create index on reporter_id
      await executeSql(`
        CREATE INDEX IF NOT EXISTS emergency_reports_reporter_id_idx ON emergency_reports(reporter_id);
      `);
      
      // Create index on reported_user_id
      await executeSql(`
        CREATE INDEX IF NOT EXISTS emergency_reports_reported_user_id_idx ON emergency_reports(reported_user_id);
      `);
      
      // Create index on status
      await executeSql(`
        CREATE INDEX IF NOT EXISTS emergency_reports_status_idx ON emergency_reports(status);
      `);
    }
    
    // Check if admin_notifications table exists
    const notificationsTableExists = await tableExists('admin_notifications');
    
    if (!notificationsTableExists) {
      console.log('Creating admin_notifications table...');
      
      // Create admin_notifications table
      await executeSql(`
        CREATE TABLE IF NOT EXISTS admin_notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          type TEXT NOT NULL,
          user_id UUID REFERENCES auth.users(id),
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_read BOOLEAN DEFAULT FALSE,
          read_at TIMESTAMP WITH TIME ZONE,
          priority TEXT DEFAULT 'normal'
        );
      `);
      
      // Create index on is_read
      await executeSql(`
        CREATE INDEX IF NOT EXISTS admin_notifications_is_read_idx ON admin_notifications(is_read);
      `);
      
      // Create index on priority
      await executeSql(`
        CREATE INDEX IF NOT EXISTS admin_notifications_priority_idx ON admin_notifications(priority);
      `);
    }
    
    console.log('Emergency tables setup complete.');
    return true;
  } catch (error) {
    console.error('Error setting up emergency tables:', error);
    return false;
  }
};
