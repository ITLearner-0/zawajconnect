
import { executeSql } from "./core";

/**
 * Creates the required emergency reporting tables if they don't exist
 */
export const setupEmergencyTables = async (): Promise<boolean> => {
  try {
    // Create emergency_reports table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS emergency_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reporter_id UUID NOT NULL,
        reported_user_id UUID NOT NULL,
        conversation_id TEXT NOT NULL,
        emergency_type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        resolved_by UUID,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolution_notes TEXT,
        action_taken TEXT
      )
    `);
    
    // Create admin_notifications table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        read BOOLEAN DEFAULT FALSE,
        priority TEXT DEFAULT 'normal'
      )
    `);
    
    // Create analytics_metrics table for storing aggregated metrics
    await executeSql(`
      CREATE TABLE IF NOT EXISTS analytics_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        metric_name TEXT NOT NULL,
        metric_value NUMERIC NOT NULL,
        metric_date DATE NOT NULL,
        metric_context JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create unique constraint on analytics_metrics
    await executeSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'unique_metric_daily'
        ) THEN
          ALTER TABLE analytics_metrics 
          ADD CONSTRAINT unique_metric_daily 
          UNIQUE (metric_name, metric_date);
        END IF;
      END
      $$;
    `);
    
    return true;
  } catch (err) {
    console.error('Error setting up emergency tables:', err);
    return false;
  }
};
