
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useMessageExchange = (conversationId: string | undefined, userId: string | null) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!conversationId || !userId) return;

    const fetchMessages = async () => {
      setLoading(true);
      
      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        toast({
          title: "Error loading messages",
          description: messagesError.message,
          variant: "destructive"
        });
      } else {
        setMessages(messagesData as Message[]);
        
        // Mark unread messages as read
        const unreadMessages = messagesData
          .filter(msg => !msg.is_read && msg.sender_id !== userId)
          .map(msg => msg.id);
          
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages);
        }
      }
      
      setLoading(false);
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
      }, (payload) => {
        // Add the new message to the list
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
        
        // If message is not from current user, mark as read
        if (newMessage.sender_id !== userId) {
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', newMessage.id);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, toast]);

  const sendMessage = async (conversationId: string) => {
    if (!messageInput.trim() || !userId) return;
    
    // Check if wali supervision is required for female users
    const { data: profileData } = await supabase
      .from('profiles')
      .select('gender, wali_name')
      .eq('id', userId)
      .single();
      
    const needsWaliSupervision = profileData?.gender === 'Female' && !profileData?.wali_name;
    
    // Get conversation wali_supervised status
    const { data: convData } = await supabase
      .from('conversations')
      .select('wali_supervised')
      .eq('id', conversationId)
      .single();
    
    const newMessage = {
      conversation_id: conversationId,
      sender_id: userId,
      content: messageInput,
      is_wali_visible: (convData?.wali_supervised || needsWaliSupervision) ?? false
    };
    
    const { error } = await supabase
      .from('messages')
      .insert(newMessage);
      
    if (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setMessageInput('');
    }
  };

  return {
    messages,
    messageInput,
    setMessageInput,
    sendMessage,
    loading
  };
};
