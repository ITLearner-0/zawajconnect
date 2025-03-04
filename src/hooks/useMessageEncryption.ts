
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { columnExists } from '@/utils/databaseUtils';

export const useMessageEncryption = (conversationId: string | undefined) => {
  const [encryptionEnabled, setEncryptionEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if encryption is supported (columns exist)
  useEffect(() => {
    if (!conversationId) return;

    const checkEncryptionSupport = async () => {
      setLoading(true);
      try {
        // Check if encryption-related columns exist
        const hasEncryptedColumn = await columnExists('messages', 'encrypted');
        const hasIVColumn = await columnExists('messages', 'iv');
        
        // Only enable if both columns exist
        if (hasEncryptedColumn && hasIVColumn) {
          // Check if encryption is enabled for this conversation
          const { data, error } = await supabase
            .from('conversations')
            .select('encryption_enabled')
            .eq('id', conversationId)
            .single();

          if (!error && data) {
            setEncryptionEnabled(!!data.encryption_enabled);
          } else {
            // Default to false if not set
            setEncryptionEnabled(false);
          }
        } else {
          setEncryptionEnabled(false);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkEncryptionSupport();
  }, [conversationId]);

  // Toggle encryption for the conversation
  const toggleEncryption = async (enabled: boolean): Promise<boolean> => {
    if (!conversationId) return false;
    
    setLoading(true);
    try {
      // Check if the column exists first
      const hasColumn = await columnExists('conversations', 'encryption_enabled');
      
      if (!hasColumn) {
        console.log("Encryption column doesn't exist, cannot update");
        return false;
      }
      
      // Update encryption setting
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
          UPDATE conversations 
          SET encryption_enabled = ${enabled} 
          WHERE id = '${conversationId}'
        `
      });
        
      if (error) {
        setError(error.message);
        return false;
      }
      
      setEncryptionEnabled(enabled);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    encryptionEnabled,
    toggleEncryption,
    loading,
    error
  };
};
