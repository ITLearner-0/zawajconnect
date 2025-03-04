
import { supabase } from "@/integrations/supabase/client";
import { RetentionPolicy } from "@/types/profile";

/**
 * Checks if a column exists in a table
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('column_exists', {
      table_name: tableName,
      column_name: columnName
    });
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error(`Error in columnExists check for ${columnName}:`, err);
    return false;
  }
};

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
    
    const { error } = await supabase
      .from('conversations')
      .update({ retention_policy: policy })
      .eq('id', conversationId);
      
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
    
    // Update the message with scheduled deletion date
    const { error } = await supabase
      .from('messages')
      .update({ scheduled_deletion: scheduledDeletion })
      .eq('id', messageId);
      
    if (error) {
      console.error("Error setting message scheduled deletion:", error);
    }
  } catch (err) {
    console.error("Error in applyMessageLifecycle:", err);
  }
};
