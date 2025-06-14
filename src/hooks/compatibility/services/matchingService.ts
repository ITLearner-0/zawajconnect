import { supabase } from "@/integrations/supabase/client";
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters, UserResultWithProfile } from "../types/matchingTypes";
import { applyFilters } from "../utils/matchingFilters";
import { memoizedCompatibilityScore, batchMemoizedCompatibilityScores } from "./memoizationService";
import { compatibilityCache, logCacheOperation } from "./cachingService";

// Custom error types for better error handling
export class CompatibilityServiceError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'CompatibilityServiceError';
  }
}

export class UserNotFoundError extends CompatibilityServiceError {
  constructor() {
    super("Vous devez d'abord passer le test de compatibilité", 'USER_RESULTS_NOT_FOUND');
  }
}

export class DatabaseConnectionError extends CompatibilityServiceError {
  constructor(operation: string, originalError: Error) {
    super(`Erreur de connexion à la base de données lors de: ${operation}`, 'DATABASE_ERROR', originalError);
  }
}

export class NoMatchesFoundError extends CompatibilityServiceError {
  constructor() {
    super("Aucune correspondance trouvée", 'NO_MATCHES_FOUND');
  }
}

// Enhanced logging utility
const logError = (operation: string, error: Error, context?: any) => {
  console.error(`[CompatibilityService] ${operation} failed:`, {
    error: error.message,
    stack: error.stack,
    context
  });
};

const logWarning = (operation: string, message: string, context?: any) => {
  console.warn(`[CompatibilityService] ${operation}:`, message, context);
};

const logInfo = (operation: string, message: string, context?: any) => {
  console.log(`[CompatibilityService] ${operation}:`, message, context);
};

export async function findCompatibilityMatches(
  userId: string,
  filters?: MatchingFilters
): Promise<CompatibilityMatch[]> {
  try {
    logInfo('findCompatibilityMatches', `Starting match search for user: ${userId}`, { filters });

    // Step 1: Get current user's compatibility results with caching
    let myResults;
    try {
      // Check cache first
      const cachedResults = compatibilityCache.getUserResults(userId);
      if (cachedResults) {
        logCacheOperation('cache-hit', { operation: 'user-results', userId });
        myResults = cachedResults;
      } else {
        logCacheOperation('cache-miss', { operation: 'user-results', userId });
        
        const { data, error } = await supabase
          .from('compatibility_results')
          .select('answers, preferences')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          throw new DatabaseConnectionError('fetching user results', error);
        }

        if (!data) {
          throw new UserNotFoundError();
        }

        myResults = data;
        
        // Cache the results
        compatibilityCache.setUserResults(userId, myResults);
        logCacheOperation('cache-set', { operation: 'user-results', userId });
        logInfo('fetchUserResults', 'Successfully fetched and cached user results');
      }
    } catch (error) {
      if (error instanceof CompatibilityServiceError) {
        throw error;
      }
      throw new DatabaseConnectionError('fetching user results', error as Error);
    }

    // Step 2: Get other users' compatibility results with graceful degradation
    let otherUsers;
    try {
      const { data, error } = await supabase
        .from('compatibility_results')
        .select('user_id, answers, preferences')
        .neq('user_id', userId);

      if (error) {
        throw new DatabaseConnectionError('fetching other users results', error);
      }

      otherUsers = data || [];
      logInfo('fetchOtherUsers', `Found ${otherUsers.length} other users with compatibility results`);

      if (otherUsers.length === 0) {
        logWarning('fetchOtherUsers', 'No other users found with compatibility results');
        return [];
      }
    } catch (error) {
      if (error instanceof CompatibilityServiceError) {
        throw error;
      }
      logError('fetchOtherUsers', error as Error);
      return [];
    }

    // Step 3: Get profiles with caching and error handling
    let profiles;
    try {
      const userIds = otherUsers.map(user => user.user_id);
      
      // Check cache for profile data
      const cachedProfiles: any[] = [];
      const uncachedUserIds: string[] = [];
      
      for (const userIdToCheck of userIds) {
        const cachedProfile = compatibilityCache.getProfileData(userIdToCheck);
        if (cachedProfile) {
          cachedProfiles.push({ id: userIdToCheck, ...cachedProfile });
        } else {
          uncachedUserIds.push(userIdToCheck);
        }
      }
      
      logInfo('profileCacheCheck', `Found ${cachedProfiles.length} cached profiles, need to fetch ${uncachedUserIds.length}`);

      let fetchedProfiles: any[] = [];
      if (uncachedUserIds.length > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            gender,
            location,
            birth_date,
            religious_practice_level,
            education_level,
            email_verified,
            phone_verified,
            id_verified,
            is_visible
          `)
          .in('id', uncachedUserIds)
          .eq('is_visible', true);

        if (error) {
          throw new DatabaseConnectionError('fetching profiles', error);
        }

        fetchedProfiles = data || [];
        
        // Cache the fetched profiles
        for (const profile of fetchedProfiles) {
          const profileData = {
            first_name: profile.first_name || '',
            last_name: profile.last_name || null,
            gender: profile.gender || '',
            location: profile.location || null,
            birth_date: profile.birth_date || '',
            religious_practice_level: profile.religious_practice_level || null,
            education_level: profile.education_level || null,
            email_verified: profile.email_verified || false,
            phone_verified: profile.phone_verified || false,
            id_verified: profile.id_verified || false,
            is_visible: profile.is_visible || true
          };
          compatibilityCache.setProfileData(profile.id, profileData);
        }
        
        logCacheOperation('cache-set-batch', { 
          operation: 'profile-data', 
          count: fetchedProfiles.length 
        });
      }

      profiles = [...cachedProfiles, ...fetchedProfiles];
      logInfo('fetchProfiles', `Found ${profiles.length} visible profiles out of ${userIds.length} users`);

      if (profiles.length === 0) {
        logWarning('fetchProfiles', 'No visible profiles found');
        return [];
      }
    } catch (error) {
      if (error instanceof CompatibilityServiceError) {
        throw error;
      }
      logError('fetchProfiles', error as Error);
      return [];
    }

    // Step 4: Combine data with error handling for individual records
    let usersWithProfiles: UserResultWithProfile[] = [];
    let skippedUsers = 0;

    try {
      usersWithProfiles = otherUsers
        .map(user => {
          try {
            const profile = profiles.find(p => p.id === user.user_id);
            if (!profile) {
              logWarning('combineUserData', `No profile found for user: ${user.user_id}`);
              return null;
            }
            
            return {
              user_id: user.user_id,
              answers: user.answers as Record<string, any>,
              preferences: user.preferences as any,
              profiles: {
                first_name: profile.first_name || '',
                last_name: profile.last_name || null,
                gender: profile.gender || '',
                location: profile.location || null,
                birth_date: profile.birth_date || '',
                religious_practice_level: profile.religious_practice_level || null,
                education_level: profile.education_level || null,
                email_verified: profile.email_verified || false,
                phone_verified: profile.phone_verified || false,
                id_verified: profile.id_verified || false,
                is_visible: profile.is_visible || true
              }
            };
          } catch (error) {
            logError('combineUserData', error as Error, { userId: user.user_id });
            skippedUsers++;
            return null;
          }
        })
        .filter((user): user is UserResultWithProfile => user !== null);

      if (skippedUsers > 0) {
        logWarning('combineUserData', `Skipped ${skippedUsers} users due to data issues`);
      }

      logInfo('combineUserData', `Successfully combined data for ${usersWithProfiles.length} users`);
    } catch (error) {
      logError('combineUserData', error as Error);
      return [];
    }

    // Step 5: Apply filters and calculate scores with caching
    let matches: CompatibilityMatch[] = [];
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
      matches = batchMemoizedCompatibilityScores(myResults, filteredUsers, userId)
        .filter(match => match.score >= (filters?.minCompatibilityScore || 50))
        .sort((a, b) => b.score - a.score);

      logInfo('calculateScores', `Generated ${matches.length} final matches`);
    } catch (error) {
      logError('calculateScores', error as Error);
      return [];
    }

    const finalMatches = matches.slice(0, 20);
    
    // Log cache statistics
    const cacheStats = compatibilityCache.getCacheStats();
    logInfo('cacheStatistics', 'Current cache state', cacheStats);
    
    logInfo('findCompatibilityMatches', `Returning ${finalMatches.length} matches for user: ${userId}`);
    
    return finalMatches;
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

// Export cache management functions for external use
export { compatibilityCache } from "./cachingService";
