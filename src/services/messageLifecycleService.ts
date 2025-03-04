
import { supabase } from '@/integrations/supabase/client';
import { RetentionPolicy } from '@/types/profile';
import { addDays } from 'date-fns';

// Check if retention_policy column exists in conversations table
export const checkRetentionPolicyColumn = async (): Promise<boolean> => {
  try {
    // Use metadata query to check if column exists
    const { data, error } = await supabase.functions.invoke('check_column_exists', {
      body: { 
        table_name: 'conversations',
        column_name: 'retention_policy'
      }
    });
    
    if (error) {
      console.error('Error checking retention policy column:', error);
      return false;
    }
    
    return !!data?.exists;
  } catch (err) {
    console.error('Error checking retention policy column:', err);
    return false;
  }
};

// Add retention_policy column if it doesn't exist
export const addRetentionPolicyColumn = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('add_column_if_not_exists', {
      body: { 
        table_name: 'conversations',
        column_name: 'retention_policy',
        column_type: 'jsonb'
      }
    });
    
    if (error) {
      console.error('Error adding retention policy column:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error adding retention policy column:', err);
    return false;
  }
};

// Set retention policy for a conversation
export const setRetentionPolicy = async (
  conversationId: string, 
  policy: RetentionPolicy
): Promise<boolean> => {
  try {
    // First check if the column exists, add it if needed
    const columnExists = await checkRetentionPolicyColumn();
    if (!columnExists) {
      const added = await addRetentionPolicyColumn();
      if (!added) return false;
    }
    
    // Update the conversation with the retention policy
    const { error } = await supabase.functions.invoke('update_conversation_retention_policy', {
      body: {
        conversation_id: conversationId,
        retention_policy: policy
      }
    });
    
    if (error) {
      console.error('Error setting retention policy:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error setting retention policy:', err);
    return false;
  }
};

// Check if scheduled_deletion column exists in messages table
export const checkScheduledDeletionColumn = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('check_column_exists', {
      body: {
        table_name: 'messages',
        column_name: 'scheduled_deletion'
      }
    });
    
    if (error) {
      console.error('Error checking scheduled deletion column:', error);
      return false;
    }
    
    return !!data?.exists;
  } catch (err) {
    console.error('Error checking scheduled deletion column:', err);
    return false;
  }
};

// Add scheduled_deletion column if it doesn't exist
export const addScheduledDeletionColumn = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('add_column_if_not_exists', {
      body: {
        table_name: 'messages',
        column_name: 'scheduled_deletion',
        column_type: 'timestamp with time zone'
      }
    });
    
    if (error) {
      console.error('Error adding scheduled deletion column:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error adding scheduled deletion column:', err);
    return false;
  }
};

// Calculate when a message should be deleted based on retention policy
export const calculateDeletionDate = (policy?: RetentionPolicy): string | null => {
  if (!policy || policy.type === 'permanent' || !policy.auto_delete) {
    return null;
  }
  
  // Calculate deletion date based on policy duration
  const durationDays = policy.duration_days || 30; // Default to 30 days if not specified
  const deletionDate = addDays(new Date(), durationDays);
  
  return deletionDate.toISOString();
};

// Initialize message lifecycle management
export const initializeMessageCleanup = async (): Promise<void> => {
  try {
    // Check and add the scheduled_deletion column if needed
    const columnExists = await checkScheduledDeletionColumn();
    if (!columnExists) {
      await addScheduledDeletionColumn();
    }
    
    // Set up a periodic cleanup job (this is just a placeholder)
    console.log('Message cleanup initialized');
  } catch (err) {
    console.error('Error initializing message cleanup:', err);
  }
};

// Clean up expired messages (to be called by a cron job or similar)
export const cleanupExpiredMessages = async (): Promise<number> => {
  try {
    // First check if the column exists
    const columnExists = await checkScheduledDeletionColumn();
    if (!columnExists) return 0;
    
    // Delete messages that have passed their deletion date
    const { data, error } = await supabase.functions.invoke('delete_expired_messages', {
      body: { current_time: new Date().toISOString() }
    });
    
    if (error) {
      console.error('Error deleting expired messages:', error);
      return 0;
    }
    
    return data?.count || 0;
  } catch (err) {
    console.error('Error cleaning up expired messages:', err);
    return 0;
  }
};
