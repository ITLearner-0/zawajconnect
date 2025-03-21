
import { executeSql } from "./core";

/**
 * Creates the required moderation tables if they don't exist
 */
export const setupModerationTables = async (): Promise<boolean> => {
  try {
    // Create content_flags table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS content_flags (
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
    await executeSql(`
      CREATE TABLE IF NOT EXISTS content_reports (
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
    
    // Create wali_profiles table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS wali_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
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
    
    // Create chat_requests table with request_type and suggested_time columns
    await executeSql(`
      CREATE TABLE IF NOT EXISTS chat_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        requester_id UUID NOT NULL,
        recipient_id UUID NOT NULL,
        wali_id UUID,
        status TEXT DEFAULT 'pending',
        requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        wali_notes TEXT,
        message TEXT,
        request_type TEXT,
        suggested_time TEXT
      )
    `);
    
    // Ensure existing chat_requests table has the new columns
    await executeSql(`
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE chat_requests ADD COLUMN IF NOT EXISTS message TEXT;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Error adding message column: %', SQLERRM;
        END;
        
        BEGIN
          ALTER TABLE chat_requests ADD COLUMN IF NOT EXISTS request_type TEXT;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Error adding request_type column: %', SQLERRM;
        END;
        
        BEGIN
          ALTER TABLE chat_requests ADD COLUMN IF NOT EXISTS suggested_time TEXT;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Error adding suggested_time column: %', SQLERRM;
        END;
      END $$;
    `);
    
    // Create supervision_sessions table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS supervision_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL,
        wali_id UUID NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        supervision_level TEXT DEFAULT 'passive'
      )
    `);
    
    // Add extensions if needed
    await executeSql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    return true;
  } catch (err) {
    console.error('Error setting up moderation tables:', err);
    return false;
  }
};
