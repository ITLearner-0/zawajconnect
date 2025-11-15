import { useState, useEffect } from 'react';
import { useWaliProfile } from './wali/useWaliProfile';
import { useChatRequests } from './wali/useChatRequests';
import { useSupervision } from './wali/useSupervision';
import { useFlaggedContent } from './wali/useFlaggedContent';
import { useWaliStats } from './wali/useWaliStats';
import { SupervisedConversation, WaliProfile } from '@/types/wali';
import { supabase } from '@/integrations/supabase/client';

export const useWaliDashboard = () => {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const getUserId = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Error getting user session:', error);
      }
    };

    getUserId();
  }, []);

  // Get wali profile data
  const {
    waliProfile,
    loading: isLoading,
    updateAvailability: updateAvailabilityStatus,
    error: profileError,
  } = useWaliProfile(userId);

  // Get chat requests data
  const {
    chatRequests,
    loading: isLoadingRequests,
    handleChatRequest,
    addWaliNote,
    error: requestsError,
  } = useChatRequests(userId);

  // Helper methods for chat requests
  const handleApproveRequest = (requestId: string) => handleChatRequest(requestId, 'approved');
  const handleRejectRequest = (requestId: string) => handleChatRequest(requestId, 'rejected');

  // Get active conversations data
  const {
    activeConversations,
    loading: isLoadingSupervisedConversations,
    startSupervision,
    endSupervision,
    error: conversationsError,
  } = useSupervision(userId);

  // Get flagged content
  const {
    flaggedContent,
    loading: isLoadingFlaggedContent,
    resolveFlaggedContent,
    error: flaggedContentError,
  } = useFlaggedContent(userId);

  // Compute totals
  const totalPendingRequests = chatRequests.filter((req) => req.status === 'pending').length;
  const totalActiveConversations = activeConversations.length;
  const totalFlaggedItems = flaggedContent.length;

  // Get wali statistics
  const {
    stats,
    loading: isLoadingStats,
    error: statsError,
  } = useWaliStats(userId, totalPendingRequests, totalActiveConversations, totalFlaggedItems);

  // Sign out function
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return !error;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  return {
    // User info
    userId,

    // Loading states
    isLoading,

    // Profile data
    waliProfile,
    updateAvailabilityStatus,

    // Chat requests
    chatRequests,
    handleApproveRequest,
    handleRejectRequest,
    totalPendingRequests,
    addWaliNote,

    // Supervised conversations
    activeConversations,
    startSupervision,
    endSupervision,
    totalActiveConversations,

    // Flagged content
    flaggedContent,
    resolveFlaggedContent,
    totalFlaggedItems,

    // Statistics
    statistics: stats,

    // Sign out
    handleSignOut,

    // Error states
    error: profileError || requestsError || conversationsError || flaggedContentError || statsError,
  };
};
