
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
        // Use RPC to check if column exists and get data
        const { data, error } = await supabase.functions.invoke('get_conversation_retention_policy', {
          body: { conversation_id: conversationId }
        });
        
        if (error) {
          console.error('Error fetching retention policy:', error);
          return;
        }
        
        if (data && data.retention_policy) {
          setRetentionPolicyState(data.retention_policy);
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
