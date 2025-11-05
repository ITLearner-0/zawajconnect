/**
 * Matching Optimization Service
 *
 * Optimizes database queries for match suggestions
 * and implements caching strategies for better performance
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import {
  calculateIslamicCompatibility,
  calculateCulturalCompatibility,
  calculateOverallCompatibility
} from '@/utils/matchingAlgorithm';

interface CachedMatch {
  profileId: string;
  score: number;
  calculatedAt: Date;
  expiresAt: Date;
}

interface MatchFilters {
  minAge?: number;
  maxAge?: number;
  location?: string;
  education?: string;
  sect?: string;
  minCompatibility?: number;
}

class MatchingOptimizationService {
  private cache: Map<string, CachedMatch[]> = new Map();
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  private readonly BATCH_SIZE = 50; // Process in batches

  /**
   * Get optimized match suggestions with caching
   */
  async getMatchSuggestions(
    userId: string,
    limit: number = 10,
    filters?: MatchFilters
  ): Promise<any[]> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(userId, filters);
      const cached = this.getFromCache(cacheKey);

      if (cached && cached.length > 0) {
        logger.log('Using cached match suggestions', { userId, count: cached.length });
        return cached.slice(0, limit);
      }

      // Fetch fresh data with optimized query
      const matches = await this.fetchOptimizedMatches(userId, filters);

      // Cache the results
      this.cache.set(cacheKey, matches);

      return matches.slice(0, limit);
    } catch (error) {
      logger.error('Error getting match suggestions', error);
      throw error;
    }
  }

  /**
   * Fetch matches with optimized database queries
   */
  private async fetchOptimizedMatches(
    userId: string,
    filters?: MatchFilters
  ): Promise<any[]> {
    // Step 1: Get user's profile and preferences in parallel
    const [myProfile, myIslamicPrefs] = await Promise.all([
      supabase
        .from('profiles')
        .select('user_id, age, gender, location, education, interests')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    if (!myProfile.data) {
      throw new Error('User profile not found');
    }

    const profile = myProfile.data;
    const islamicPrefs = myIslamicPrefs.data;

    // Step 2: Build optimized query for potential matches
    const targetGender = profile.gender === 'male' ? 'female' : 'male';

    let query = supabase
      .from('profiles')
      .select(`
        user_id,
        full_name,
        age,
        gender,
        location,
        education,
        profession,
        bio,
        interests,
        avatar_url
      `)
      .eq('gender', targetGender)
      .neq('user_id', userId);

    // Apply filters
    if (filters?.minAge) {
      query = query.gte('age', filters.minAge);
    }
    if (filters?.maxAge) {
      query = query.lte('age', filters.maxAge);
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.education) {
      query = query.ilike('education', `%${filters.education}%`);
    }

    // Limit initial query to reduce data transfer
    query = query.limit(100);

    const { data: potentialMatches, error } = await query;

    if (error) throw error;
    if (!potentialMatches || potentialMatches.length === 0) {
      return [];
    }

    // Step 3: Batch fetch related data
    const userIds = potentialMatches.map(p => p.user_id);
    const [islamicPrefsData, verificationsData] = await Promise.all([
      this.batchFetchIslamicPrefs(userIds),
      this.batchFetchVerifications(userIds)
    ]);

    // Step 4: Calculate compatibility scores in batches
    const scoredMatches = await this.batchCalculateCompatibility(
      potentialMatches,
      islamicPrefsData,
      verificationsData,
      profile,
      islamicPrefs
    );

    // Step 5: Filter by minimum compatibility if specified
    let filteredMatches = scoredMatches;
    if (filters?.minCompatibility) {
      filteredMatches = scoredMatches.filter(
        m => m.compatibility_score >= filters.minCompatibility!
      );
    }

    // Step 6: Sort by compatibility score
    return filteredMatches.sort((a, b) => b.compatibility_score - a.compatibility_score);
  }

  /**
   * Batch fetch Islamic preferences
   */
  private async batchFetchIslamicPrefs(userIds: string[]): Promise<Map<string, any>> {
    const prefsMap = new Map();

    // Process in batches to avoid query limits
    for (let i = 0; i < userIds.length; i += this.BATCH_SIZE) {
      const batch = userIds.slice(i, i + this.BATCH_SIZE);

      const { data } = await supabase
        .from('islamic_preferences')
        .select('*')
        .in('user_id', batch);

      if (data) {
        data.forEach(pref => prefsMap.set(pref.user_id, pref));
      }
    }

    return prefsMap;
  }

  /**
   * Batch fetch verification data
   */
  private async batchFetchVerifications(userIds: string[]): Promise<Map<string, any>> {
    const verificationsMap = new Map();

    for (let i = 0; i < userIds.length; i += this.BATCH_SIZE) {
      const batch = userIds.slice(i, i + this.BATCH_SIZE);

      const { data } = await supabase
        .from('user_verifications')
        .select('user_id, verification_score')
        .in('user_id', batch);

      if (data) {
        data.forEach(v => verificationsMap.set(v.user_id, v));
      }
    }

    return verificationsMap;
  }

  /**
   * Batch calculate compatibility scores
   */
  private async batchCalculateCompatibility(
    profiles: any[],
    islamicPrefsMap: Map<string, any>,
    verificationsMap: Map<string, any>,
    myProfile: any,
    myIslamicPrefs: any
  ): Promise<any[]> {
    return profiles.map(profile => {
      const islamicPrefs = islamicPrefsMap.get(profile.user_id);
      const verification = verificationsMap.get(profile.user_id);

      // Calculate scores
      let islamicScore = 60; // Default
      if (myIslamicPrefs && islamicPrefs) {
        islamicScore = calculateIslamicCompatibility(myIslamicPrefs, islamicPrefs);
      }

      const culturalPrefs = {
        location: myProfile.location || '',
        education_level: myProfile.education || '',
        interests: myProfile.interests || [],
      };

      const theirCulturalPrefs = {
        location: profile.location || '',
        education_level: profile.education || '',
        interests: profile.interests || [],
      };

      const culturalScore = calculateCulturalCompatibility(culturalPrefs, theirCulturalPrefs);

      const personalityScore = 70; // Default - will be enhanced with questionnaire

      const overallScore = calculateOverallCompatibility(
        islamicScore,
        culturalScore,
        personalityScore
      );

      // Build reasons
      const reasons: string[] = [];
      if (islamicScore >= 80) reasons.push('Excellente compatibilité religieuse');
      if (culturalScore >= 80) reasons.push('Excellente compatibilité culturelle');
      if (verification?.verification_score >= 70) reasons.push('Profil vérifié');

      const sharedInterests = (myProfile.interests || []).filter((i: string) =>
        (profile.interests || []).includes(i)
      );
      if (sharedInterests.length > 0) {
        reasons.push(`${sharedInterests.length} intérêts communs`);
      }

      return {
        ...profile,
        compatibility_score: overallScore,
        islamic_score: islamicScore,
        cultural_score: culturalScore,
        personality_score: personalityScore,
        shared_interests: sharedInterests,
        compatibility_reasons: reasons,
        verification_score: verification?.verification_score || 0
      };
    });
  }

  /**
   * Get cache key for user and filters
   */
  private getCacheKey(userId: string, filters?: MatchFilters): string {
    const filterKey = filters ? JSON.stringify(filters) : 'default';
    return `${userId}:${filterKey}`;
  }

  /**
   * Get matches from cache if not expired
   */
  private getFromCache(cacheKey: string): any[] | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = new Date();
    const validMatches = cached.filter(m => m.expiresAt > now);

    if (validMatches.length === 0) {
      this.cache.delete(cacheKey);
      return null;
    }

    return validMatches;
  }

  /**
   * Clear cache for a specific user
   */
  clearCache(userId: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(userId)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));

    logger.log('Cache cleared for user', { userId, keysCleared: keysToDelete.length });
  }

  /**
   * Clear all expired cache entries
   */
  cleanupCache(): void {
    const now = new Date();
    let cleaned = 0;

    this.cache.forEach((matches, key) => {
      const validMatches = matches.filter(m => m.expiresAt > now);
      if (validMatches.length === 0) {
        this.cache.delete(key);
        cleaned++;
      } else if (validMatches.length < matches.length) {
        this.cache.set(key, validMatches);
      }
    });

    logger.log('Cache cleanup completed', { entriesCleaned: cleaned });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    totalMatches: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    let totalMatches = 0;
    let oldest: Date | null = null;
    let newest: Date | null = null;

    this.cache.forEach(matches => {
      totalMatches += matches.length;
      matches.forEach(m => {
        if (!oldest || m.calculatedAt < oldest) oldest = m.calculatedAt;
        if (!newest || m.calculatedAt > newest) newest = m.calculatedAt;
      });
    });

    return {
      totalEntries: this.cache.size,
      totalMatches,
      oldestEntry: oldest,
      newestEntry: newest
    };
  }
}

// Export singleton instance
export const matchingOptimizationService = new MatchingOptimizationService();

// Setup periodic cache cleanup (every 15 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    matchingOptimizationService.cleanupCache();
  }, 15 * 60 * 1000);
}
