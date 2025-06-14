
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters } from "../types/matchingTypes";
import { EnhancedMatchingFilters } from "../types/advancedFilterTypes";
import { userResultsService } from "./userResultsService";
import { profileService } from "./profileService";
import { combineUserDataWithProfiles } from "./dataProcessingService";
import { processMatches, finalizePipeline } from "./matchProcessingService";
import { advancedFiltersService } from "./advancedFiltersService";
import { 
  CompatibilityServiceError, 
  UserNotFoundError, 
  DatabaseConnectionError, 
  NoMatchesFoundError 
} from "./errorHandling";
import { logError, logInfo } from "./loggingService";

// Export cache management functions for external use
export { cacheService as compatibilityCache } from "./cacheService";

export async function findCompatibilityMatches(
  userId: string,
  filters?: MatchingFilters | EnhancedMatchingFilters
): Promise<CompatibilityMatch[]> {
  try {
    logInfo('findCompatibilityMatches', `Starting match search for user: ${userId}`, { filters });

    // Step 1: Get current user's compatibility results with validation
    const myResults = await userResultsService.fetchUserResults(userId);

    // Step 2: Get other users' compatibility results with validation
    const otherUsers = await userResultsService.fetchOtherUsers(userId);
    if (otherUsers.length === 0) {
      return [];
    }

    // Step 3: Get profiles with validation
    const userIds = otherUsers.map(user => user.user_id);
    const profiles = await profileService.fetchProfiles(userIds);
    if (profiles.length === 0) {
      return [];
    }

    // Step 4: Combine data with type safety
    let usersWithProfiles = combineUserDataWithProfiles(otherUsers, profiles);

    // Step 5: Apply basic filters and calculate scores with validated data
    const matches = processMatches(myResults, usersWithProfiles, userId, filters);

    // Step 6: Apply advanced filters if present
    let finalMatches = matches;
    if (filters && 'advanced' in filters && filters.advanced) {
      const { filteredUsers, filteredMatches } = advancedFiltersService.applyAdvancedFilters(
        usersWithProfiles,
        matches,
        filters.advanced
      );
      
      usersWithProfiles = filteredUsers;
      finalMatches = filteredMatches;
      
      logInfo('findCompatibilityMatches', `Advanced filters applied`, {
        originalMatches: matches.length,
        filteredMatches: finalMatches.length,
        filterSummary: advancedFiltersService.getFilterSummary(filters.advanced)
      });
    }

    // Step 7: Finalize and return results
    return finalizePipeline(finalMatches, userId);

  } catch (error) {
    if (error instanceof CompatibilityServiceError) {
      logError('findCompatibilityMatches', error, { userId, filters });
      throw error;
    }
    
    const serviceError = new CompatibilityServiceError(
      'Une erreur inattendue s\'est produite lors de la recherche de correspondances',
      'UNEXPECTED_ERROR',
      error as Error
    );
    
    logError('findCompatibilityMatches', serviceError, { userId, filters });
    throw serviceError;
  }
}

// Re-export error types for external use
export {
  CompatibilityServiceError,
  UserNotFoundError,
  DatabaseConnectionError,
  NoMatchesFoundError
} from "./errorHandling";

// Re-export enhanced matching service
export { enhancedMatchingService } from "./enhancedMatchingService";
export { backgroundProcessingService } from "./backgroundProcessingService";
