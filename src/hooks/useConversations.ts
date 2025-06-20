
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useConversations = (userId: string | null) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all conversations for the current user
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, get conversations without trying to join messages
        const { data: conversationsData, error: convError } = await supabase
          .from('conversations')
          .select('id, created_at, participants, wali_supervised')
          .contains('participants', [userId])
          .order('created_at', { ascending: false });

        if (convError) {
          throw convError;
        }

        // Process conversations and get profile data for each
        const processedConversations: Conversation[] = [];
        
        for (const conv of conversationsData || []) {
          const otherParticipantId = conv.participants.find(p => p !== userId);
          
          if (otherParticipantId) {
            try {
              // Get other participant's profile details
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', otherParticipantId)
                .single();
              
              if (profileError) {
                console.warn('Profile not found for participant:', otherParticipantId);
              }
              
              // Get the most recent message for this conversation
              const { data: messagesData, error: msgError } = await supabase
                .from('messages')
                .select('id, content, created_at, sender_id, is_read, conversation_id, is_wali_visible')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1);
              
              if (msgError) {
                console.warn('Messages fetch error for conversation:', conv.id, msgError);
              }
              
              // Create properly typed Message object
              const lastMessage: Message | undefined = messagesData && messagesData.length > 0 ? {
                id: messagesData[0].id,
                content: messagesData[0].content,
                created_at: messagesData[0].created_at,
                sender_id: messagesData[0].sender_id,
                is_read: messagesData[0].is_read,
                conversation_id: messagesData[0].conversation_id,
                is_wali_visible: messagesData[0].is_wali_visible
              } : undefined;
              
              processedConversations.push({
                id: conv.id,
                created_at: conv.created_at,
                participants: conv.participants,
                last_message: lastMessage,
                profile: profileData || undefined,
                wali_supervised: conv.wali_supervised
              });
            } catch (profileError: any) {
              console.warn('Error loading profile for conversation:', conv.id, profileError);
              
              // Still add the conversation even if profile loading fails
              processedConversations.push({
                id: conv.id,
                created_at: conv.created_at,
                participants: conv.participants,
                last_message: undefined,
                profile: undefined,
                wali_supervised: conv.wali_supervised
              });
            }
          }
        }
        
        setConversations(processedConversations);
      } catch (err: any) {
        setError(err.message);
        console.error('Error loading conversations:', err);
        toast({
          title: "Error loading conversations",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId, toast]);

  // Get current conversation details
  const loadCurrentConversation = async (conversationId: string) => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get conversation details
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) {
        throw convError;
      }

      // Set current conversation
      const otherParticipantId = convData.participants.find(p => p !== userId);
      if (otherParticipantId) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', otherParticipantId)
          .single();
          
        if (profileError) {
          console.warn('Profile not found for participant:', otherParticipantId);
        }
        
        const conversation = {
          id: convData.id,
          created_at: convData.created_at,
          participants: convData.participants,
          profile: profileData || undefined,
          wali_supervised: convData.wali_supervised
        };
        
        setCurrentConversation(conversation);
        return conversation;
      }
      
      return null;
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading conversation:', err);
      toast({
        title: "Error loading conversation",
        description: err.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations,
    currentConversation,
    setCurrentConversation,
    loading,
    error,
    loadCurrentConversation
  };
};
