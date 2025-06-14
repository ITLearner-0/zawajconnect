
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import * as optimizedQueries from '@/utils/database/optimizedQueries';

/**
 * Hook for using optimized database queries with proper error handling and loading states
 */
export const useOptimizedQueries = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const executeQuery = useCallback(async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    errorMessage: string = 'Query failed'
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await queryFn();
      
      if (queryError) {
        console.error('Query error:', queryError);
        setError(queryError.message);
        toast({
          title: "Query Error",
          description: `${errorMessage}: ${queryError.message}`,
          variant: "destructive"
        });
        return null;
      }

      return data;
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message);
      toast({
        title: "Unexpected Error",
        description: err.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Compatibility queries
  const getCompatibilityMatches = useCallback((
    userId: string,
    minScore?: number,
    limit?: number
  ) => executeQuery(
    () => optimizedQueries.getCompatibilityMatches(userId, minScore, limit),
    'Failed to fetch compatibility matches'
  ), [executeQuery]);

  // Profile queries
  const getVisibleProfiles = useCallback((
    filters?: Parameters<typeof optimizedQueries.getVisibleProfiles>[0],
    limit?: number
  ) => executeQuery(
    () => optimizedQueries.getVisibleProfiles(filters, limit),
    'Failed to fetch profiles'
  ), [executeQuery]);

  // Message queries
  const getConversationMessages = useCallback((
    conversationId: string,
    limit?: number,
    before?: string
  ) => executeQuery(
    () => optimizedQueries.getConversationMessages(conversationId, limit, before),
    'Failed to fetch messages'
  ), [executeQuery]);

  const getUserConversations = useCallback((
    userId: string
  ) => executeQuery(
    () => optimizedQueries.getUserConversations(userId),
    'Failed to fetch conversations'
  ), [executeQuery]);

  // Notification queries
  const getUnreadNotifications = useCallback((
    userId: string,
    limit?: number
  ) => executeQuery(
    () => optimizedQueries.getUnreadNotifications(userId, limit),
    'Failed to fetch unread notifications'
  ), [executeQuery]);

  const getRecentNotifications = useCallback((
    userId: string,
    limit?: number
  ) => executeQuery(
    () => optimizedQueries.getRecentNotifications(userId, limit),
    'Failed to fetch notifications'
  ), [executeQuery]);

  // Chat request queries
  const getPendingChatRequests = useCallback((
    recipientId: string
  ) => executeQuery(
    () => optimizedQueries.getPendingChatRequests(recipientId),
    'Failed to fetch chat requests'
  ), [executeQuery]);

  const getWaliChatRequests = useCallback((
    waliId: string
  ) => executeQuery(
    () => optimizedQueries.getWaliChatRequests(waliId),
    'Failed to fetch wali chat requests'
  ), [executeQuery]);

  // Content moderation queries
  const getUnresolvedFlags = useCallback((
    limit?: number
  ) => executeQuery(
    () => optimizedQueries.getUnresolvedFlags(limit),
    'Failed to fetch unresolved flags'
  ), [executeQuery]);

  const getFlagsByContentId = useCallback((
    contentId: string
  ) => executeQuery(
    () => optimizedQueries.getFlagsByContentId(contentId),
    'Failed to fetch content flags'
  ), [executeQuery]);

  // Video call queries
  const getConversationVideoCalls = useCallback((
    conversationId: string
  ) => executeQuery(
    () => optimizedQueries.getConversationVideoCalls(conversationId),
    'Failed to fetch video calls'
  ), [executeQuery]);

  const getUserVideoCallHistory = useCallback((
    userId: string,
    limit?: number
  ) => executeQuery(
    () => optimizedQueries.getUserVideoCallHistory(userId, limit),
    'Failed to fetch video call history'
  ), [executeQuery]);

  // Wali queries
  const getVerifiedWalis = useCallback(() => executeQuery(
    () => optimizedQueries.getVerifiedWalis(),
    'Failed to fetch verified walis'
  ), [executeQuery]);

  const getWaliByUserId = useCallback((
    userId: string
  ) => executeQuery(
    () => optimizedQueries.getWaliByUserId(userId),
    'Failed to fetch wali profile'
  ), [executeQuery]);

  return {
    loading,
    error,
    
    // Compatibility
    getCompatibilityMatches,
    
    // Profiles
    getVisibleProfiles,
    
    // Messages
    getConversationMessages,
    getUserConversations,
    
    // Notifications
    getUnreadNotifications,
    getRecentNotifications,
    
    // Chat requests
    getPendingChatRequests,
    getWaliChatRequests,
    
    // Content moderation
    getUnresolvedFlags,
    getFlagsByContentId,
    
    // Video calls
    getConversationVideoCalls,
    getUserVideoCallHistory,
    
    // Wali
    getVerifiedWalis,
    getWaliByUserId
  };
};
