
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useChatRequests } from './wali/useChatRequests';
import { useSupervision } from './wali/useSupervision';
import { useFlaggedContent } from './wali/useFlaggedContent';
import { useWaliStats } from './wali/useWaliStats';
import { useWaliProfile } from './wali/useWaliProfile';

export const useWaliDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the Wali profile
  const {
    waliProfile, 
    updateAvailabilityStatus, 
    isLoadingProfile
  } = useWaliProfile();

  // Get chat requests
  const {
    chatRequests,
    isLoadingRequests,
    handleApproveRequest,
    handleRejectRequest,
    totalPendingRequests
  } = useChatRequests(waliProfile?.id);

  // Get supervised conversations
  const {
    supervisedConversations,
    isLoadingSupervisedConversations,
    joinSupervisedConversation,
    endSupervisedConversation,
    startNewSupervision,
    totalActiveConversations
  } = useSupervision(waliProfile?.id);

  // Get flagged content
  const {
    flaggedContent,
    isLoadingFlaggedContent,
    resolveFlaggedContent,
    totalFlaggedItems
  } = useFlaggedContent(waliProfile?.id);

  // Get stats
  const {
    stats,
    isLoadingStats
  } = useWaliStats(waliProfile?.id, totalPendingRequests, totalActiveConversations, totalFlaggedItems);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    getUserId();
  }, [toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    // User info
    userId,
    isLoading: isLoading || isLoadingProfile || isLoadingRequests || 
               isLoadingSupervisedConversations || isLoadingFlaggedContent || isLoadingStats,
    
    // Wali profile
    waliProfile,
    updateAvailabilityStatus,
    
    // Chat requests
    chatRequests,
    handleApproveRequest,
    handleRejectRequest,
    
    // Supervised conversations
    supervisedConversations,
    joinSupervisedConversation,
    endSupervisedConversation,
    startNewSupervision,
    
    // Flagged content
    flaggedContent,
    resolveFlaggedContent,
    
    // Stats
    stats,
    
    // Auth
    handleSignOut
  };
};
