
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatRequest } from '@/types/wali';
import { useToast } from '@/hooks/use-toast';

export const useChatRequests = (userId: string | null) => {
  const { toast } = useToast();
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRequests = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);

      try {
        // Fetch pending chat requests
        const { data, error } = await supabase
          .from('chat_requests')
          .select(`
            id,
            requester_id,
            recipient_id,
            wali_id,
            status,
            requested_at,
            reviewed_at,
            wali_notes,
            requester:requester_id(
              first_name,
              last_name
            )
          `)
          .eq('wali_id', userId)
          .order('requested_at', { ascending: false });

        if (error) {
          console.error('Error fetching chat requests:', error);
          setError('Failed to load chat requests');
          return;
        }

        // Transform data to match ChatRequest type
        const transformedRequests: ChatRequest[] = data.map((req: any) => ({
          id: req.id,
          requester_id: req.requester_id,
          recipient_id: req.recipient_id,
          wali_id: req.wali_id,
          status: req.status,
          requested_at: req.requested_at,
          reviewed_at: req.reviewed_at,
          wali_notes: req.wali_notes,
          requester_profile: req.requester ? {
            first_name: req.requester.first_name,
            last_name: req.requester.last_name
          } : undefined
        }));
        
        setChatRequests(transformedRequests);
      } catch (err: any) {
        console.error('Error fetching chat requests:', err);
        setError(err.message || 'Failed to load chat requests');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRequests();
  }, [userId, toast]);

  // Handle chat request (approve/reject)
  const handleChatRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ 
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setChatRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status, reviewed_at: new Date().toISOString() } : req
        )
      );

      // If approved, create the conversation
      if (status === 'approved') {
        const request = chatRequests.find(r => r.id === requestId);
        
        if (request) {
          // Check if conversation already exists
          const { data: existingConversation } = await supabase
            .from('conversations')
            .select('id')
            .contains('participants', [request.requester_id, request.recipient_id])
            .maybeSingle();

          if (!existingConversation) {
            // Create a new conversation
            const { data: newConversation, error: conversationError } = await supabase
              .from('conversations')
              .insert({
                participants: [request.requester_id, request.recipient_id],
                created_at: new Date().toISOString(),
                wali_supervised: true
              })
              .select('id')
              .single();

            if (conversationError) throw conversationError;

            // Create a system message
            if (newConversation) {
              await supabase
                .from('messages')
                .insert({
                  conversation_id: newConversation.id,
                  sender_id: 'system',
                  content: 'Conversation approved by wali',
                  created_at: new Date().toISOString(),
                  is_read: true,
                  is_wali_visible: true
                });
            }
          }
        }
      }

      toast({
        title: status === 'approved' ? "Request Approved" : "Request Rejected",
        description: status === 'approved' 
          ? "The conversation request has been approved" 
          : "The conversation request has been rejected",
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to process request",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add wali note to a chat request
  const addWaliNote = async (requestId: string, note: string) => {
    if (!userId || !note.trim()) return false;

    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ wali_notes: note })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setChatRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, wali_notes: note } : req
        )
      );

      toast({
        title: "Note Added",
        description: "Your note has been saved",
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add note",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    chatRequests,
    loading,
    error,
    handleChatRequest,
    addWaliNote
  };
};
