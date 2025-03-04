
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliProfile, ChatRequest, WaliDashboardStats, SupervisionSession } from '@/types/wali';
import { Conversation, ContentFlag } from '@/types/profile';
import { tableExists } from '@/utils/databaseUtils';
import { useToast } from './use-toast';

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
  const [activeConversations, setActiveConversations] = useState<(Conversation & { supervision?: SupervisionSession })[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<ContentFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWaliProfile = async () => {
      setLoading(true);
      try {
        // Check for user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setError('No authenticated user found');
          setLoading(false);
          return;
        }

        // Check if wali_profiles table exists
        const waliTableExists = await tableExists('wali_profiles');
        if (!waliTableExists) {
          // Create mock data for development
          const mockWaliProfile: WaliProfile = {
            id: 'mock-wali-id',
            user_id: session.user.id,
            first_name: 'Ahmad',
            last_name: 'Khan',
            relationship: 'Father',
            contact_information: 'ahmad.khan@example.com',
            is_verified: true,
            verification_date: new Date().toISOString(),
            availability_status: 'available',
            last_active: new Date().toISOString(),
            managed_users: ['user1', 'user2'],
            chat_preferences: {
              auto_approve_known_contacts: true,
              notification_level: 'all',
              keyword_alerts: ['dating', 'meet alone', 'address'],
              supervision_level: 'passive'
            }
          };
          
          setWaliProfile(mockWaliProfile);
          
          // Mock statistics
          setStatistics({
            pendingRequests: 3,
            activeConversations: 2,
            flaggedMessages: 5,
            totalSupervised: 10
          });
          
          // Mock chat requests
          setChatRequests([
            {
              id: 'req1',
              requester_id: 'user1',
              recipient_id: 'user2',
              status: 'pending',
              requested_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              requester_profile: {
                first_name: 'Sara',
                last_name: 'Ahmed'
              },
              message: 'I would like to connect with your daughter for marriage purposes',
              wali_id: 'mock-wali-id'
            },
            {
              id: 'req2',
              requester_id: 'user3',
              recipient_id: 'user2',
              status: 'approved',
              requested_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              reviewed_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              requester_profile: {
                first_name: 'Yusuf',
                last_name: 'Ali'
              },
              wali_notes: 'Seems like a good candidate',
              wali_id: 'mock-wali-id'
            },
            {
              id: 'req3',
              requester_id: 'user4',
              recipient_id: 'user2',
              status: 'rejected',
              requested_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
              requester_profile: {
                first_name: 'Ibrahim',
                last_name: 'Khan'
              },
              wali_notes: 'Not suitable at this time',
              wali_id: 'mock-wali-id'
            }
          ]);
          
          // Mock active conversations
          setActiveConversations([
            {
              id: 'conv1',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
              participants: ['user1', 'user2'],
              last_message: {
                id: 'msg1',
                conversation_id: 'conv1',
                sender_id: 'user1',
                content: 'Looking forward to meeting your family',
                created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                is_read: true
              },
              profile: {
                first_name: 'Sara',
                last_name: 'Ahmed'
              },
              wali_supervised: true,
              supervision: {
                id: 'session1',
                conversation_id: 'conv1',
                wali_id: 'mock-wali-id',
                started_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                is_active: true,
                supervision_level: 'passive'
              }
            },
            {
              id: 'conv2',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
              participants: ['user3', 'user2'],
              last_message: {
                id: 'msg2',
                conversation_id: 'conv2',
                sender_id: 'user3',
                content: 'I respect your family values',
                created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                is_read: false
              },
              profile: {
                first_name: 'Yusuf',
                last_name: 'Ali'
              },
              wali_supervised: true
            }
          ]);
          
          // Mock flagged content
          setFlaggedContent([
            {
              id: 'flag1',
              content_id: 'msg10',
              content_type: 'message',
              flag_type: 'religious_violation',
              severity: 'high',
              flagged_by: 'system',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              resolved: false
            },
            {
              id: 'flag2',
              content_id: 'msg11',
              content_type: 'message',
              flag_type: 'inappropriate',
              severity: 'medium',
              flagged_by: 'system',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
              resolved: false
            },
            {
              id: 'flag3',
              content_id: 'msg12',
              content_type: 'message',
              flag_type: 'suspicious',
              severity: 'low',
              flagged_by: 'user',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
              resolved: true,
              resolved_by: 'admin1',
              resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
            }
          ]);
        } else {
          // Fetch actual data from supabase
          const { data, error } = await supabase
            .from('wali_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (error) {
            setError(`Error fetching Wali profile: ${error.message}`);
          } else if (data) {
            setWaliProfile(data as WaliProfile);
            // Fetch actual statistics, chat requests, conversations, and flagged content
            // ... (additional database fetches would go here)
          } else {
            setError('No Wali profile found for this user');
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWaliProfile();
  }, []);
  
  const updateAvailability = async (status: WaliProfile['availability_status']) => {
    try {
      if (waliProfile) {
        // In a real app, update the database
        // For mock implementation, just update the state
        setWaliProfile(prev => prev ? {...prev, availability_status: status} : null);
        
        toast({
          title: "Status Updated",
          description: `Your availability is now set to ${status}`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const handleChatRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      // In a real app, update the database
      // For mock implementation, just update the state
      setChatRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? {...req, status, reviewed_at: new Date().toISOString()} 
            : req
        )
      );
      
      // Update statistics
      setStatistics(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1
      }));
      
      toast({
        title: `Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Chat request has been ${status}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const addWaliNote = async (requestId: string, note: string) => {
    try {
      // In a real app, update the database
      // For mock implementation, just update the state
      setChatRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? {...req, wali_notes: note} 
            : req
        )
      );
      
      toast({
        title: "Note Added",
        description: "Your note has been saved",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const startSupervision = async (conversationId: string, level: SupervisionSession['supervision_level']) => {
    try {
      // In a real app, insert into database
      // For mock implementation, just update the state
      const newSession: SupervisionSession = {
        id: `session-${Date.now()}`,
        conversation_id: conversationId,
        wali_id: waliProfile?.id || 'mock-wali-id',
        started_at: new Date().toISOString(),
        is_active: true,
        supervision_level: level
      };
      
      setActiveConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? {...conv, supervision: newSession} 
            : conv
        )
      );
      
      toast({
        title: "Supervision Started",
        description: `You are now supervising this conversation at ${level} level`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const endSupervision = async (sessionId: string) => {
    try {
      // In a real app, update the database
      // For mock implementation, just update the state
      setActiveConversations(prev => 
        prev.map(conv => 
          conv.supervision?.id === sessionId 
            ? {...conv, supervision: {...conv.supervision, is_active: false, ended_at: new Date().toISOString()}} 
            : conv
        )
      );
      
      toast({
        title: "Supervision Ended",
        description: "You have ended supervision for this conversation",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  return {
    waliProfile,
    statistics,
    chatRequests,
    activeConversations,
    flaggedContent,
    loading,
    error,
    updateAvailability,
    handleChatRequest,
    startSupervision,
    endSupervision,
    addWaliNote
  };
};
