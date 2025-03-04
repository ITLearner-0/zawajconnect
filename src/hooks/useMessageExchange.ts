
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, RetentionPolicy } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { filterMessageContent } from '@/services/contentModerationService';
import { 
  encryptMessage, 
  decryptMessage, 
  generateIV, 
  generateEncryptionKey, 
  exportKey, 
  storeEncryptionKey, 
  getEncryptionKey, 
  generateKeyId 
} from '@/services/encryptionService';
import { calculateDeletionDate } from '@/services/messageLifecycleService';

export const useMessageExchange = (conversationId: string | undefined, userId: string | null) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [retentionPolicy, setRetentionPolicy] = useState<RetentionPolicy | undefined>();

  // Initialize encryption for this conversation
  useEffect(() => {
    if (!conversationId || !userId) return;

    const initializeEncryption = async () => {
      // Check if we already have a key for this conversation
      let keyString = getEncryptionKey(conversationId);
      
      if (!keyString) {
        try {
          // Generate a new encryption key for this conversation
          const newKey = await generateEncryptionKey();
          keyString = await exportKey(newKey);
          
          // Store the key locally
          storeEncryptionKey(conversationId, keyString);
        } catch (err) {
          console.error('Failed to initialize encryption:', err);
          setEncryptionEnabled(false);
        }
      }
    };

    // Get conversation retention policy
    const getRetentionPolicy = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('retention_policy')
          .eq('id', conversationId)
          .single();
          
        if (error) {
          console.error('Error fetching retention policy:', error);
          return;
        }
        
        if (data && data.retention_policy) {
          setRetentionPolicy(data.retention_policy);
        }
      } catch (err) {
        console.error('Failed to get retention policy:', err);
      }
    };

    initializeEncryption();
    getRetentionPolicy();
  }, [conversationId, userId]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!conversationId || !userId) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          throw messagesError;
        }

        if (messagesData) {
          // Decrypt encrypted messages
          const decryptedMessages = await Promise.all(
            messagesData.map(async (msg: Message) => {
              if (msg.encrypted && msg.iv) {
                const keyString = getEncryptionKey(conversationId);
                
                if (keyString) {
                  try {
                    const decryptedContent = await decryptMessage(
                      msg.content,
                      keyString,
                      msg.iv
                    );
                    return { ...msg, content: decryptedContent };
                  } catch (err) {
                    console.error('Failed to decrypt message:', err);
                    return { ...msg, content: '[Encrypted message]' };
                  }
                }
              }
              return msg;
            })
          );
          
          setMessages(decryptedMessages as Message[]);
        
          // Mark unread messages as read
          const unreadMessages = messagesData
            .filter(msg => !msg.is_read && msg.sender_id !== userId)
            .map(msg => msg.id);
            
          if (unreadMessages.length > 0) {
            const { error: updateError } = await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', unreadMessages);
              
            if (updateError) {
              console.error("Error marking messages as read:", updateError);
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error loading messages",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('new_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        // Add the new message to the list
        const newMessage = payload.new as Message;
        
        // Decrypt if message is encrypted
        if (newMessage.encrypted && newMessage.iv) {
          const keyString = getEncryptionKey(conversationId);
          
          if (keyString) {
            try {
              const decryptedContent = await decryptMessage(
                newMessage.content,
                keyString,
                newMessage.iv
              );
              newMessage.content = decryptedContent;
            } catch (err) {
              console.error('Failed to decrypt new message:', err);
              newMessage.content = '[Encrypted message]';
            }
          }
        }
        
        setMessages(prev => [...prev, newMessage]);
        
        // If message is not from current user, mark as read
        if (newMessage.sender_id !== userId) {
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', newMessage.id)
            .then(({ error }) => {
              if (error) {
                console.error("Error marking new message as read:", error);
              }
            });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, toast]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !userId || !conversationId) return;
    
    setSendingMessage(true);
    setError(null);
    
    try {
      // Filter message content before sending
      const { filteredContent, flags } = filterMessageContent(messageInput);
      
      // Check if wali supervision is required for female users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('gender, wali_name')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      const needsWaliSupervision = profileData?.gender === 'Female' && !profileData?.wali_name;
      
      // Get conversation wali_supervised status
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('wali_supervised, retention_policy')
        .eq('id', conversationId)
        .single();
      
      if (convError) {
        throw convError;
      }
      
      // Process content for encryption if enabled
      let finalContent = filteredContent;
      let iv = null;
      let encrypted = false;
      let keyId = null;
      
      if (encryptionEnabled) {
        try {
          // Get the encryption key
          const keyString = getEncryptionKey(conversationId);
          
          if (keyString) {
            // Generate a unique IV for this message
            iv = generateIV();
            
            // Encrypt the message content
            finalContent = await encryptMessage(filteredContent, keyString, iv);
            encrypted = true;
            keyId = generateKeyId();
          }
        } catch (err) {
          console.error('Error encrypting message:', err);
          // Fall back to unencrypted if encryption fails
        }
      }
      
      // Calculate scheduled deletion date based on retention policy
      const scheduledDeletion = calculateDeletionDate(
        retentionPolicy || convData?.retention_policy
      );
      
      const newMessage = {
        conversation_id: conversationId,
        sender_id: userId,
        content: finalContent,
        is_wali_visible: (convData?.wali_supervised || needsWaliSupervision) ?? false,
        is_filtered: filteredContent !== messageInput,
        // Encryption fields
        encrypted,
        iv,
        encryption_key_id: keyId,
        // Deletion scheduling
        scheduled_deletion: scheduledDeletion
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('messages')
        .insert(newMessage)
        .select();
        
      if (insertError) {
        throw insertError;
      }
      
      // If there were flags, record them with the message ID
      if (flags.length > 0 && insertData && insertData.length > 0) {
        const messageId = insertData[0].id;
        
        // Create flag objects with proper fields
        const flagsWithMetadata = flags.map(flag => ({
          content_id: messageId,
          content_type: 'message',
          flag_type: flag.flag_type,
          severity: flag.severity,
          flagged_by: userId,
          created_at: new Date().toISOString(),
          resolved: false
        }));
        
        // Use a properly formatted insert that works with Supabase's RPC
        for (const flag of flagsWithMetadata) {
          const { error: flagError } = await supabase.rpc('insert_content_flag', flag);
            
          if (flagError) {
            console.error("Error inserting content flag:", flagError);
          }
        }
        
        // If content was filtered, notify the user
        if (filteredContent !== messageInput) {
          toast({
            title: "Message Modified",
            description: "Your message was modified to comply with community guidelines.",
            duration: 3000
          });
        }
      }
      
      setMessageInput('');
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error sending message",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Update the retention policy
  const updateRetentionPolicy = (policy: RetentionPolicy) => {
    setRetentionPolicy(policy);
  };

  // Toggle encryption for the conversation
  const toggleEncryption = (enabled: boolean) => {
    setEncryptionEnabled(enabled);
  };

  return {
    messages,
    messageInput,
    setMessageInput,
    sendMessage,
    loading,
    sendingMessage,
    error,
    encryptionEnabled,
    toggleEncryption,
    retentionPolicy,
    updateRetentionPolicy
  };
};
