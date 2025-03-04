
import { supabase } from '@/integrations/supabase/client';
import { RetentionPolicy } from '@/types/profile';
import { columnExists, executeSql } from '@/utils/databaseUtils';

/**
 * Sets the retention policy for a conversation
 */
export const setRetentionPolicy = async (
  conversationId: string, 
  policy: RetentionPolicy
): Promise<boolean> => {
  try {
    // Check if the column exists
    const hasColumn = await columnExists('conversations', 'retention_policy');
    
    if (!hasColumn) {
      console.log("Retention policy column doesn't exist, cannot update");
      return false;
    }
    
    // Safe SQL execution
    const result = await executeSql(`
      UPDATE conversations 
      SET retention_policy = '${JSON.stringify(policy)}'::jsonb 
      WHERE id = '${conversationId}'
    `);
    
    if (!result) {
      console.error("Error updating retention policy");
      return false;
    }
    
    // If auto-delete is enabled, schedule message deletion
    if (policy.auto_delete && policy.type === 'temporary' && policy.duration_days) {
      // Schedule messages for deletion
      await scheduleMessageDeletion(conversationId, policy.duration_days);
    }
    
    return true;
  } catch (err) {
    console.error('Error setting retention policy:', err);
    return false;
  }
};

/**
 * Schedules messages for deletion after the specified number of days
 */
const scheduleMessageDeletion = async (
  conversationId: string, 
  durationDays: number
): Promise<boolean> => {
  try {
    // Check if scheduled_deletion column exists
    const hasColumn = await columnExists('messages', 'scheduled_deletion');
    
    if (!hasColumn) {
      console.log("Scheduled deletion column doesn't exist, cannot schedule");
      return false;
    }
    
    // Calculate deletion date
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + durationDays);
    
    // Update messages with scheduled deletion date
    const result = await executeSql(`
      UPDATE messages 
      SET scheduled_deletion = '${deletionDate.toISOString()}'
      WHERE conversation_id = '${conversationId}'
      AND (scheduled_deletion IS NULL OR scheduled_deletion > '${deletionDate.toISOString()}')
    `);
    
    if (!result) {
      console.error("Error scheduling message deletion");
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error scheduling message deletion:', err);
    return false;
  }
};

/**
 * Deletes all messages with scheduled_deletion date in the past
 */
export const deleteExpiredMessages = async (): Promise<boolean> => {
  try {
    // Check if scheduled_deletion column exists
    const hasColumn = await columnExists('messages', 'scheduled_deletion');
    
    if (!hasColumn) {
      return false;
    }
    
    // Delete expired messages
    const result = await executeSql(`
      DELETE FROM messages
      WHERE scheduled_deletion IS NOT NULL
      AND scheduled_deletion < NOW()
    `);
    
    if (!result) {
      console.error("Error deleting expired messages");
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error deleting expired messages:', err);
    return false;
  }
};

/**
 * Schedules all messages in a conversation for immediate deletion
 */
export const deleteAllMessages = async (conversationId: string): Promise<boolean> => {
  try {
    const result = await executeSql(`
      DELETE FROM messages
      WHERE conversation_id = '${conversationId}'
    `);
    
    if (!result) {
      console.error("Error deleting all messages");
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error deleting all messages:', err);
    return false;
  }
};
