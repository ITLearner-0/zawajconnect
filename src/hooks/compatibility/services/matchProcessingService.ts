
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters, UserResultWithProfile } from "../types/matchingTypes";
import { ValidatedUserResults } from "./dataFetchingService";
import { matchingFiltersService } from "./matchingFiltersService";
import { compatibilityCalculator } from "./compatibilityCalculator";
import { cacheService } from "./cacheService";
import { logError, logInfo } from "./loggingService";

export function processMatches(
  myResults: ValidatedUserResults,
  usersWithProfiles: UserResultWithProfile[],
  myUserId: string,
  filters?: MatchingFilters
): CompatibilityMatch[] {
  try {
    const filteredUsers = matchingFiltersService.filterUsers(usersWithProfiles, filters);

    // Calculate compatibility scores
    const matches = filteredUsers
      .map(user => {
        try {
          return compatibilityCalculator.calculateCompatibilityScore(myResults, user);
        } catch (error) {
          logError('calculateCompatibilityScore', error as Error, { userId: user.user_id });
          return null;
        }
      })
      .filter((match): match is CompatibilityMatch => match !== null)
      .filter(match => (match.score ?? match.compatibilityScore ?? 0) >= (filters?.minCompatibilityScore || 50))
      .sort((a, b) => (b.score ?? b.compatibilityScore ?? 0) - (a.score ?? a.compatibilityScore ?? 0));

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
  const cacheStats = cacheService.getCacheStats();
  logInfo('cacheStatistics', 'Current cache state', cacheStats);
  
  logInfo('findCompatibilityMatches', `Returning ${finalMatches.length} matches for user: ${userId}`);
  
  return finalMatches;
}
