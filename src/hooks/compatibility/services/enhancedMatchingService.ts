import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters } from "../types/matchingTypes";
import { PaginatedResult, PaginationOptions } from "../types/paginationTypes";
import { backgroundProcessingService } from "./backgroundProcessingService";
import { cacheService } from "./cacheService";
import { paginationService } from "./paginationService";
import { logInfo, logError, logWarning } from "./loggingService";
import { findCompatibilityMatches } from "./matchingService";

export class EnhancedMatchingService {
  // Find matches with pagination support
  async findMatchesWithPagination(
    userId: string,
    filters?: MatchingFilters
  ): Promise<PaginatedResult<CompatibilityMatch>> {
    try {
      logInfo('enhancedMatching', `Finding paginated matches for user: ${userId}`, { filters });

      // Get all matches first (this could be optimized to fetch only what's needed)
      const allMatches = await this.findMatchesWithBackgroundProcessing(
        userId,
        { ...filters, pagination: undefined }, // Remove pagination for full fetch
        true
      );

      // Apply pagination
      const paginationOptions = filters?.pagination || { limit: 20 };
      const paginatedResult = paginationService.paginateMatches(allMatches, paginationOptions);

      logInfo('enhancedMatching', 'Paginated matches result', {
        totalMatches: allMatches.length,
        pageSize: paginatedResult.data.length,
        hasMore: paginatedResult.hasMore
      });

      return paginatedResult;
    } catch (error) {
      logError('enhancedMatching', error as Error, { userId });
      return {
        data: [],
        hasMore: false,
        totalCount: 0
      };
    }
  }

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
      const limitedFilters = { ...filters, limit: filters?.pagination?.limit || 50 };
      return await findCompatibilityMatches(userId, limitedFilters);

    } catch (error) {
      logError('enhancedMatching', error as Error, { userId });
      // Fallback to regular matching on error
      return await findCompatibilityMatches(userId, filters);
    }
  }

  // Load more matches (for pagination)
  async loadMoreMatches(
    userId: string,
    existingMatches: CompatibilityMatch[],
    paginationOptions: PaginationOptions,
    filters?: MatchingFilters
  ): Promise<PaginatedResult<CompatibilityMatch>> {
    try {
      const filtersWithPagination = {
        ...filters,
        pagination: paginationOptions
      };

      const paginatedResult = await this.findMatchesWithPagination(userId, filtersWithPagination);
      
      // Merge with existing matches
      const mergedMatches = paginationService.mergeResults(existingMatches, paginatedResult.data);
      
      return {
        ...paginatedResult,
        data: mergedMatches
      };
    } catch (error) {
      logError('enhancedMatching', error as Error, { userId });
      return {
        data: existingMatches,
        hasMore: false,
        totalCount: existingMatches.length
      };
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
