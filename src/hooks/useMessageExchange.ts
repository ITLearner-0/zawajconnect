
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useMessageEncryption } from './useMessageEncryption';
import { useMessageRetention } from './useMessageRetention';
import { useMessageModeration } from './useMessageModeration';

export const useMessageExchange = (conversationId: string | undefined, userId: string | null) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use our new specialized hooks
  const {
    encryptionEnabled,
    toggleEncryption,
    encryptMessageContent,
    decryptMessageContent
  } = useMessageEncryption(conversationId, userId);
  
  const {
    retentionPolicy,
    updateRetentionPolicy,
    getMessageDeletionDate
  } = useMessageRetention(conversationId);
  
  const {
    moderateMessageContent,
    processContentFlags
  } = useMessageModeration(userId);

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
                try {
                  const decryptedContent = await decryptMessageContent(msg.content, msg.iv);
                  return { ...msg, content: decryptedContent };
                } catch (err) {
                  console.error('Failed to decrypt message:', err);
                  return { ...msg, content: '[Encrypted message]' };
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
          try {
            const decryptedContent = await decryptMessageContent(newMessage.content, newMessage.iv);
            newMessage.content = decryptedContent;
          } catch (err) {
            console.error('Failed to decrypt new message:', err);
            newMessage.content = '[Encrypted message]';
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
  }, [conversationId, userId, toast, decryptMessageContent]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !userId || !conversationId) return;
    
    setSendingMessage(true);
    setError(null);
    
    try {
      // Filter message content before sending
      const { filteredContent, flags } = moderateMessageContent(messageInput);
      
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
        .select('wali_supervised')
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
          // Encrypt the message
          const encryptionResult = await encryptMessageContent(filteredContent);
          
          if (encryptionResult.iv) {
            finalContent = encryptionResult.encryptedContent;
            iv = encryptionResult.iv;
            keyId = encryptionResult.keyId;
            encrypted = true;
          }
        } catch (err) {
          console.error('Error encrypting message:', err);
          // Fall back to unencrypted if encryption fails
        }
      }
      
      // Calculate scheduled deletion date based on retention policy
      const scheduledDeletion = getMessageDeletionDate();
      
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
        await processContentFlags(messageId, flags, userId);
        
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
