
import { supabase } from "@/integrations/supabase/client";
import { UserResultWithProfile } from "../types/matchingTypes";
import { compatibilityCache, logCacheOperation } from "./cachingService";
import { DatabaseConnectionError, UserNotFoundError } from "./errorHandling";
import { logInfo, logWarning, logError } from "./loggingService";

export async function fetchUserResults(userId: string): Promise<{ answers: Record<string, any>; preferences: any }> {
  // Check cache first
  const cachedResults = compatibilityCache.getUserResults(userId);
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

    const results = data;
    
    // Cache the results
    compatibilityCache.setUserResults(userId, results);
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

export async function fetchOtherUsers(userId: string): Promise<Array<{ user_id: string; answers: Record<string, any>; preferences: any }>> {
  try {
    const { data, error } = await supabase
      .from('compatibility_results')
      .select('user_id, answers, preferences')
      .neq('user_id', userId);

    if (error) {
      throw new DatabaseConnectionError('fetching other users results', error);
    }

    const otherUsers = data || [];
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

export async function fetchProfiles(userIds: string[]): Promise<any[]> {
  try {
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

    const profiles = [...cachedProfiles, ...fetchedProfiles];
    logInfo('fetchProfiles', `Found ${profiles.length} visible profiles out of ${userIds.length} users`);

    if (profiles.length === 0) {
      logWarning('fetchProfiles', 'No visible profiles found');
    }

    return profiles;
  } catch (error) {
    if (error instanceof DatabaseConnectionError) {
      throw error;
    }
    logError('fetchProfiles', error as Error);
    return [];
  }
}
