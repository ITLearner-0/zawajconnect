
import { useState, useEffect } from 'react';
import { useWaliProfile } from './wali/useWaliProfile';
import { useChatRequests } from './wali/useChatRequests';
import { useSupervision } from './wali/useSupervision';
import { useFlaggedContent } from './wali/useFlaggedContent';
import { useWaliStats } from './wali/useWaliStats';
import { WaliProfile } from '@/types/wali';

export const useWaliDashboard = () => {
  const userId = ''; // This will be replaced with actual user ID
  
  // Get wali profile data
  const { 
    waliProfile, 
    loading: isLoading, 
    updateAvailability: updateAvailabilityStatus,
    error: profileError 
  } = useWaliProfile();
  
  // Get chat requests data
  const { 
    chatRequests, 
    loading: isLoadingRequests,
    handleChatRequest,
    addWaliNote,
    error: requestsError 
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
    error: conversationsError 
  } = useSupervision(userId);
  
  // Get flagged content
  const { 
    flaggedContent, 
    loading: isLoadingFlaggedContent,
    resolveFlaggedContent,
    error: flaggedContentError 
  } = useFlaggedContent(userId);
  
  // Get wali statistics
  const { 
    waliStats: statistics, 
    loading: isLoadingStats,
    error: statsError 
  } = useWaliStats(userId);
  
  // Compute totals
  const totalPendingRequests = chatRequests.filter(req => req.status === 'pending').length;
  const totalActiveConversations = activeConversations.length;
  const totalFlaggedItems = flaggedContent.length;
  
  // Sign out function
  const handleSignOut = async () => {
    // Implementation here
    return true;
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
    statistics,
    
    // Sign out
    handleSignOut,
    
    // Error states
    error: profileError || requestsError || conversationsError || flaggedContentError || statsError
  };
};
