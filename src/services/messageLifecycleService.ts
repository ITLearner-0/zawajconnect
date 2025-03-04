
import { supabase } from '@/integrations/supabase/client';
import { RetentionPolicy } from '@/types/profile';

// Calculate deletion date based on retention policy
export const calculateDeletionDate = (policy: RetentionPolicy | undefined): string | null => {
  if (!policy || !policy.auto_delete) {
    return null;
  }
  
  if (policy.type === 'permanent') {
    return null;
  }
  
  // Default to 30 days if not specified
  const durationDays = policy.duration_days || 30;
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + durationDays);
  
  return deletionDate.toISOString();
};

// Set retention policy for a conversation
export const setRetentionPolicy = async (
  conversationId: string,
  policy: RetentionPolicy
): Promise<boolean> => {
  try {
    // First check if the column exists before updating
    const { data: columnCheck } = await supabase
      .rpc('column_exists', {
        table_name: 'conversations',
        column_name: 'retention_policy'
      });

    if (!columnCheck) {
      console.error('Column retention_policy does not exist in conversations table');
      return false;
    }
    
    // Update the conversation with the new retention policy
    const { error } = await supabase
      .from('conversations')
      .update({ 
        retention_policy: policy 
      })
      .eq('id', conversationId);
      
    if (error) {
      console.error('Error setting retention policy:', error);
      return false;
    }
    
    // If auto-delete is enabled, update all existing messages with scheduled deletion
    if (policy.auto_delete && policy.type === 'temporary') {
      const deletionDate = calculateDeletionDate(policy);
      
      if (deletionDate) {
        // First check if the column exists before updating
        const { data: msgColumnCheck } = await supabase
          .rpc('column_exists', {
            table_name: 'messages',
            column_name: 'scheduled_deletion'
          });

        if (!msgColumnCheck) {
          console.error('Column scheduled_deletion does not exist in messages table');
          return true; // We still succeeded in updating the policy
        }
        
        const { error: updateError } = await supabase
          .from('messages')
          .update({ 
            scheduled_deletion: deletionDate 
          })
          .eq('conversation_id', conversationId)
          .is('scheduled_deletion', null);
          
        if (updateError) {
          console.error('Error updating message deletion dates:', updateError);
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('Failed to set retention policy:', err);
    return false;
  }
};

// Apply scheduled deletion to clean up old messages
export const cleanupExpiredMessages = async (): Promise<void> => {
  try {
    // First check if the column exists before deleting
    const { data: columnCheck } = await supabase
      .rpc('column_exists', {
        table_name: 'messages',
        column_name: 'scheduled_deletion'
      });

    if (!columnCheck) {
      console.error('Column scheduled_deletion does not exist in messages table');
      return;
    }
    
    const now = new Date().toISOString();
    
    // Delete messages that are past their scheduled deletion date
    const { error } = await supabase
      .from('messages')
      .delete()
      .lt('scheduled_deletion', now);
      
    if (error) {
      console.error('Error cleaning up expired messages:', error);
    }
  } catch (err) {
    console.error('Failed to clean up expired messages:', err);
  }
};

// Run scheduled cleanup on app initialization or periodically
export const initializeMessageCleanup = (): void => {
  // Clean up expired messages immediately
  cleanupExpiredMessages();
  
  // Set up interval for periodic cleanup (every hour)
  setInterval(cleanupExpiredMessages, 60 * 60 * 1000);
};

// Helper function to check if a column exists in a table
// Note: This is a placeholder. In a real app, you would need to create this RPC function in Supabase
const checkColumnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // In a real implementation, this would be an RPC call to Supabase
    // For now, we'll just return true to avoid type errors
    return true;
  } catch (err) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, err);
    return false;
  }
};
