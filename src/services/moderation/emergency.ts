
import { supabase } from '@/integrations/supabase/client';

/**
 * Reports an emergency situation to moderators
 */
export const reportEmergency = async (
  reporterId: string,
  reportedUserId: string,
  conversationId: string,
  emergencyType: string
): Promise<boolean> => {
  try {
    // Insert into emergency_reports table
    const { error } = await supabase
      .from('emergency_reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        conversation_id: conversationId,
        emergency_type: emergencyType,
        created_at: new Date().toISOString(),
        status: 'pending',
        priority: emergencyType === 'immediate_threat' ? 'high' : 'medium'
      });
    
    if (error) {
      console.error("Error creating emergency report:", error);
      return false;
    }
    
    // For immediate threats, also notify admins via a different channel
    if (emergencyType === 'immediate_threat') {
      await notifyAdminsImmediately(conversationId, reporterId);
    }
    
    return true;
  } catch (err) {
    console.error('Error reporting emergency:', err);
    return false;
  }
};

/**
 * Notifies admins immediately for high-priority emergencies
 */
const notifyAdminsImmediately = async (
  conversationId: string,
  reporterId: string
): Promise<void> => {
  try {
    // This would typically trigger a notification to admins
    // For now, we'll log it to the database
    await supabase
      .from('admin_notifications')
      .insert({
        type: 'emergency',
        content: `URGENT: User ${reporterId} has reported an immediate threat in conversation ${conversationId}`,
        created_at: new Date().toISOString(),
        read: false,
        priority: 'critical'
      });
    
    console.log(`Emergency notification sent for conversation ${conversationId}`);
  } catch (err) {
    console.error('Error notifying admins:', err);
  }
};

/**
 * Resolves an emergency report
 */
export const resolveEmergencyReport = async (
  reportId: string,
  adminId: string,
  resolution: string,
  actionTaken: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('emergency_reports')
      .update({
        status: 'resolved',
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolution,
        action_taken: actionTaken
      })
      .eq('id', reportId);
    
    if (error) {
      console.error("Error resolving emergency report:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error resolving emergency report:', err);
    return false;
  }
};
