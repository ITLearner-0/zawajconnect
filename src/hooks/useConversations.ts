
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/profile';
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
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            participants,
            wali_supervised,
            messages!messages(
              id,
              content,
              created_at,
              sender_id,
              is_read
            )
          `)
          .contains('participants', [userId])
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Process data to get conversations with last message
        const processedConversations: Conversation[] = [];
        
        for (const conv of data || []) {
          const otherParticipantId = conv.participants.find(p => p !== userId);
          
          // Get other participant's profile details
          if (otherParticipantId) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', otherParticipantId)
                .single();
              
              if (profileError) {
                throw profileError;
              }
              
              // Find the last message
              let lastMessage = null;
              if (conv.messages && conv.messages.length > 0) {
                const sortedMessages = [...conv.messages].sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                lastMessage = sortedMessages[0];
              }
              
              processedConversations.push({
                id: conv.id,
                created_at: conv.created_at,
                participants: conv.participants,
                last_message: lastMessage,
                profile: profileData || undefined,
                wali_supervised: conv.wali_supervised
              });
            } catch (profileError: any) {
              toast({
                title: "Error loading profile",
                description: profileError.message,
                variant: "destructive"
              });
            }
          }
        }
        
        setConversations(processedConversations);
      } catch (err: any) {
        setError(err.message);
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
          throw profileError;
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
