
import { supabase } from '@/integrations/supabase/client';
import { ContentReport } from '@/types/profile';

/**
 * Creates a content report using content_flags table since content_reports doesn't exist
 */
export const reportContent = async (
  reportedUserId: string,
  reportingUserId: string,
  reportType: string,
  contentReference: string | undefined,
  reportDetails: string
): Promise<boolean> => {
  try {
    // Use content_flags table instead of content_reports
    const { error } = await supabase
      .from('content_flags')
      .insert({
        content_id: contentReference || reportedUserId,
        content_type: 'profile',
        flag_type: reportType,
        flagged_by: reportingUserId,
        severity: 'medium',
        notes: reportDetails,
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
export const resolveContentReport = async (
  reportId: string,
  resolutionAction: string,
  adminNotes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('content_flags')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        notes: adminNotes
      })
      .eq('id', reportId);
    
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
