
import { ContentFlag, ContentReport, Message } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';

// List of inappropriate words (simplified for demonstration)
const INAPPROPRIATE_WORDS = [
  'inappropriate', 'offensive', 'hate', 'violate', 'swear', 'curse',
  'alcohol', 'dating', 'boyfriend', 'girlfriend', 'date', 'haram'
];

// Religious violations detection patterns
const RELIGIOUS_VIOLATIONS = [
  /dating|romantic date|non-halal|dating app/i,
  /alcohol|wine|beer|drinking|intoxication/i,
  /zina|adultery|fornication/i,
  /immodesty|revealing clothes/i,
];

/**
 * Filters a message for inappropriate content
 * @param message The message to filter
 * @returns Filtered message and any detected flags
 */
export const filterMessageContent = (message: string): { 
  filteredContent: string, 
  flags: Omit<ContentFlag, 'id' | 'content_id' | 'flagged_by' | 'created_at'>[] 
} => {
  let filteredContent = message;
  const flags: Omit<ContentFlag, 'id' | 'content_id' | 'flagged_by' | 'created_at'>[] = [];
  
  // Check for inappropriate words
  INAPPROPRIATE_WORDS.forEach(word => {
    if (new RegExp(`\\b${word}\\b`, 'i').test(message)) {
      filteredContent = filteredContent.replace(
        new RegExp(`\\b${word}\\b`, 'gi'), 
        '***'
      );
      
      flags.push({
        content_type: 'message',
        flag_type: 'inappropriate',
        severity: 'medium',
        resolved: false,
      });
    }
  });
  
  // Check for religious violations
  RELIGIOUS_VIOLATIONS.forEach(pattern => {
    if (pattern.test(message)) {
      // We already replaced the words above, this is just for flagging
      flags.push({
        content_type: 'message',
        flag_type: 'religious_violation',
        severity: 'high',
        resolved: false,
      });
    }
  });
  
  return { filteredContent, flags };
};

/**
 * Submits a content report
 */
export const submitContentReport = async (report: Omit<ContentReport, 'id' | 'created_at' | 'status'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('content_reports')
      .insert({
        ...report,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error("Error submitting report:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in submitContentReport:", err);
    return false;
  }
};

/**
 * Flags content for review
 */
export const flagContent = async (
  contentId: string,
  contentType: 'message' | 'profile' | 'image',
  flagType: 'inappropriate' | 'harassment' | 'religious_violation' | 'suspicious',
  severity: 'low' | 'medium' | 'high',
  flaggedBy: string
): Promise<boolean> => {
  try {
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
      console.error("Error flagging content:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in flagContent:", err);
    return false;
  }
};

/**
 * Gets moderation statistics for admin dashboard
 */
export const getModerationStats = async (): Promise<{ 
  pendingReports: number;
  flaggedContent: number;
  resolvedToday: number;
}> => {
  try {
    // Count pending reports
    const { count: pendingReports, error: reportsError } = await supabase
      .from('content_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
      
    // Count flagged content
    const { count: flaggedContent, error: flagsError } = await supabase
      .from('content_flags')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);
      
    // Count resolved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: resolvedToday, error: resolvedError } = await supabase
      .from('content_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('resolved_at', today.toISOString());
      
    if (reportsError || flagsError || resolvedError) {
      console.error("Error fetching moderation stats");
      return { pendingReports: 0, flaggedContent: 0, resolvedToday: 0 };
    }
    
    return {
      pendingReports: pendingReports || 0,
      flaggedContent: flaggedContent || 0,
      resolvedToday: resolvedToday || 0
    };
  } catch (err) {
    console.error("Error in getModerationStats:", err);
    return { pendingReports: 0, flaggedContent: 0, resolvedToday: 0 };
  }
};
