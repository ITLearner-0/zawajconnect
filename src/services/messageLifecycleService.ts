
import { supabase } from "@/integrations/supabase/client";
import { RetentionPolicy } from "@/types/profile";
import { columnExists } from "@/utils/databaseUtils";

/**
 * Set the retention policy for a conversation
 */
export const setRetentionPolicy = async (conversationId: string, policy: RetentionPolicy): Promise<boolean> => {
  try {
    // Check if retention_policy column exists
    const hasRetentionPolicy = await columnExists('conversations', 'retention_policy');
    
    if (!hasRetentionPolicy) {
      console.log("Retention policy column doesn't exist, cannot update");
      return false;
    }
    
    // Use execute_sql for update
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        UPDATE conversations 
        SET retention_policy = '${JSON.stringify(policy)}' 
        WHERE id = '${conversationId}'
      `
    });
      
    if (error) {
      console.error("Error setting retention policy:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in setRetentionPolicy:", err);
    return false;
  }
};

/**
 * Calculate when a message should be deleted based on retention policy
 */
export const calculateDeletionDate = (policy?: RetentionPolicy): string | null => {
  if (!policy || !policy.auto_delete || policy.type === 'permanent') {
    return null;
  }
  
  const durationDays = policy.duration_days || 30; // Default to 30 days if not specified
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + durationDays);
  
  return deletionDate.toISOString();
};

/**
 * Apply message lifecycle settings to a new message
 */
export const applyMessageLifecycle = async (
  messageId: string, 
  retentionPolicy?: RetentionPolicy
): Promise<void> => {
  try {
    // Only apply if we have a retention policy
    if (!retentionPolicy || !retentionPolicy.auto_delete) {
      return;
    }
    
    // Calculate deletion date
    const scheduledDeletion = calculateDeletionDate(retentionPolicy);
    if (!scheduledDeletion) {
      return;
    }
    
    // Check if scheduled_deletion column exists
    const hasScheduledDeletion = await columnExists('messages', 'scheduled_deletion');
    
    if (!hasScheduledDeletion) {
      console.log("Scheduled deletion column doesn't exist, cannot update");
      return;
    }
    
    // Use execute_sql for update
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        UPDATE messages 
        SET scheduled_deletion = '${scheduledDeletion}' 
        WHERE id = '${messageId}'
      `
    });
      
    if (error) {
      console.error("Error setting message scheduled deletion:", error);
    }
  } catch (err) {
    console.error("Error in applyMessageLifecycle:", err);
  }
};

/**
 * Initialize the message cleanup routine
 */
export const initializeMessageCleanup = (): void => {
  // Placeholder for message cleanup initialization
  console.log("Message cleanup initialized");
};
