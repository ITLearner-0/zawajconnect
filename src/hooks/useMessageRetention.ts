
import { useState, useEffect } from 'react';
import { RetentionPolicy } from '@/types/profile';
import { setRetentionPolicy } from '@/services/messageLifecycleService';
import { supabase } from '@/integrations/supabase/client';
import { columnExists, executeSql } from '@/utils/database';

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
        // Check if the retention_policy column exists
        const hasColumn = await columnExists('conversations', 'retention_policy');
        
        if (hasColumn) {
          // Fetch the retention policy using safe SQL execution
          const result = await executeSql(`
            SELECT retention_policy 
            FROM conversations 
            WHERE id = '${conversationId}'
          `);
          
          if (result && result.result && result.result.length > 0 && result.result[0].retention_policy) {
            setRetentionPolicyState(result.result[0].retention_policy as RetentionPolicy);
          } else {
            // Set default policy if none exists
            const defaultPolicy: RetentionPolicy = {
              type: 'permanent',
              auto_delete: false
            };
            setRetentionPolicyState(defaultPolicy);
          }
        } else {
          // Set default policy if column doesn't exist
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
