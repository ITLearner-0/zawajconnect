
import { supabase } from '@/integrations/supabase/client';
import { ContentFlag, ContentReport } from '@/types/profile';
import { executeSql, tableExists } from '@/utils/databaseUtils';

interface FlaggedContent {
  flags: {
    flag_type: string;
    severity: string;
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
    { term: 'dating', flag: 'religious_violation', severity: 'high' },
    { term: 'girlfriend', flag: 'religious_violation', severity: 'high' },
    { term: 'boyfriend', flag: 'religious_violation', severity: 'high' },
    { term: 'alcohol', flag: 'inappropriate', severity: 'medium' },
    { term: 'drinking', flag: 'inappropriate', severity: 'medium' },
    { term: 'meet alone', flag: 'suspicious', severity: 'medium' },
    { term: 'private meeting', flag: 'suspicious', severity: 'medium' },
    { term: 'flirting', flag: 'inappropriate', severity: 'medium' },
    { term: 'sexy', flag: 'inappropriate', severity: 'high' },
    { term: 'phone number', flag: 'suspicious', severity: 'low' },
    { term: 'address', flag: 'suspicious', severity: 'low' },
  ];
  
  let filteredContent = content;
  const flags: { flag_type: string; severity: string }[] = [];
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
    // Check if the table exists
    const exists = await tableExists('content_flags');
    
    if (!exists) {
      console.log("content_flags table doesn't exist, flag not created");
      return false;
    }
    
    // Insert content flag using safe SQL execution
    const result = await executeSql(`
      INSERT INTO content_flags (
        content_id,
        content_type,
        flag_type,
        severity,
        flagged_by,
        created_at,
        resolved
      ) VALUES (
        '${contentId}',
        '${contentType}',
        '${flagType}',
        '${severity}',
        '${flaggedBy}',
        NOW(),
        false
      )
    `);
    
    if (!result) {
      console.error("Error creating content flag");
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
    // Check if the table exists
    const exists = await tableExists('content_reports');
    
    if (!exists) {
      console.log("content_reports table doesn't exist, report not created");
      return false;
    }
    
    // Insert content report using safe SQL execution
    const contentRef = contentReference ? `'${contentReference}'` : 'NULL';
    
    const result = await executeSql(`
      INSERT INTO content_reports (
        reported_user_id,
        reporting_user_id,
        report_type,
        content_reference,
        report_details,
        created_at,
        status
      ) VALUES (
        '${reportedUserId}',
        '${reportingUserId}',
        '${reportType}',
        ${contentRef},
        '${reportDetails}',
        NOW(),
        'pending'
      )
    `);
    
    if (!result) {
      console.error("Error creating content report");
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
    // Check if the table exists
    const exists = await tableExists('content_flags');
    
    if (!exists) {
      return false;
    }
    
    // Safe SQL execution
    const notesValue = notes ? `'${notes}'` : 'NULL';
    
    const result = await executeSql(`
      UPDATE content_flags
      SET resolved = true,
          resolved_by = '${resolvedBy}',
          resolved_at = NOW(),
          notes = ${notesValue}
      WHERE id = '${flagId}'
    `);
    
    if (!result) {
      console.error("Error resolving content flag");
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
    // Check if the table exists
    const exists = await tableExists('content_reports');
    
    if (!exists) {
      return false;
    }
    
    // Safe SQL execution
    const notesValue = adminNotes ? `'${adminNotes}'` : 'NULL';
    
    const result = await executeSql(`
      UPDATE content_reports
      SET status = 'resolved',
          resolution_action = '${resolutionAction}',
          admin_notes = ${notesValue}
      WHERE id = '${reportId}'
    `);
    
    if (!result) {
      console.error("Error resolving content report");
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
    // Check if tables exist
    const reportsExist = await tableExists('content_reports');
    const flagsExist = await tableExists('content_flags');
    
    if (!reportsExist || !flagsExist) {
      return defaults;
    }
    
    // Get pending reports count
    const pendingReportsResult = await executeSql(`
      SELECT COUNT(*) as count FROM content_reports WHERE status = 'pending'
    `);
    
    // Get unresolved flags count
    const flaggedContentResult = await executeSql(`
      SELECT COUNT(*) as count FROM content_flags WHERE resolved = false
    `);
    
    // Get total processed count
    const totalProcessedResult = await executeSql(`
      SELECT COUNT(*) as count FROM content_reports WHERE status = 'resolved'
    `);
    
    // Get resolved today count
    const resolvedTodayResult = await executeSql(`
      SELECT COUNT(*) as count FROM content_reports 
      WHERE status = 'resolved' 
      AND resolved_at::date = CURRENT_DATE
    `);
    
    return {
      pendingReports: pendingReportsResult?.result?.[0]?.count || 0,
      flaggedContent: flaggedContentResult?.result?.[0]?.count || 0,
      totalProcessed: totalProcessedResult?.result?.[0]?.count || 0,
      resolvedToday: resolvedTodayResult?.result?.[0]?.count || 0
    };
  } catch (err) {
    console.error('Error getting moderation stats:', err);
    return defaults;
  }
};
