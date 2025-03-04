
import { supabase } from "@/integrations/supabase/client";
import { ContentFlag, ContentReport, ModerationStats } from "@/types/profile";
import { tableExists } from "@/utils/databaseUtils";

export const filterMessageContent = (content: string) => {
  // Basic implementation: scan for inappropriate words
  const inappropriateWordsList = [
    "inappropriate", "offensive", "explicit", "obscene", "rude", "harassment"
  ];
  
  const contentLower = content.toLowerCase();
  let flags: Partial<ContentFlag>[] = [];
  let isFiltered = false;
  let filteredContent = content;
  
  for (let word of inappropriateWordsList) {
    if (contentLower.includes(word)) {
      flags.push({
        content_id: 'temp', // Will be replaced with actual ID
        content_type: 'message',
        flag_type: 'inappropriate',
        severity: 'medium',
        flagged_by: 'system',
        created_at: new Date().toISOString(),
        resolved: false
      });
      
      isFiltered = true;
      // Replace inappropriate word with asterisks
      filteredContent = filteredContent.replace(new RegExp(word, 'gi'), '*'.repeat(word.length));
    }
  }
  
  // Check for religious sensitivities
  const religiousViolationWords = ["blasphemy", "sacrilegious", "haram"];
  
  for (let word of religiousViolationWords) {
    if (contentLower.includes(word)) {
      flags.push({
        content_id: 'temp', // Will be replaced with actual ID
        content_type: 'message',
        flag_type: 'religious_violation',
        severity: 'high',
        flagged_by: 'system',
        created_at: new Date().toISOString(),
        resolved: false
      });
      
      isFiltered = true;
      filteredContent = filteredContent.replace(new RegExp(word, 'gi'), '*'.repeat(word.length));
    }
  }
  
  return { flags, isFiltered, filteredContent };
};

export const flagContent = async (
  contentId: string,
  contentType: ContentFlag['content_type'],
  flagType: ContentFlag['flag_type'],
  severity: ContentFlag['severity'],
  userId: string
) => {
  try {
    // Check if content_flags table exists before inserting
    const hasTable = await tableExists('content_flags');
    
    if (!hasTable) {
      console.log("Content flags table does not exist, skipping flagging");
      return null;
    }
    
    // Use execute_sql to insert data
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: `
        INSERT INTO content_flags (
          content_id, content_type, flag_type, severity, flagged_by, created_at, resolved
        ) VALUES (
          '${contentId}', '${contentType}', '${flagType}', '${severity}', '${userId}', 
          '${new Date().toISOString()}', false
        )
        RETURNING *
      `
    });
      
    if (error) {
      console.error("Error flagging content:", error);
      return null;
    }
    
    return data?.[0];
  } catch (err) {
    console.error("Error in flagContent:", err);
    return null;
  }
};

export const submitContentReport = async (report: {
  reported_user_id: string;
  reporting_user_id: string;
  report_type: ContentReport['report_type'];
  content_reference?: string;
  report_details: string;
}) => {
  try {
    // Check if content_reports table exists before inserting
    const hasTable = await tableExists('content_reports');
    
    if (!hasTable) {
      console.log("Content reports table does not exist, skipping report");
      return false;
    }
    
    // Use execute_sql to insert data
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: `
        INSERT INTO content_reports (
          reported_user_id, reporting_user_id, report_type, 
          content_reference, report_details, created_at, status
        ) VALUES (
          '${report.reported_user_id}', '${report.reporting_user_id}', '${report.report_type}', 
          ${report.content_reference ? `'${report.content_reference}'` : 'NULL'}, 
          '${report.report_details}', '${new Date().toISOString()}', 'pending'
        )
        RETURNING *
      `
    });
      
    if (error) {
      console.error("Error submitting report:", error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error("Error in submitContentReport:", err);
    return false;
  }
};

export const getModerationStats = async (): Promise<ModerationStats> => {
  try {
    // Default stats
    const defaultStats: ModerationStats = {
      pendingReports: 0,
      flaggedContent: 0,
      totalProcessed: 0,
      resolvedToday: 0
    };
    
    // Check if tables exist
    const reportsTableExists = await tableExists('content_reports');
    const flagsTableExists = await tableExists('content_flags');
    
    if (!reportsTableExists && !flagsTableExists) {
      return defaultStats;
    }
    
    let stats = {...defaultStats};
    
    // Get pending reports count
    if (reportsTableExists) {
      const { data: pendingReportsData, error: pendingReportsError } = await supabase.rpc('execute_sql', {
        sql_query: `SELECT COUNT(*) FROM content_reports WHERE status = 'pending'`
      });
        
      if (!pendingReportsError && pendingReportsData?.[0]) {
        stats.pendingReports = parseInt(pendingReportsData[0].count, 10) || 0;
      }
    }
    
    // Get flagged content count
    if (flagsTableExists) {
      const { data: flaggedContentData, error: flaggedContentError } = await supabase.rpc('execute_sql', {
        sql_query: `SELECT COUNT(*) FROM content_flags WHERE resolved = false`
      });
        
      if (!flaggedContentError && flaggedContentData?.[0]) {
        stats.flaggedContent = parseInt(flaggedContentData[0].count, 10) || 0;
      }
    }
    
    // Get resolved today count
    if (reportsTableExists) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: resolvedTodayData, error: resolvedTodayError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT COUNT(*) FROM content_reports 
          WHERE status = 'resolved' 
          AND resolved_at >= '${today.toISOString()}'
        `
      });
        
      if (!resolvedTodayError && resolvedTodayData?.[0]) {
        stats.resolvedToday = parseInt(resolvedTodayData[0].count, 10) || 0;
      }
    }
    
    // Get total processed count
    if (reportsTableExists) {
      const { data: totalProcessedData, error: totalProcessedError } = await supabase.rpc('execute_sql', {
        sql_query: `SELECT COUNT(*) FROM content_reports WHERE status = 'resolved'`
      });
        
      if (!totalProcessedError && totalProcessedData?.[0]) {
        stats.totalProcessed = parseInt(totalProcessedData[0].count, 10) || 0;
      }
    }
    
    return stats;
  } catch (err) {
    console.error("Error getting moderation stats:", err);
    return {
      pendingReports: 0,
      flaggedContent: 0,
      totalProcessed: 0,
      resolvedToday: 0
    };
  }
};
