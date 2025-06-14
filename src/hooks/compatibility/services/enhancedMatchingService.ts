
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters } from "../types/matchingTypes";
import { backgroundProcessingService } from "./backgroundProcessingService";
import { cacheService } from "./cacheService";
import { logInfo, logError, logWarning } from "./loggingService";
import { findCompatibilityMatches } from "./matchingService";

export class EnhancedMatchingService {
  // Find matches with background processing support
  async findMatchesWithBackgroundProcessing(
    userId: string,
    filters?: MatchingFilters,
    useBackground = true
  ): Promise<CompatibilityMatch[]> {
    try {
      logInfo('enhancedMatching', `Finding matches for user: ${userId}`, { useBackground, filters });

      // Check for cached popular matches first
      const popularMatchesKey = `popular_matches_${userId}`;
      const cachedPopularMatches = cacheService.get(popularMatchesKey);
      
      if (cachedPopularMatches && !filters) {
        logInfo('enhancedMatching', 'Returning cached popular matches', { userId });
        return cachedPopularMatches as CompatibilityMatch[];
      }

      // If we want immediate results, use the regular matching service
      if (!useBackground) {
        return await findCompatibilityMatches(userId, filters);
      }

      // Queue background calculation for future requests
      await backgroundProcessingService.queueCompatibilityCalculation(
        userId,
        { batchSize: 30 },
        'medium'
      );

      // Also queue popular matches calculation if not cached
      if (!cachedPopularMatches) {
        await backgroundProcessingService.queuePopularMatchesCalculation(userId, 'low');
      }

      // For now, return regular matches but with smaller batch to be faster
      const limitedFilters = { ...filters, limit: 10 };
      return await findCompatibilityMatches(userId, limitedFilters);

    } catch (error) {
      logError('enhancedMatching', error as Error, { userId });
      // Fallback to regular matching on error
      return await findCompatibilityMatches(userId, filters);
    }
  }

  // Pre-calculate matches for active users
  async preCalculatePopularMatches(userIds: string[]): Promise<void> {
    try {
      logInfo('enhancedMatching', `Pre-calculating matches for ${userIds.length} users`);

      for (const userId of userIds) {
        await backgroundProcessingService.queuePopularMatchesCalculation(userId, 'low');
      }

      logInfo('enhancedMatching', 'Queued all pre-calculation tasks');
    } catch (error) {
      logError('enhancedMatching', error as Error);
    }
  }

  // Get cached matches if available
  async getCachedMatches(userId: string): Promise<CompatibilityMatch[] | null> {
    const cacheKey = `popular_matches_${userId}`;
    const cached = cacheService.get(cacheKey);
    
    if (cached) {
      logInfo('enhancedMatching', 'Retrieved cached matches', { userId });
      return cached as CompatibilityMatch[];
    }

    return null;
  }

  // Force refresh matches using background processing
  async refreshMatches(userId: string, priority: 'low' | 'medium' | 'high' = 'high'): Promise<void> {
    try {
      // Clear existing cache
      const cacheKey = `popular_matches_${userId}`;
      cacheService.delete(cacheKey);

      // Queue new calculation with high priority
      await backgroundProcessingService.queueCompatibilityCalculation(
        userId,
        { batchSize: 50, skipCache: false },
        priority
      );

      await backgroundProcessingService.queuePopularMatchesCalculation(userId, priority);

      logInfo('enhancedMatching', 'Queued match refresh', { userId, priority });
    } catch (error) {
      logError('enhancedMatching', error as Error, { userId });
    }
  }

  // Get processing status
  getProcessingStatus() {
    return backgroundProcessingService.getQueueStatus();
  }

  // Clean up completed background tasks
  cleanupCompletedTasks(): void {
    backgroundProcessingService.clearCompletedTasks();
  }
}

export const enhancedMatchingService = new EnhancedMatchingService();
