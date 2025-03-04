
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliProfile, ChatRequest, SupervisionSession, WaliDashboardStats } from '@/types/wali';
import { Message } from '@/types/profile';
import { setupModerationTables } from '@/utils/databaseUtils';
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
        // Ensure tables exist
        await setupModerationTables();

        // Initialize empty profile structure if it doesn't exist
        const upsertProfile = async () => {
          const { data, error } = await supabase
            .from('wali_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (error && error.code !== 'PGRST116') {
            console.error('Error checking wali profile:', error);
            return null;
          }
          
          // If no profile exists, create a basic one
          if (!data) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', userId)
              .single();
              
            const defaultProfile = {
              user_id: userId,
              first_name: userData?.first_name || 'New',
              last_name: userData?.last_name || 'Wali',
              relationship: 'self',
              contact_information: '',
              is_verified: false,
              availability_status: 'offline' as const,
              last_active: new Date().toISOString(),
              managed_users: []
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('wali_profiles')
              .insert(defaultProfile)
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating wali profile:', insertError);
              return null;
            }
            
            return insertedProfile as WaliProfile;
          }
          
          return data as WaliProfile;
        };
        
        // Get or create wali profile
        const profileData = await upsertProfile();
        if (profileData) {
          setWaliProfile(profileData);
        }

        // Fetch pending chat requests
        const { data: requestsData, error: requestsError } = await supabase
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

        if (requestsError) {
          console.error('Error fetching chat requests:', requestsError);
        } else {
          // Transform data to match ChatRequest type
          const transformedRequests: ChatRequest[] = requestsData.map((req: any) => ({
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
        }

        // Fetch active conversations with supervision
        const { data: supervisionsData, error: supervisionsError } = await supabase
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

        if (supervisionsError) {
          console.error('Error fetching supervisions:', supervisionsError);
        } else {
          setActiveConversations(supervisionsData || []);
        }

        // Fetch flagged content
        const { data: flaggedData, error: flaggedError } = await supabase
          .from('content_flags')
          .select('*')
          .eq('resolved', false)
          .order('created_at', { ascending: false });

        if (flaggedError) {
          console.error('Error fetching flagged content:', flaggedError);
        } else {
          setFlaggedContent(flaggedData || []);
        }

        // Update statistics
        setStatistics({
          pendingRequests: (chatRequests || []).filter(r => r.status === 'pending').length,
          activeConversations: (supervisionsData || []).length,
          flaggedMessages: (flaggedData || []).length,
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
