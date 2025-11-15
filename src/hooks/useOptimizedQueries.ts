import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { QueryOptimizer } from '@/utils/database/queryOptimizer';
import { queryCache } from '@/services/caching/queryCache';

/**
 * Hook for using optimized database queries with caching
 */
export const useOptimizedQueries = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const executeQuery = useCallback(
    async <T>(
      queryFn: () => Promise<{ data: T | null; error: any }>,
      cacheKey?: string,
      cacheTTL?: number,
      errorMessage: string = 'Query failed'
    ): Promise<T | null> => {
      // Check cache first
      if (cacheKey) {
        const cachedResult = queryCache.get(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await queryFn();

        if (queryError) {
          console.error('Query error:', queryError);
          setError(queryError.message);
          toast({
            title: 'Query Error',
            description: `${errorMessage}: ${queryError.message}`,
            variant: 'destructive',
          });
          return null;
        }

        // Cache the result
        if (cacheKey && data) {
          queryCache.set(cacheKey, data, cacheTTL);
        }

        return data;
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError(err.message);
        toast({
          title: 'Unexpected Error',
          description: err.message,
          variant: 'destructive',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Optimized profile search
  const searchProfiles = useCallback(
    (filters: Parameters<typeof QueryOptimizer.searchProfiles>[0], limit?: number) => {
      const cacheKey = queryCache.generateKey('profiles', { ...filters, limit });
      return executeQuery(
        () => QueryOptimizer.searchProfiles(filters, limit),
        cacheKey,
        2 * 60 * 1000, // 2 minutes cache
        'Failed to search profiles'
      );
    },
    [executeQuery]
  );

  // Optimized compatibility matches
  const getCompatibilityMatches = useCallback(
    (userId: string, minScore?: number, limit?: number) => {
      const cacheKey = queryCache.generateKey('compatibility', { userId, minScore, limit });
      return executeQuery(
        () => QueryOptimizer.getCompatibilityMatches(userId, minScore, limit),
        cacheKey,
        5 * 60 * 1000, // 5 minutes cache
        'Failed to fetch compatibility matches'
      );
    },
    [executeQuery]
  );

  // Optimized conversation messages
  const getConversationMessages = useCallback(
    (conversationId: string, limit?: number, before?: string) => {
      const cacheKey = queryCache.generateKey('messages', { conversationId, limit, before });
      return executeQuery(
        () => QueryOptimizer.getConversationMessages(conversationId, limit, before),
        cacheKey,
        1 * 60 * 1000, // 1 minute cache for messages
        'Failed to fetch messages'
      );
    },
    [executeQuery]
  );

  // Optimized user conversations
  const getUserConversations = useCallback(
    (userId: string) => {
      const cacheKey = queryCache.generateKey('conversations', { userId });
      return executeQuery(
        () => QueryOptimizer.getUserConversations(userId),
        cacheKey,
        2 * 60 * 1000, // 2 minutes cache
        'Failed to fetch conversations'
      );
    },
    [executeQuery]
  );

  // Optimized unread notifications
  const getUnreadNotifications = useCallback(
    (userId: string, limit?: number) => {
      const cacheKey = queryCache.generateKey('notifications', { userId, limit });
      return executeQuery(
        () => QueryOptimizer.getUnreadNotifications(userId, limit),
        cacheKey,
        30 * 1000, // 30 seconds cache for notifications
        'Failed to fetch notifications'
      );
    },
    [executeQuery]
  );

  // Clear cache for a specific prefix
  const clearCache = useCallback((prefix?: string) => {
    if (prefix) {
      // Clear specific cache entries (simplified implementation)
      queryCache.clear();
    } else {
      queryCache.clear();
    }
  }, []);

  return {
    loading,
    error,
    searchProfiles,
    getCompatibilityMatches,
    getConversationMessages,
    getUserConversations,
    getUnreadNotifications,
    clearCache,
  };
};
