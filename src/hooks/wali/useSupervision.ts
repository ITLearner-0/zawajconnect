
import { useState, useEffect } from 'react';
import { SupervisionSession } from '@/types/wali';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchActiveSupervisions, 
  createSupervisionSession, 
  endSupervisionSession,
  refreshSupervisions
} from './services/supervisionService';
import { UseSupervisionReturn } from './types/supervisionTypes';

export const useSupervision = (userId: string | null): UseSupervisionReturn => {
  const { toast } = useToast();
  const [activeConversations, setActiveConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupervisions = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);

      try {
        const data = await fetchActiveSupervisions(userId);
        setActiveConversations(data);
      } catch (err: any) {
        console.error('Error fetching supervisions:', err);
        setError(err.message || 'Failed to load supervision sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisions();
  }, [userId]);

  // Start supervision session
  const startSupervision = async (conversationId: string, supervisionLevel: SupervisionSession['supervision_level'] = 'passive') => {
    if (!userId) return false;

    try {
      const result = await createSupervisionSession(userId, conversationId, supervisionLevel);

      if (result.exists) {
        toast({
          title: "Already Supervising",
          description: "You are already supervising this conversation",
        });
        return true;
      }

      toast({
        title: "Supervision Started",
        description: "You are now supervising this conversation",
      });

      // Refresh the active conversations
      const updatedData = await refreshSupervisions(userId);
      if (updatedData) {
        setActiveConversations(updatedData);
      }

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to start supervision",
        variant: "destructive"
      });
      return false;
    }
  };

  // End supervision session
  const endSupervision = async (sessionId: string) => {
    if (!userId) return false;

    try {
      await endSupervisionSession(userId, sessionId);

      // Update local state
      setActiveConversations(prev => prev.filter(session => session.id !== sessionId));

      toast({
        title: "Supervision Ended",
        description: "You are no longer supervising this conversation",
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to end supervision",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    activeConversations,
    loading,
    error,
    startSupervision,
    endSupervision
  };
};
