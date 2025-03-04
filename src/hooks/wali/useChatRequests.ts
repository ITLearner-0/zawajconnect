
import { useState, useEffect } from 'react';
import { ChatRequest } from '@/types/wali';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchChatRequests, 
  updateChatRequestStatus, 
  createConversationForRequest,
  updateChatRequestNote 
} from './services/chatRequestService';
import { UseChatRequestsReturn } from './types/chatRequestTypes';

export const useChatRequests = (userId: string | null): UseChatRequestsReturn => {
  const { toast } = useToast();
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChatRequests = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);

      try {
        const requests = await fetchChatRequests(userId);
        setChatRequests(requests);
      } catch (err: any) {
        console.error('Error fetching chat requests:', err);
        setError(err.message || 'Failed to load chat requests');
      } finally {
        setLoading(false);
      }
    };

    loadChatRequests();
  }, [userId, toast]);

  // Handle chat request (approve/reject)
  const handleChatRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!userId) return false;

    try {
      await updateChatRequestStatus(requestId, status);

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
          await createConversationForRequest(request);
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
      await updateChatRequestNote(requestId, note);

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
