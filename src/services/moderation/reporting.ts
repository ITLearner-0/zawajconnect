
import { supabase } from '@/integrations/supabase/client';
import { ContentReport } from '@/types/profile';

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
