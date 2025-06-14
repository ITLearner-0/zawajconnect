
import { UserResultWithProfile } from "../types/matchingTypes";
import { UserAnswers, UserPreferences } from "../types/validationTypes";

// Cache configuration
const CACHE_CONFIG = {
  COMPATIBILITY_SCORES_TTL: 30 * 60 * 1000, // 30 minutes
  PROFILE_DATA_TTL: 15 * 60 * 1000, // 15 minutes
  USER_RESULTS_TTL: 60 * 60 * 1000, // 1 hour
  MAX_CACHE_SIZE: 1000 // Maximum number of cached items
};

// Cache interfaces
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CompatibilityScoreCache {
  [userPairKey: string]: CacheItem<number>;
}

interface ProfileDataCache {
  [userId: string]: CacheItem<UserResultWithProfile['profiles']>;
}

interface UserResultsCache {
  [userId: string]: CacheItem<{ answers: UserAnswers; preferences: UserPreferences }>;
}

export class CacheService {
  private compatibilityScores: CompatibilityScoreCache = {};
  private profileData: ProfileDataCache = {};
  private userResults: UserResultsCache = {};

  private isExpired<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private cleanupCache<T>(cache: Record<string, CacheItem<T>>, maxSize: number) {
    const entries = Object.entries(cache);
    if (entries.length > maxSize) {
      // Remove oldest entries
      entries
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, entries.length - maxSize)
        .forEach(([key]) => delete cache[key]);
    }
  }

  // Compatibility scores caching
  getCompatibilityScore(userId1: string, userId2: string): number | null {
    const key = this.generateUserPairKey(userId1, userId2);
    const item = this.compatibilityScores[key];
    
    if (!item || this.isExpired(item)) {
      delete this.compatibilityScores[key];
      return null;
    }
    
    return item.data;
  }

  setCompatibilityScore(userId1: string, userId2: string, score: number): void {
    const key = this.generateUserPairKey(userId1, userId2);
    this.compatibilityScores[key] = {
      data: score,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.COMPATIBILITY_SCORES_TTL
    };
    
    this.cleanupCache(this.compatibilityScores, CACHE_CONFIG.MAX_CACHE_SIZE);
  }

  // Profile data caching
  getProfileData(userId: string): UserResultWithProfile['profiles'] | null {
    const item = this.profileData[userId];
    
    if (!item || this.isExpired(item)) {
      delete this.profileData[userId];
      return null;
    }
    
    return item.data;
  }

  setProfileData(userId: string, data: UserResultWithProfile['profiles']): void {
    this.profileData[userId] = {
      data,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.PROFILE_DATA_TTL
    };
    
    this.cleanupCache(this.profileData, CACHE_CONFIG.MAX_CACHE_SIZE);
  }

  // User results caching
  getUserResults(userId: string): { answers: UserAnswers; preferences: UserPreferences } | null {
    const item = this.userResults[userId];
    
    if (!item || this.isExpired(item)) {
      delete this.userResults[userId];
      return null;
    }
    
    return item.data;
  }

  setUserResults(userId: string, data: { answers: UserAnswers; preferences: UserPreferences }): void {
    this.userResults[userId] = {
      data,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.USER_RESULTS_TTL
    };
    
    this.cleanupCache(this.userResults, CACHE_CONFIG.MAX_CACHE_SIZE);
  }

  // Utility methods
  private generateUserPairKey(userId1: string, userId2: string): string {
    // Sort to ensure consistent key regardless of order
    return [userId1, userId2].sort().join('|');
  }

  // Clear specific cache sections
  clearCompatibilityCache(): void {
    this.compatibilityScores = {};
  }

  clearProfileCache(): void {
    this.profileData = {};
  }

  clearUserResultsCache(): void {
    this.userResults = {};
  }

  // Clear all caches
  clearAllCaches(): void {
    this.compatibilityScores = {};
    this.profileData = {};
    this.userResults = {};
  }

  // Get cache statistics
  getCacheStats() {
    return {
      compatibilityScores: {
        count: Object.keys(this.compatibilityScores).length,
        size: Object.keys(this.compatibilityScores).length
      },
      profileData: {
        count: Object.keys(this.profileData).length,
        size: Object.keys(this.profileData).length
      },
      userResults: {
        count: Object.keys(this.userResults).length,
        size: Object.keys(this.userResults).length
      }
    };
  }
}

export const cacheService = new CacheService();

// Logging utility for cache operations
export const logCacheOperation = (operation: string, details: any) => {
  console.log(`[CompatibilityCache] ${operation}:`, details);
};
