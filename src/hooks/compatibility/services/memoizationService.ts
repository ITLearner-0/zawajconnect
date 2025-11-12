import { CompatibilityMatch } from '@/types/compatibility';
import { UserResultWithProfile } from '../types/matchingTypes';
import { ValidatedUserResults } from './dataFetchingService';
import { compatibilityCalculator } from './compatibilityCalculator';
import { logInfo } from './loggingService';

// Memoization cache for compatibility scores
const compatibilityScoreCache = new Map<string, CompatibilityMatch>();
const CACHE_SIZE_LIMIT = 1000;

function generateScoreKey(myUserId: string, otherUserId: string): string {
  // Create a consistent key regardless of order
  const sortedIds = [myUserId, otherUserId].sort();
  return `${sortedIds[0]}:${sortedIds[1]}`;
}

export function memoizedCompatibilityScore(
  myResults: ValidatedUserResults,
  otherUser: UserResultWithProfile,
  myUserId: string
): CompatibilityMatch {
  const cacheKey = generateScoreKey(myUserId, otherUser.user_id);

  // Check cache first
  if (compatibilityScoreCache.has(cacheKey)) {
    return compatibilityScoreCache.get(cacheKey)!;
  }

  // Calculate new score using the dedicated calculator
  const match = compatibilityCalculator.calculateCompatibilityScore(myResults, otherUser);

  // Cache management - remove oldest entries if cache is full
  if (compatibilityScoreCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = compatibilityScoreCache.keys().next().value;
    compatibilityScoreCache.delete(firstKey);
  }

  // Store in cache
  compatibilityScoreCache.set(cacheKey, match);

  return match;
}

export function batchMemoizedCompatibilityScores(
  myResults: ValidatedUserResults,
  otherUsers: UserResultWithProfile[],
  myUserId: string
): CompatibilityMatch[] {
  const startTime = performance.now();

  const matches = otherUsers.map((otherUser) =>
    memoizedCompatibilityScore(myResults, otherUser, myUserId)
  );

  const endTime = performance.now();
  const cacheHits =
    otherUsers.length -
    matches.filter(
      (match) => !compatibilityScoreCache.has(generateScoreKey(myUserId, match.userId))
    ).length;

  logInfo(
    'batchMemoizedScoring',
    `Processed ${matches.length} matches in ${(endTime - startTime).toFixed(2)}ms`,
    {
      cacheHits,
      cacheMisses: matches.length - cacheHits,
      cacheSize: compatibilityScoreCache.size,
    }
  );

  return matches;
}

export function clearCompatibilityScoreCache(): void {
  compatibilityScoreCache.clear();
  logInfo('clearCompatibilityScoreCache', 'Compatibility score cache cleared');
}

export function getCompatibilityScoreCacheStats(): {
  size: number;
  limit: number;
  hitRate?: number;
} {
  return {
    size: compatibilityScoreCache.size,
    limit: CACHE_SIZE_LIMIT,
  };
}
