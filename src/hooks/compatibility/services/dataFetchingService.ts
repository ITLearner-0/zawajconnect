
import { supabase } from "@/integrations/supabase/client";
import { UserResultWithProfile } from "../types/matchingTypes";
import { cacheService, logCacheOperation } from "./cacheService";
import { DatabaseConnectionError, UserNotFoundError } from "./errorHandling";
import { logInfo, logWarning, logError } from "./loggingService";
import { 
  safeValidateUserAnswers, 
  safeValidateUserPreferences
} from "./validationService";
import {
  UserAnswers,
  UserPreferences
} from "../types/validationTypes";

export interface ValidatedUserResults {
  answers: UserAnswers;
  preferences: UserPreferences;
}

// JSON type helpers
function safeJsonToRecord(value: any): Record<string, any> {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value || {};
}

function safeJsonToAny(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export async function fetchUserResults(userId: string): Promise<ValidatedUserResults> {
  // Check cache first
  const cachedResults = cacheService.getUserResults(userId);
  if (cachedResults) {
    logCacheOperation('cache-hit', { operation: 'user-results', userId });
    return cachedResults;
  }

  logCacheOperation('cache-miss', { operation: 'user-results', userId });
  
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

    const results: ValidatedUserResults = {
      answers: safeValidateUserAnswers(safeJsonToRecord(data.answers)),
      preferences: safeValidateUserPreferences(safeJsonToAny(data.preferences))
    };
    
    // Cache the results
    cacheService.setUserResults(userId, results);
    logCacheOperation('cache-set', { operation: 'user-results', userId });
    logInfo('fetchUserResults', 'Successfully fetched and cached user results');

    return results;
  } catch (error) {
    if (error instanceof DatabaseConnectionError || error instanceof UserNotFoundError) {
      throw error;
    }
    throw new DatabaseConnectionError('fetching user results', error as Error);
  }
}

export interface ValidatedOtherUser {
  user_id: string;
  answers: UserAnswers;
  preferences: UserPreferences;
}

export async function fetchOtherUsers(userId: string): Promise<ValidatedOtherUser[]> {
  try {
    const { data, error } = await supabase
      .from('compatibility_results')
      .select('user_id, answers, preferences')
      .neq('user_id', userId);

    if (error) {
      throw new DatabaseConnectionError('fetching other users results', error);
    }

    const otherUsers: ValidatedOtherUser[] = (data || []).map(user => ({
      user_id: user.user_id,
      answers: safeValidateUserAnswers(safeJsonToRecord(user.answers)),
      preferences: safeValidateUserPreferences(safeJsonToAny(user.preferences))
    }));
    
    logInfo('fetchOtherUsers', `Found ${otherUsers.length} other users with compatibility results`);

    if (otherUsers.length === 0) {
      logWarning('fetchOtherUsers', 'No other users found with compatibility results');
    }

    return otherUsers;
  } catch (error) {
    if (error instanceof DatabaseConnectionError) {
      throw error;
    }
    logError('fetchOtherUsers', error as Error);
    return [];
  }
}

// Re-export from profileService for backward compatibility
export type { ValidatedProfileData } from "./profileService";
export { profileService as fetchProfiles } from "./profileService";
