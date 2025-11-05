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

interface Profile {
  user_id: string;
  full_name: string | undefined;
  age: number | undefined;
  gender: string | undefined;
  location: string | undefined;
  education: string | undefined;
  profession: string | undefined;
  bio: string | undefined;
  interests: string[] | undefined;
  avatar_url: string | undefined;
}

interface IslamicPreferences {
  user_id: string;
  prayer_frequency: string | undefined;
  sect: string | undefined;
  hijab_preference: string | undefined;
  religious_level: string | undefined;
  [key: string]: unknown;
}

interface VerificationData {
  user_id: string;
  verification_score: number;
}

interface ScoredMatch extends Profile {
  compatibility_score: number;
  islamic_score: number;
  cultural_score: number;
  personality_score: number;
  shared_interests: string[];
  compatibility_reasons: string[];
  verification_score: number;
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
  ): Promise<ScoredMatch[]> {
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

      // Cache the results (convert to CachedMatch format)
      const cachedMatches = matches.map(m => ({
        profileId: m.user_id,
        score: m.compatibility_score,
        calculatedAt: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_DURATION_MS)
      }));
      this.cache.set(cacheKey, cachedMatches);

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
  ): Promise<ScoredMatch[]> {
    // Step 1: Get user's profile and preferences in parallel
    const [myProfileResult, myIslamicPrefs] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    if (!myProfileResult.data) {
      throw new Error('User profile not found');
    }

    const myProfile = myProfileResult.data;
    const profile: Profile = {
      user_id: myProfile.user_id ?? '',
      full_name: myProfile.full_name ?? undefined,
      age: myProfile.age ?? undefined,
      gender: myProfile.gender ?? undefined,
      location: myProfile.location ?? undefined,
      education: myProfile.education ?? undefined,
      profession: myProfile.profession ?? undefined,
      bio: myProfile.bio ?? undefined,
      interests: myProfile.interests ?? undefined,
      avatar_url: myProfile.avatar_url ?? undefined
    };

    const islamicPrefs: IslamicPreferences | undefined = myIslamicPrefs.data ? ({
      user_id: myIslamicPrefs.data.user_id ?? '',
      prayer_frequency: myIslamicPrefs.data.prayer_frequency ?? undefined,
      sect: myIslamicPrefs.data.sect ?? undefined,
      hijab_preference: myIslamicPrefs.data.hijab_preference ?? undefined,
      religious_level: (myIslamicPrefs.data as any).religious_level ?? undefined
    }) : undefined;

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

    // Normalize potential matches
    const normalizedMatches: Profile[] = potentialMatches.map(p => ({
      user_id: p.user_id ?? '',
      full_name: p.full_name ?? undefined,
      age: p.age ?? undefined,
      gender: p.gender ?? undefined,
      location: p.location ?? undefined,
      education: p.education ?? undefined,
      profession: p.profession ?? undefined,
      bio: p.bio ?? undefined,
      interests: p.interests ?? undefined,
      avatar_url: p.avatar_url ?? undefined
    }));

    // Step 3: Batch fetch related data
    const userIds = normalizedMatches.map(p => p.user_id);
    const [islamicPrefsData, verificationsData] = await Promise.all([
      this.batchFetchIslamicPrefs(userIds),
      this.batchFetchVerifications(userIds)
    ]);

    // Step 4: Calculate compatibility scores in batches
    const scoredMatches = await this.batchCalculateCompatibility(
      normalizedMatches,
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
  private async batchFetchIslamicPrefs(userIds: string[]): Promise<Map<string, IslamicPreferences>> {
    const prefsMap = new Map();

    // Process in batches to avoid query limits
    for (let i = 0; i < userIds.length; i += this.BATCH_SIZE) {
      const batch = userIds.slice(i, i + this.BATCH_SIZE);

      const { data } = await supabase
        .from('islamic_preferences')
        .select('*')
        .in('user_id', batch);

      if (data) {
        data.forEach(pref => {
          const normalizedPref: IslamicPreferences = {
            user_id: pref.user_id ?? '',
            prayer_frequency: pref.prayer_frequency ?? undefined,
            sect: pref.sect ?? undefined,
            hijab_preference: pref.hijab_preference ?? undefined,
            religious_level: (pref as any).religious_level ?? undefined
          };
          prefsMap.set(pref.user_id, normalizedPref);
        });
      }
    }

    return prefsMap;
  }

  /**
   * Batch fetch verification data
   */
  private async batchFetchVerifications(userIds: string[]): Promise<Map<string, VerificationData>> {
    const verificationsMap = new Map();

    for (let i = 0; i < userIds.length; i += this.BATCH_SIZE) {
      const batch = userIds.slice(i, i + this.BATCH_SIZE);

      const { data } = await supabase
        .from('user_verifications')
        .select('user_id, verification_score')
        .in('user_id', batch);

      if (data) {
        data.forEach(v => {
          const normalizedVerification: VerificationData = {
            user_id: v.user_id ?? '',
            verification_score: v.verification_score ?? 0
          };
          verificationsMap.set(v.user_id, normalizedVerification);
        });
      }
    }

    return verificationsMap;
  }

  /**
   * Batch calculate compatibility scores
   */
  private async batchCalculateCompatibility(
    profiles: Profile[],
    islamicPrefsMap: Map<string, IslamicPreferences>,
    verificationsMap: Map<string, VerificationData>,
    myProfile: Profile,
    myIslamicPrefs: IslamicPreferences | undefined
  ): Promise<ScoredMatch[]> {
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
      const verificationScore = verification?.verification_score ?? 0;
      if (verificationScore >= 70) reasons.push('Profil vérifié');

      const sharedInterests = (myProfile.interests || []).filter((i: string) =>
        (profile.interests || []).includes(i)
      );
      if (sharedInterests.length > 0) {
        reasons.push(`${sharedInterests.length} intérêts communs`);
      }

      return {
        ...profile,
        full_name: profile.full_name ?? undefined,
        age: profile.age ?? undefined,
        gender: profile.gender ?? undefined,
        location: profile.location ?? undefined,
        education: profile.education ?? undefined,
        profession: profile.profession ?? undefined,
        bio: profile.bio ?? undefined,
        interests: profile.interests ?? undefined,
        avatar_url: profile.avatar_url ?? undefined,
        compatibility_score: overallScore,
        islamic_score: islamicScore,
        cultural_score: culturalScore,
        personality_score: personalityScore,
        shared_interests: sharedInterests,
        compatibility_reasons: reasons,
        verification_score: verification?.verification_score ?? 0
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
   * Get matches from cache if not expired (returns cached IDs only)
   */
  private getFromCache(cacheKey: string): ScoredMatch[] | undefined {
    // Cache now only stores match metadata, not full profiles
    // Return undefined to always fetch fresh data with full profiles
    return undefined;
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
    oldestEntry: Date | undefined;
    newestEntry: Date | undefined;
  } {
    let totalMatches = 0;
    let oldest: Date | undefined = undefined;
    let newest: Date | undefined = undefined;

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
