
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
          
          // Since executeSql returns true or a data object, handle accordingly
          if (result && typeof result !== 'boolean') {
            // Check if there's data in the results and has the retention_policy field
            const data = Array.isArray(result) ? result[0] : result;
            if (data?.retention_policy) {
              setRetentionPolicyState(data.retention_policy as RetentionPolicy);
            } else {
              // Set default policy if none exists
              const defaultPolicy: RetentionPolicy = {
                type: 'permanent',
                auto_delete: false
              };
              setRetentionPolicyState(defaultPolicy);
            }
          } else {
            // Set default policy if no valid result
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
