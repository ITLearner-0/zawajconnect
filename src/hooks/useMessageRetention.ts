
import { useState, useEffect } from 'react';
import { RetentionPolicy } from '@/types/profile';
import { setRetentionPolicy } from '@/services/messageLifecycleService';
import { supabase } from '@/integrations/supabase/client';

export const useMessageRetention = (conversationId: string | undefined) => {
  const [retentionPolicy, setRetentionPolicyState] = useState<RetentionPolicy | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current retention policy
  useEffect(() => {
    if (!conversationId) return;

    const fetchRetentionPolicy = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('retention_policy')
          .eq('id', conversationId)
          .single();

        if (error) {
          console.error('Error fetching retention policy:', error);
          setError(error.message);
        } else if (data && data.retention_policy) {
          setRetentionPolicyState(data.retention_policy as RetentionPolicy);
        } else {
          // Set default policy if none exists
          const defaultPolicy: RetentionPolicy = {
            type: 'permanent',
            auto_delete: false
          };
          setRetentionPolicyState(defaultPolicy);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRetentionPolicy();
  }, [conversationId]);

  // Update retention policy
  const updateRetentionPolicy = async (policy: RetentionPolicy): Promise<boolean> => {
    if (!conversationId) return false;
    
    setLoading(true);
    try {
      const success = await setRetentionPolicy(conversationId, policy);
      
      if (success) {
        setRetentionPolicyState(policy);
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    retentionPolicy,
    updateRetentionPolicy,
    loading,
    error
  };
};
