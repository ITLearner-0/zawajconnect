
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliProfile, ChatRequest, SupervisionSession, WaliNotification, WaliDashboardStats, Message } from '@/types/wali';
import { tableExists } from '@/utils/databaseUtils';
import { useToast } from '@/hooks/use-toast';

export const useWaliDashboard = () => {
  const { toast } = useToast();
  const [waliProfile, setWaliProfile] = useState<WaliProfile | null>(null);
  const [statistics, setStatistics] = useState<WaliDashboardStats>({
    pendingRequests: 0,
    activeConversations: 0,
    flaggedMessages: 0,
    totalSupervised: 0
  });
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [activeConversations, setActiveConversations] = useState<any[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data && data.session) {
        setUserId(data.session.user.id);
      }
    };
    
    getUserId();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch wali profile and data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);

      try {
        // Check if wali_profiles table exists
        const waliProfilesTableExists = await tableExists('wali_profiles');
        
        if (!waliProfilesTableExists) {
          toast({
            title: "Setup Required",
            description: "Wali profiles table doesn't exist yet. Setting up...",
          });
          
          // We'll assume the tables are created by the databaseUtils functions
          setError("Database setup required. Please contact administrator.");
          setLoading(false);
          return;
        }

        // Fetch wali profile for the current user
        const { data: profileData, error: profileError } = await supabase
          .from('wali_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile not found
            setWaliProfile(null);
          } else {
            throw profileError;
          }
        } else if (profileData) {
          setWaliProfile(profileData as WaliProfile);
        }

        // Fetch pending chat requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('chat_requests')
          .select(`
            *,
            requester_profile:profiles!chat_requests_requester_id_fkey(
              first_name,
              last_name,
              profile_image
            )
          `)
          .eq('wali_id', userId);

        if (requestsError) throw requestsError;
        setChatRequests(requestsData || []);

        // Fetch active conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select(`
            *,
            supervision_sessions!inner(
              id,
              wali_id,
              started_at,
              ended_at,
              is_active
            ),
            messages(count)
          `)
          .eq('supervision_sessions.wali_id', userId)
          .eq('supervision_sessions.is_active', true);

        if (conversationsError) throw conversationsError;
        setActiveConversations(conversationsData || []);

        // Fetch flagged content
        const { data: flaggedData, error: flaggedError } = await supabase
          .from('content_flags')
          .select('*')
          .eq('resolved', false)
          .order('created_at', { ascending: false });

        if (flaggedError) throw flaggedError;
        setFlaggedContent(flaggedData || []);

        // Update statistics
        setStatistics({
          pendingRequests: chatRequests.filter(r => r.status === 'pending').length,
          activeConversations: activeConversations.length,
          flaggedMessages: flaggedContent.length,
          totalSupervised: profileData?.managed_users?.length || 0
        });

      } catch (err: any) {
        console.error('Error fetching wali dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, toast]);

  // Update availability status
  const updateAvailability = async (status: WaliProfile['availability_status']) => {
    if (!userId || !waliProfile) {
      toast({
        title: "Error",
        description: "Unable to update status: Wali profile not loaded",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('wali_profiles')
        .update({ 
          availability_status: status,
          last_active: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setWaliProfile({
        ...waliProfile,
        availability_status: status,
        last_active: new Date().toISOString()
      });

      toast({
        title: "Status Updated",
        description: `Your status is now ${status}`,
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive"
      });
      return false;
    }
  };

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

  // Start supervision session
  const startSupervision = async (conversationId: string) => {
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
          supervision_level: 'passive'
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
      const { data, error } = await supabase
        .from('supervision_sessions')
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('wali_id', userId)
        .select('conversation_id')
        .single();

      if (error) throw error;

      // Create a system message visible only to wali
      if (data) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: data.conversation_id,
            sender_id: 'system',
            content: 'Wali supervision ended',
            created_at: new Date().toISOString(),
            is_read: false,
            is_wali_visible: true
          });
      }

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
    waliProfile,
    statistics,
    chatRequests,
    activeConversations,
    flaggedContent,
    loading,
    updateAvailability,
    handleChatRequest,
    startSupervision,
    endSupervision,
    addWaliNote,
    error
  };
};
