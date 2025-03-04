
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SupervisionSession } from '@/types/wali';
import { useToast } from '@/hooks/use-toast';

export const useSupervision = (userId: string | null) => {
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
        // Fetch active conversations with supervision
        const { data, error } = await supabase
          .from('supervision_sessions')
          .select(`
            id,
            conversation_id,
            wali_id,
            started_at,
            ended_at,
            is_active,
            supervision_level,
            conversation:conversation_id(
              id,
              participants,
              created_at
            )
          `)
          .eq('wali_id', userId)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching supervisions:', error);
          setError('Failed to load supervision sessions');
          return;
        }

        setActiveConversations(data || []);
      } catch (err: any) {
        console.error('Error fetching supervisions:', err);
        setError(err.message || 'Failed to load supervision sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisions();
  }, [userId, toast]);

  // Start supervision session
  const startSupervision = async (conversationId: string, supervisionLevel: SupervisionSession['supervision_level'] = 'passive') => {
    if (!userId) return false;

    try {
      // Check if there's already an active session
      const { data: existingSession } = await supabase
        .from('supervision_sessions')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('wali_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingSession) {
        toast({
          title: "Already Supervising",
          description: "You are already supervising this conversation",
        });
        return true;
      }

      // Create a new supervision session
      const { error } = await supabase
        .from('supervision_sessions')
        .insert({
          conversation_id: conversationId,
          wali_id: userId,
          started_at: new Date().toISOString(),
          is_active: true,
          supervision_level: supervisionLevel
        });

      if (error) throw error;

      // Create a system message visible only to wali
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: 'system',
          content: 'Wali supervision started',
          created_at: new Date().toISOString(),
          is_read: false,
          is_wali_visible: true
        });

      toast({
        title: "Supervision Started",
        description: "You are now supervising this conversation",
      });

      // Refresh the active conversations
      const { data: updatedData } = await supabase
        .from('supervision_sessions')
        .select(`
          id,
          conversation_id,
          wali_id,
          started_at,
          ended_at,
          is_active,
          supervision_level,
          conversation:conversation_id(
            id,
            participants,
            created_at
          )
        `)
        .eq('wali_id', userId)
        .eq('is_active', true);
        
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
      // First get the conversation_id from the session
      const { data: session, error: sessionError } = await supabase
        .from('supervision_sessions')
        .select('conversation_id')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      const { error } = await supabase
        .from('supervision_sessions')
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('wali_id', userId);

      if (error) throw error;

      // Create a system message visible only to wali
      if (session) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: session.conversation_id,
            sender_id: 'system',
            content: 'Wali supervision ended',
            created_at: new Date().toISOString(),
            is_read: false,
            is_wali_visible: true
          });
      }

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
