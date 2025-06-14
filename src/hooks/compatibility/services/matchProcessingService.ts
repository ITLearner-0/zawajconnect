
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters, UserResultWithProfile } from "../types/matchingTypes";
import { applyFilters } from "../utils/matchingFilters";
import { batchMemoizedCompatibilityScores } from "./memoizationService";
import { compatibilityCache } from "./cachingService";
import { logError, logInfo } from "./loggingService";

export function processMatches(
  myResults: { answers: Record<string, any>; preferences: any },
  usersWithProfiles: UserResultWithProfile[],
  myUserId: string,
  filters?: MatchingFilters
): CompatibilityMatch[] {
  try {
    const filteredUsers = usersWithProfiles.filter((user) => {
      try {
        return applyFilters(user, filters);
      } catch (error) {
        logError('applyFilters', error as Error, { userId: user.user_id });
        return false;
      }
    });

    logInfo('applyFilters', `${filteredUsers.length} users passed filters out of ${usersWithProfiles.length}`);

    // Use batch memoized compatibility scoring for better cache utilization
    const matches = batchMemoizedCompatibilityScores(myResults, filteredUsers, myUserId)
      .filter(match => match.score >= (filters?.minCompatibilityScore || 50))
      .sort((a, b) => b.score - a.score);

    logInfo('calculateScores', `Generated ${matches.length} final matches`);
    
    return matches;
  } catch (error) {
    logError('calculateScores', error as Error);
    return [];
  }
}

export function finalizePipeline(matches: CompatibilityMatch[], userId: string): CompatibilityMatch[] {
  const finalMatches = matches.slice(0, 20);
  
  // Log cache statistics
  const cacheStats = compatibilityCache.getCacheStats();
  logInfo('cacheStatistics', 'Current cache state', cacheStats);
  
  logInfo('findCompatibilityMatches', `Returning ${finalMatches.length} matches for user: ${userId}`);
  
  return finalMatches;
}
