import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatRequest } from '@/types/wali';
import { useToast } from '../use-toast';

export const useChatRequests = (waliId: string) => {
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch chat requests
  const fetchChatRequests = useCallback(async () => {
    if (!waliId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First fetch the chat requests
      const { data, error: fetchError } = await supabase
        .from('chat_requests')
        .select('*')
        .eq('wali_id', waliId)
        .order('requested_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Then fetch the requester profiles for each request
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, profile_image')
              .eq('id', request.requester_id)
              .single();

            if (profileError) {
              return {
                ...request,
                requester_profile: {
                  first_name: 'Unknown',
                  last_name: 'User',
                },
              };
            }

            return {
              ...request,
              requester_profile: profileData,
            };
          } catch (err) {
            console.error('Error fetching profile for request:', err);
            return {
              ...request,
              requester_profile: {
                first_name: 'Unknown',
                last_name: 'User',
              },
            };
          }
        })
      );

      setChatRequests(requestsWithProfiles as ChatRequest[]);
    } catch (err: any) {
      console.error('Error fetching chat requests:', err);
      setError(err.message || 'Failed to load chat requests');
    } finally {
      setLoading(false);
    }
  }, [waliId]);

  useEffect(() => {
    fetchChatRequests();

    // Set up real-time subscription
    if (waliId) {
      const channel = supabase
        .channel(`chat_requests_${waliId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_requests',
            filter: `wali_id=eq.${waliId}`,
          },
          () => {
            fetchChatRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [waliId, fetchChatRequests]);

  // Handle chat requests (approve/reject)
  const handleChatRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!waliId) return false;

    try {
      const { error: updateError } = await supabase
        .from('chat_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('wali_id', waliId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setChatRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status, reviewed_at: new Date().toISOString() } : req
        )
      );

      toast({
        title: status === 'approved' ? 'Request Approved' : 'Request Rejected',
        description:
          status === 'approved'
            ? 'The chat request has been approved'
            : 'The chat request has been rejected',
        variant: 'default',
      });

      return true;
    } catch (err: any) {
      console.error('Error handling chat request:', err);

      toast({
        title: 'Action Failed',
        description: err.message || 'Could not process request',
        variant: 'destructive',
      });

      return false;
    }
  };

  // Add notes to a chat request
  const addWaliNote = async (requestId: string, note: string) => {
    if (!waliId) return false;

    try {
      const { error: updateError } = await supabase
        .from('chat_requests')
        .update({ wali_notes: note })
        .eq('id', requestId)
        .eq('wali_id', waliId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setChatRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, wali_notes: note } : req))
      );

      toast({
        title: 'Note Added',
        description: 'Your note has been saved',
        variant: 'default',
      });

      return true;
    } catch (err: any) {
      console.error('Error adding note to chat request:', err);

      toast({
        title: 'Note Update Failed',
        description: err.message || 'Could not save your note',
        variant: 'destructive',
      });

      return false;
    }
  };

  return {
    chatRequests,
    loading,
    error,
    handleChatRequest,
    addWaliNote,
    refreshChatRequests: fetchChatRequests,
  };
};
