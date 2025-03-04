
import { useState, useEffect } from 'react';
import { 
  generateEncryptionKey, 
  exportKey, 
  storeEncryptionKey, 
  getEncryptionKey, 
  generateKeyId, 
  encryptMessage, 
  decryptMessage, 
  generateIV 
} from '@/services/encryptionService';

export const useMessageEncryption = (conversationId: string | undefined, userId: string | null) => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [encryptionInitialized, setEncryptionInitialized] = useState(false);

  // Initialize encryption for this conversation
  useEffect(() => {
    if (!conversationId || !userId) return;

    const initializeEncryption = async () => {
      try {
        // Check if we already have a key for this conversation
        let keyString = getEncryptionKey(conversationId);
        
        if (!keyString) {
          // Generate a new encryption key for this conversation
          const newKey = await generateEncryptionKey();
          keyString = await exportKey(newKey);
          
          // Store the key locally
          storeEncryptionKey(conversationId, keyString);
        }
        
        setEncryptionInitialized(true);
      } catch (err) {
        console.error('Failed to initialize encryption:', err);
        setEncryptionEnabled(false);
      }
    };

    initializeEncryption();
  }, [conversationId, userId]);

  // Toggle encryption for the conversation
  const toggleEncryption = (enabled: boolean) => {
    setEncryptionEnabled(enabled);
  };

  // Encrypt a message
  const encryptMessageContent = async (content: string): Promise<{ 
    encryptedContent: string, 
    iv: string, 
    keyId: string | null 
  }> => {
    if (!encryptionEnabled || !conversationId) {
      return { encryptedContent: content, iv: '', keyId: null };
    }

    try {
      // Get the encryption key
      const keyString = getEncryptionKey(conversationId);
      
      if (keyString) {
        // Generate a unique IV for this message
        const iv = generateIV();
        
        // Encrypt the message content
        const encryptedContent = await encryptMessage(content, keyString, iv);
        const keyId = generateKeyId();
        
        return { encryptedContent, iv, keyId };
      }
    } catch (err) {
      console.error('Error encrypting message:', err);
    }
    
    // Fall back to unencrypted if encryption fails
    return { encryptedContent: content, iv: '', keyId: null };
  };

  // Decrypt a message
  const decryptMessageContent = async (
    encryptedContent: string, 
    iv: string | null
  ): Promise<string> => {
    if (!encryptedContent || !iv || !conversationId) {
      return encryptedContent;
    }

    try {
      const keyString = getEncryptionKey(conversationId);
      
      if (keyString) {
        return await decryptMessage(encryptedContent, keyString, iv);
      }
    } catch (err) {
      console.error('Failed to decrypt message:', err);
    }
    
    return '[Encrypted message]';
  };

  return {
    encryptionEnabled,
    encryptionInitialized,
    toggleEncryption,
    encryptMessageContent,
    decryptMessageContent
  };
};
