
import { supabase } from '@/integrations/supabase/client';
import { Message, ContentFlag, ContentReport } from '@/types/profile';

// Sensitive words and patterns to filter
const sensitivePatterns = [
  { pattern: /\b(sex|nude|naked)\b/i, replacement: '***', flag: 'inappropriate' },
  { pattern: /\b(idiot|stupid|dumb)\b/i, replacement: '***', flag: 'harassment' },
  { pattern: /\b(alcohol|wine|beer|drunk)\b/i, replacement: '***', flag: 'religious_violation' },
  { pattern: /(phone number|address|location)\s*[:;-]?\s*([0-9\s\-\+\(\)]+)/i, replacement: '***', flag: 'suspicious' }
];

// Filter message content against sensitive patterns
export const filterMessageContent = (content: string) => {
  let filteredContent = content;
  const flags: Array<{ flag_type: string; severity: string }> = [];
  
  sensitivePatterns.forEach(({ pattern, replacement, flag }) => {
    if (pattern.test(content)) {
      filteredContent = filteredContent.replace(pattern, replacement);
      
      // Add a flag for this violation
      flags.push({
        flag_type: flag as ContentFlag['flag_type'],
        severity: determineViolationSeverity(flag),
      });
    }
  });
  
  return {
    filteredContent,
    flags
  };
};

// Determine severity based on flag type
const determineViolationSeverity = (flagType: string): ContentFlag['severity'] => {
  switch (flagType) {
    case 'inappropriate':
      return 'high';
    case 'religious_violation':
      return 'high';
    case 'harassment':
      return 'medium';
    case 'suspicious':
      return 'low';
    default:
      return 'low';
  }
};

// Report inappropriate content or behavior - Export this for the ReportDialog component
export const submitContentReport = async (
  reportData: Omit<ContentReport, 'id' | 'created_at' | 'status'>
): Promise<boolean> => {
  try {
    const reportPayload = {
      reported_user_id: reportData.reported_user_id,
      reporting_user_id: reportData.reporting_user_id,
      report_type: reportData.report_type,
      content_reference: reportData.content_reference || '',
      report_details: reportData.report_details,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    
    // Use direct function instead of RPC to avoid type issues
    const { error } = await supabase.functions.invoke('insert_content_report', {
      body: reportPayload
    });
    
    if (error) {
      console.error("Error submitting report:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in report submission:", err);
    return false;
  }
};

// Flag content directly
export const flagContent = async (
  contentId: string,
  contentType: ContentFlag['content_type'],
  flagType: ContentFlag['flag_type'],
  severity: ContentFlag['severity'],
  flaggedBy: string
): Promise<boolean> => {
  try {
    const flagData = {
      content_id: contentId,
      content_type: contentType,
      flag_type: flagType,
      severity,
      flagged_by: flaggedBy,
      created_at: new Date().toISOString(),
      resolved: false
    };
    
    const { error } = await supabase.functions.invoke('insert_content_flag', {
      body: flagData
    });
    
    if (error) {
      console.error("Error flagging content:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in content flagging:", err);
    return false;
  }
};

// Get statistics about moderation activities
export const getModerationStats = async (): Promise<{ 
  pending_reports: number, 
  flagged_content: number,
  resolved_reports: number 
}> => {
  try {
    // Use functions.invoke instead of rpc
    const pendingReportsResult = await supabase.functions.invoke('count_pending_reports');
    const flaggedContentResult = await supabase.functions.invoke('count_unresolved_flags');
    const resolvedReportsResult = await supabase.functions.invoke('count_resolved_reports');
    
    return {
      pending_reports: Number(pendingReportsResult.data || 0),
      flagged_content: Number(flaggedContentResult.data || 0),
      resolved_reports: Number(resolvedReportsResult.data || 0)
    };
  } catch (err) {
    console.error("Error getting moderation stats:", err);
    return {
      pending_reports: 0,
      flagged_content: 0,
      resolved_reports: 0
    };
  }
};

// Resolve a report (admin action)
export const resolveReport = async (
  reportId: string,
  resolution: 'warning' | 'temporary_ban' | 'permanent_ban' | 'content_removal' | 'no_action',
  adminNotes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('resolve_content_report', {
      body: {
        report_id: reportId,
        resolution_action: resolution,
        admin_notes: adminNotes || ''
      }
    });
    
    if (error) {
      console.error("Error resolving report:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in report resolution:", err);
    return false;
  }
};

// Resolve a content flag (admin action)
export const resolveContentFlag = async (
  flagId: string,
  resolvedBy: string,
  notes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('resolve_content_flag', {
      body: {
        flag_id: flagId,
        resolved_by_user: resolvedBy,
        resolution_notes: notes || ''
      }
    });
    
    if (error) {
      console.error("Error resolving flag:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in flag resolution:", err);
    return false;
  }
};

// Get all content reports (admin)
export const getAllReports = async (): Promise<ContentReport[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_all_content_reports');
    
    if (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
    
    return data as ContentReport[] || [];
  } catch (err) {
    console.error("Error retrieving content reports:", err);
    return [];
  }
};

// Get all content flags (admin)
export const getAllFlags = async (): Promise<ContentFlag[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_all_content_flags');
    
    if (error) {
      console.error("Error fetching flags:", error);
      return [];
    }
    
    return data as ContentFlag[] || [];
  } catch (err) {
    console.error("Error retrieving content flags:", err);
    return [];
  }
};
