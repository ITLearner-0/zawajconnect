
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
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        const requests = await fetchChatRequests(userId);
        setChatRequests(requests);
      } catch (err: any) {
        console.error('Error fetching chat requests:', err);
        setError(err.message || 'Failed to load chat requests');
        setChatRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadChatRequests();
  }, [userId]);

  // Handle chat request (approve/reject)
  const handleChatRequest = async (requestId: string, status: 'approved' | 'rejected', suggestedTime?: string) => {
    if (!userId) return false;

    try {
      await updateChatRequestStatus(requestId, status, suggestedTime);

      // Update local state
      setChatRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { 
            ...req, 
            status, 
            reviewed_at: new Date().toISOString(),
            suggested_time: suggestedTime || req.suggested_time 
          } : req
        )
      );

      // If approved, create the conversation
      if (status === 'approved') {
        const request = chatRequests.find(r => r.id === requestId);
        
        if (request) {
          await createConversationForRequest(request);
        }
      }

      const message = status === 'approved' 
        ? "Request Approved"
        : suggestedTime 
          ? "Alternative Time Suggested" 
          : "Request Rejected";
          
      const description = status === 'approved'
        ? "The conversation request has been approved"
        : suggestedTime
          ? `You've suggested an alternative time: ${suggestedTime}`
          : "The conversation request has been rejected";

      toast({
        title: message,
        description,
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
