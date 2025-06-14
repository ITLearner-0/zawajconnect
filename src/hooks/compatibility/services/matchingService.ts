
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters } from "../types/matchingTypes";
import { userResultsService } from "./userResultsService";
import { profileService } from "./profileService";
import { combineUserDataWithProfiles } from "./dataProcessingService";
import { processMatches, finalizePipeline } from "./matchProcessingService";
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
  filters?: MatchingFilters
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
    const usersWithProfiles = combineUserDataWithProfiles(otherUsers, profiles);

    // Step 5: Apply filters and calculate scores with validated data
    const matches = processMatches(myResults, usersWithProfiles, userId, filters);

    // Step 6: Finalize and return results
    return finalizePipeline(matches, userId);

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
