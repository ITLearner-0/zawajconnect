
import { supabase } from '@/integrations/supabase/client';
import { ContentFlag, ContentReport } from '@/types/profile';
import { executeSql } from '@/utils/databaseUtils';

interface FlaggedContent {
  flags: {
    flag_type: ContentFlag['flag_type'];
    severity: ContentFlag['severity'];
  }[];
  isFiltered: boolean;
  filteredContent: string;
}

/**
 * Filters message content for inappropriate terms
 */
export const filterMessageContent = (content: string): FlaggedContent => {
  // Inappropriate terms to filter
  const inappropriateTerms = [
    { term: 'dating', flag: 'religious_violation' as const, severity: 'high' as const },
    { term: 'girlfriend', flag: 'religious_violation' as const, severity: 'high' as const },
    { term: 'boyfriend', flag: 'religious_violation' as const, severity: 'high' as const },
    { term: 'alcohol', flag: 'inappropriate' as const, severity: 'medium' as const },
    { term: 'drinking', flag: 'inappropriate' as const, severity: 'medium' as const },
    { term: 'meet alone', flag: 'suspicious' as const, severity: 'medium' as const },
    { term: 'private meeting', flag: 'suspicious' as const, severity: 'medium' as const },
    { term: 'flirting', flag: 'inappropriate' as const, severity: 'medium' as const },
    { term: 'sexy', flag: 'inappropriate' as const, severity: 'high' as const },
    { term: 'phone number', flag: 'suspicious' as const, severity: 'low' as const },
    { term: 'address', flag: 'suspicious' as const, severity: 'low' as const },
  ];
  
  let filteredContent = content;
  const flags: { flag_type: ContentFlag['flag_type']; severity: ContentFlag['severity'] }[] = [];
  let isFiltered = false;
  
  // Check for inappropriate terms
  inappropriateTerms.forEach(item => {
    const regex = new RegExp(item.term, 'gi');
    if (regex.test(content)) {
      filteredContent = filteredContent.replace(regex, '***');
      isFiltered = true;
      
      // Add flag if not already added for this type
      if (!flags.some(f => f.flag_type === item.flag)) {
        flags.push({
          flag_type: item.flag,
          severity: item.severity
        });
      }
    }
  });
  
  return {
    flags,
    isFiltered,
    filteredContent
  };
};

/**
 * Flags content for moderation review
 */
export const flagContent = async (
  contentId: string,
  contentType: ContentFlag['content_type'],
  flagType: ContentFlag['flag_type'],
  severity: ContentFlag['severity'],
  flaggedBy: string
): Promise<boolean> => {
  try {
    // Insert into content_flags table directly
    const { error } = await supabase
      .from('content_flags')
      .insert({
        content_id: contentId,
        content_type: contentType,
        flag_type: flagType,
        severity: severity,
        flagged_by: flaggedBy,
        created_at: new Date().toISOString(),
        resolved: false
      });
    
    if (error) {
      console.error("Error creating content flag:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error flagging content:', err);
    return false;
  }
};

/**
 * Creates a content report
 */
export const reportContent = async (
  reportedUserId: string,
  reportingUserId: string,
  reportType: string,
  contentReference: string | undefined,
  reportDetails: string
): Promise<boolean> => {
  try {
    // Insert into content_reports table directly
    const { error } = await supabase
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
      console.error("Error creating content report:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error reporting content:', err);
    return false;
  }
};

/**
 * Submit a content report - called from the ReportDialog
 */
export const submitContentReport = async (report: Partial<ContentReport>): Promise<boolean> => {
  return reportContent(
    report.reported_user_id || '',
    report.reporting_user_id || '',
    report.report_type || 'other',
    report.content_reference,
    report.report_details || ''
  );
};

/**
 * Resolves a content flag
 */
export const resolveContentFlag = async (
  flagId: string,
  resolvedBy: string,
  notes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('content_flags')
      .update({
        resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
        notes: notes
      })
      .eq('id', flagId);
    
    if (error) {
      console.error("Error resolving content flag:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error resolving content flag:', err);
    return false;
  }
};

/**
 * Resolves a content report
 */
export const resolveContentReport = async (
  reportId: string,
  resolutionAction: string,
  adminNotes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('content_reports')
      .update({
        status: 'resolved',
        resolution_action: resolutionAction,
        admin_notes: adminNotes
      })
      .eq('id', reportId);
    
    if (error) {
      console.error("Error resolving content report:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error resolving content report:', err);
    return false;
  }
};

/**
 * Gets moderation statistics
 */
export const getModerationStats = async (): Promise<{
  pendingReports: number;
  flaggedContent: number;
  totalProcessed: number;
  resolvedToday: number;
}> => {
  const defaults = {
    pendingReports: 0,
    flaggedContent: 0,
    totalProcessed: 0,
    resolvedToday: 0
  };
  
  try {
    // Get pending reports count
    const { count: pendingReportsCount, error: pendingError } = await supabase
      .from('content_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    // Get unresolved flags count
    const { count: flaggedContentCount, error: flaggedError } = await supabase
      .from('content_flags')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);
    
    // Get total processed count
    const { count: totalProcessedCount, error: processedError } = await supabase
      .from('content_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');
    
    // Get resolved today count using SQL function
    const todayQuery = `
      SELECT COUNT(*) 
      FROM content_reports 
      WHERE status = 'resolved' 
      AND DATE(resolved_at) = CURRENT_DATE
    `;
    const resolvedTodayResult = await executeSql(todayQuery);
    const resolvedTodayCount = resolvedTodayResult?.count || 0;
    
    if (pendingError || flaggedError || processedError) {
      console.error('Error getting moderation stats');
      return defaults;
    }
    
    return {
      pendingReports: pendingReportsCount || 0,
      flaggedContent: flaggedContentCount || 0,
      totalProcessed: totalProcessedCount || 0,
      resolvedToday: resolvedTodayCount
    };
  } catch (err) {
    console.error('Error getting moderation stats:', err);
    return defaults;
  }
};
