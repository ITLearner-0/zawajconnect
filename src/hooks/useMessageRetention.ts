
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RetentionPolicy } from '@/types/profile';
import { calculateDeletionDate, setRetentionPolicy } from '@/services/messageLifecycleService';

export const useMessageRetention = (conversationId: string | undefined) => {
  const [retentionPolicy, setRetentionPolicyState] = useState<RetentionPolicy | undefined>();
  
  // Get conversation retention policy
  useEffect(() => {
    if (!conversationId) return;
    
    const getRetentionPolicy = async () => {
      try {
        // Check if retention_policy column exists
        const { data: columnExistsData, error: columnExistsError } = await supabase
          .from('conversations')
          .select('id')
          .eq('id', conversationId)
          .limit(1);
          
        if (columnExistsError) {
          console.error('Error checking if retention policy exists:', columnExistsError);
          return;
        }
        
        // If we can fetch the conversation, try to get its retention policy
        if (columnExistsData && columnExistsData.length > 0) {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();
            
          if (error) {
            console.error('Error fetching retention policy:', error);
            return;
          }
          
          if (data && data.retention_policy) {
            setRetentionPolicyState(data.retention_policy);
          }
        }
      } catch (err) {
        console.error('Failed to get retention policy:', err);
      }
    };

    getRetentionPolicy();
  }, [conversationId]);

  // Update the retention policy
  const updateRetentionPolicy = async (policy: RetentionPolicy): Promise<boolean> => {
    if (!conversationId) return false;
    
    const success = await setRetentionPolicy(conversationId, policy);
    
    if (success) {
      setRetentionPolicyState(policy);
    }
    
    return success;
  };

  // Calculate deletion date for a message
  const getMessageDeletionDate = (): string | null => {
    return calculateDeletionDate(retentionPolicy);
  };

  return {
    retentionPolicy,
    updateRetentionPolicy,
    getMessageDeletionDate
  };
};
