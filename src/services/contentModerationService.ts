
import { supabase } from "@/integrations/supabase/client";
import { ContentFlag, ContentReport, ModerationStats } from "@/types/profile";

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
        flag_type: 'inappropriate' as ContentFlag['flag_type'],
        severity: 'medium' as ContentFlag['severity']
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
        flag_type: 'religious_violation' as ContentFlag['flag_type'],
        severity: 'high' as ContentFlag['severity']
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
    const { data: tableExists } = await supabase.rpc('table_exists', { table_name: 'content_flags' });
    
    if (!tableExists) {
      console.log("Content flags table does not exist, skipping flagging");
      return;
    }
    
    // Insert flag into database
    const { data, error } = await supabase
      .from('content_flags')
      .insert({
        content_id: contentId,
        content_type: contentType,
        flag_type: flagType,
        severity: severity,
        flagged_by: userId,
        created_at: new Date().toISOString(),
        resolved: false
      });
      
    if (error) {
      console.error("Error flagging content:", error);
    }
    
    return data;
  } catch (err) {
    console.error("Error in flagContent:", err);
    return null;
  }
};

export const submitContentReport = async (
  reportedUserId: string,
  reportingUserId: string,
  reportType: ContentReport['report_type'],
  contentReference: string | undefined,
  reportDetails: string
) => {
  try {
    // Check if content_reports table exists before inserting
    const { data: tableExists } = await supabase.rpc('table_exists', { table_name: 'content_reports' });
    
    if (!tableExists) {
      console.log("Content reports table does not exist, skipping report");
      return null;
    }
    
    const { data, error } = await supabase
      .from('content_reports')
      .insert({
        reported_user_id: reportedUserId,
        reporting_user_id: reportingUserId,
        report_type: reportType,
        content_reference: contentReference,
        report_details: reportDetails,
        created_at: new Date().toISOString(),
        status: 'pending'
      });
      
    if (error) {
      console.error("Error submitting report:", error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("Error in submitContentReport:", err);
    return null;
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
    const { data: reportsTableExists } = await supabase.rpc('table_exists', { table_name: 'content_reports' });
    const { data: flagsTableExists } = await supabase.rpc('table_exists', { table_name: 'content_flags' });
    
    if (!reportsTableExists && !flagsTableExists) {
      return defaultStats;
    }
    
    // Get pending reports count
    let pendingReports = 0;
    if (reportsTableExists) {
      const { data: pendingReportsData, error: pendingReportsError } = await supabase
        .from('content_reports')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');
        
      if (!pendingReportsError) {
        pendingReports = pendingReportsData.length;
      }
    }
    
    // Get flagged content count
    let flaggedContent = 0;
    if (flagsTableExists) {
      const { data: flaggedContentData, error: flaggedContentError } = await supabase
        .from('content_flags')
        .select('id', { count: 'exact' })
        .eq('resolved', false);
        
      if (!flaggedContentError) {
        flaggedContent = flaggedContentData.length;
      }
    }
    
    // Get resolved today count
    let resolvedToday = 0;
    if (reportsTableExists) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: resolvedTodayData, error: resolvedTodayError } = await supabase
        .from('content_reports')
        .select('id', { count: 'exact' })
        .eq('status', 'resolved')
        .gte('resolved_at', today.toISOString());
        
      if (!resolvedTodayError) {
        resolvedToday = resolvedTodayData.length;
      }
    }
    
    // Get total processed count
    let totalProcessed = 0;
    if (reportsTableExists) {
      const { data: totalProcessedData, error: totalProcessedError } = await supabase
        .from('content_reports')
        .select('id', { count: 'exact' })
        .eq('status', 'resolved');
        
      if (!totalProcessedError) {
        totalProcessed = totalProcessedData.length;
      }
    }
    
    return {
      pendingReports,
      flaggedContent,
      totalProcessed,
      resolvedToday
    };
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
