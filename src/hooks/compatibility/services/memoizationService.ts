
import { calculateEnhancedCompatibilityScore } from "../utils/enhancedCompatibilityScoring";
import { CompatibilityMatch } from "@/types/compatibility";
import { UserResultWithProfile } from "../types/matchingTypes";
import { compatibilityCache, logCacheOperation } from "./cachingService";

// Memoized compatibility score calculation
export function memoizedCompatibilityScore(
  myResults: { answers: Record<string, any>; preferences: any },
  otherUser: UserResultWithProfile,
  myUserId: string
): CompatibilityMatch | null {
  try {
    // Check cache first
    const cachedScore = compatibilityCache.getCompatibilityScore(myUserId, otherUser.user_id);
    
    if (cachedScore !== null) {
      logCacheOperation('cache-hit', {
        operation: 'compatibility-score',
        userId1: myUserId,
        userId2: otherUser.user_id,
        cachedScore
      });
      
      // Return cached result with profile data
      return {
        userId: otherUser.user_id,
        score: cachedScore,
        profileData: {
          first_name: otherUser.profiles.first_name,
          last_name: otherUser.profiles.last_name || undefined,
          age: calculateAge(otherUser.profiles.birth_date),
          location: otherUser.profiles.location || undefined,
          religious_practice_level: otherUser.profiles.religious_practice_level || undefined,
          education_level: otherUser.profiles.education_level || undefined,
          email_verified: otherUser.profiles.email_verified,
          phone_verified: otherUser.profiles.phone_verified,
          id_verified: otherUser.profiles.id_verified
        }
      };
    }

    // Calculate score if not cached
    logCacheOperation('cache-miss', {
      operation: 'compatibility-score',
      userId1: myUserId,
      userId2: otherUser.user_id
    });
    
    const compatibilityMatch = calculateEnhancedCompatibilityScore(myResults, otherUser);
    
    // Cache the calculated score
    if (compatibilityMatch) {
      compatibilityCache.setCompatibilityScore(myUserId, otherUser.user_id, compatibilityMatch.score);
      
      logCacheOperation('cache-set', {
        operation: 'compatibility-score',
        userId1: myUserId,
        userId2: otherUser.user_id,
        score: compatibilityMatch.score
      });
    }
    
    return compatibilityMatch;
  } catch (error) {
    console.error('[MemoizationService] Error calculating compatibility score:', error);
    return null;
  }
}

// Utility function to calculate age
function calculateAge(birthDate: string): number | undefined {
  if (!birthDate) return undefined;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Batch memoization for multiple users
export function batchMemoizedCompatibilityScores(
  myResults: { answers: Record<string, any>; preferences: any },
  otherUsers: UserResultWithProfile[],
  myUserId: string
): CompatibilityMatch[] {
  const results: CompatibilityMatch[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;

  for (const otherUser of otherUsers) {
    const result = memoizedCompatibilityScore(myResults, otherUser, myUserId);
    if (result) {
      results.push(result);
      
      // Track cache performance
      const wasCached = compatibilityCache.getCompatibilityScore(myUserId, otherUser.user_id) !== null;
      if (wasCached) cacheHits++;
      else cacheMisses++;
    }
  }

  logCacheOperation('batch-operation-complete', {
    totalUsers: otherUsers.length,
    successfulMatches: results.length,
    cacheHits,
    cacheMisses,
    cacheHitRate: otherUsers.length > 0 ? ((cacheHits / otherUsers.length) * 100).toFixed(2) + '%' : '0%'
  });

  return results;
}
