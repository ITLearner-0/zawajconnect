
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useConversations = (userId: string | null) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all conversations for the current user
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching conversations for user:', userId);
        
        // First, get conversations without trying to join messages
        const { data: conversationsData, error: convError } = await supabase
          .from('conversations')
          .select('id, created_at, participants, wali_supervised')
          .contains('participants', [userId])
          .order('created_at', { ascending: false});

        if (convError) {
          throw convError;
        }

        console.log('Found conversations:', conversationsData?.length || 0);

        // Process conversations and get profile data for each
        const processedConversations: Conversation[] = [];
        
        if (conversationsData && conversationsData.length > 0) {
          for (const conv of conversationsData) {
            const otherParticipantId = (conv as any).participants.find((p: any) => p !== userId);
            
            if (otherParticipantId) {
              try {
                // Get other participant's profile details
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('first_name, last_name, profile_picture')
                  .eq('id', otherParticipantId)
                  .single();
                
                if (profileError) {
                  console.warn('Profile not found for participant:', otherParticipantId);
                }
                
                // Get the most recent message for this conversation
                const { data: messagesData, error: msgError } = await supabase
                  .from('messages')
                  .select('id, content, created_at, sender_id, is_read, match_id, is_wali_visible')
                  .eq('match_id', (conv as any).id)
                  .order('created_at', { ascending: false })
                  .limit(1);
                
                if (msgError) {
                  console.warn('Messages fetch error for conversation:', (conv as any).id, msgError);
                }
                
                // Create properly typed Message object
                const lastMessage: Message | undefined = messagesData && messagesData.length > 0 ? {
                  id: (messagesData[0] as any).id,
                  content: (messagesData[0] as any).content,
                  created_at: (messagesData[0] as any).created_at,
                  sender_id: (messagesData[0] as any).sender_id,
                  is_read: (messagesData[0] as any).is_read,
                  conversation_id: (messagesData[0] as any).match_id,
                  is_wali_visible: (messagesData[0] as any).is_wali_visible
                } : undefined;
                
                processedConversations.push({
                  id: (conv as any).id,
                  created_at: (conv as any).created_at,
                  participants: (conv as any).participants,
                  last_message: lastMessage,
                  profile: profileData as any,
                  wali_supervised: (conv as any).wali_supervised
                });
              } catch (profileError: any) {
                console.warn('Error loading profile for conversation:', (conv as any).id, profileError);
                
                // Still add the conversation even if profile loading fails
                processedConversations.push({
                  id: (conv as any).id,
                  created_at: (conv as any).created_at,
                  participants: (conv as any).participants,
                  last_message: undefined,
                  profile: undefined,
                  wali_supervised: (conv as any).wali_supervised
                });
              }
            }
          }
        }
        
        console.log('Processed conversations:', processedConversations.length);
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
    
    console.log('Loading current conversation:', conversationId);
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
        console.error('Conversation not found:', convError);
        throw new Error('Conversation not found');
      }

      console.log('Found conversation:', convData);

      // Set current conversation
      const otherParticipantId = (convData as any).participants.find((p: any) => p !== userId);
      if (otherParticipantId) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, profile_picture')
          .eq('id', otherParticipantId)
          .single();
          
        if (profileError) {
          console.warn('Profile not found for participant:', otherParticipantId);
        }
        
        const conversation = {
          id: (convData as any).id,
          created_at: (convData as any).created_at,
          participants: (convData as any).participants,
          profile: profileData as any,
          wali_supervised: (convData as any).wali_supervised
        };
        
        console.log('Setting current conversation:', conversation);
        setCurrentConversation(conversation as any);
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
