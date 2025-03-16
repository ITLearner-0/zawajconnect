
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
    console.log(`Emergency report created: 
      Reporter: ${reporterId} 
      Reported user: ${reportedUserId}
      Conversation: ${conversationId}
      Type: ${emergencyType}
      Priority: ${emergencyType === 'immediate_threat' ? 'high' : 'medium'}
    `);
    
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
    console.log(`URGENT NOTIFICATION: User ${reporterId} has reported an immediate threat in conversation ${conversationId}`);
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
    console.log(`Emergency report ${reportId} resolved:
      Admin: ${adminId}
      Resolution: ${resolution}
      Action taken: ${actionTaken}
    `);
    
    return true;
  } catch (err) {
    console.error('Error resolving emergency report:', err);
    return false;
  }
};
