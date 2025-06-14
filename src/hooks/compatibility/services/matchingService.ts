
import { supabase } from "@/integrations/supabase/client";
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters, UserResultWithProfile } from "../types/matchingTypes";
import { applyFilters } from "../utils/matchingFilters";
import { calculateEnhancedCompatibilityScore } from "../utils/enhancedCompatibilityScoring";

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

    // Step 1: Get current user's compatibility results
    let myResults;
    try {
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
      logInfo('fetchUserResults', 'Successfully fetched user results');
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
      // Graceful degradation: return empty array instead of throwing
      return [];
    }

    // Step 3: Get profiles with error handling and partial data support
    let profiles;
    try {
      const userIds = otherUsers.map(user => user.user_id);
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
        .in('id', userIds)
        .eq('is_visible', true);

      if (error) {
        throw new DatabaseConnectionError('fetching profiles', error);
      }

      profiles = data || [];
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
      // Graceful degradation: return empty array
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
      // Graceful degradation: return empty array if data combination fails
      return [];
    }

    // Step 5: Apply filters and calculate scores with error handling
    let matches: CompatibilityMatch[] = [];
    try {
      const filteredUsers = usersWithProfiles.filter((user) => {
        try {
          return applyFilters(user, filters);
        } catch (error) {
          logError('applyFilters', error as Error, { userId: user.user_id });
          return false; // Skip this user if filtering fails
        }
      });

      logInfo('applyFilters', `${filteredUsers.length} users passed filters out of ${usersWithProfiles.length}`);

      matches = filteredUsers
        .map((user) => {
          try {
            return calculateEnhancedCompatibilityScore(myResults, user);
          } catch (error) {
            logError('calculateCompatibilityScore', error as Error, { userId: user.user_id });
            return null; // Skip this user if score calculation fails
          }
        })
        .filter((match): match is CompatibilityMatch => match !== null)
        .filter(match => match.score >= (filters?.minCompatibilityScore || 50))
        .sort((a, b) => b.score - a.score);

      logInfo('calculateScores', `Generated ${matches.length} final matches`);
    } catch (error) {
      logError('calculateScores', error as Error);
      // Graceful degradation: return empty array if scoring fails
      return [];
    }

    const finalMatches = matches.slice(0, 20); // Limit to top 20 matches
    logInfo('findCompatibilityMatches', `Returning ${finalMatches.length} matches for user: ${userId}`);
    
    return finalMatches;
  } catch (error) {
    // Log the final error and re-throw
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
