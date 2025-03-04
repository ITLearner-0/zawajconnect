
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { columnExists, executeSql } from '@/utils/databaseUtils';

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
        
        // Check if encryption_enabled column exists
        const hasEncryptionEnabledColumn = await columnExists('conversations', 'encryption_enabled');
        
        // Only enable if both columns exist
        if (hasEncryptedColumn && hasIVColumn && hasEncryptionEnabledColumn) {
          // Check if encryption is enabled for this conversation
          const result = await executeSql(`
            SELECT encryption_enabled 
            FROM conversations 
            WHERE id = '${conversationId}'
          `);

          if (result && result.result && result.result.length > 0) {
            setEncryptionEnabled(!!result.result[0].encryption_enabled);
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
      
      // Update encryption setting using safer SQL execution
      const result = await executeSql(`
        UPDATE conversations 
        SET encryption_enabled = ${enabled} 
        WHERE id = '${conversationId}'
      `);
        
      if (!result) {
        setError("Failed to update encryption setting");
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
