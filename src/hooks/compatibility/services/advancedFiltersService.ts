import { CompatibilityMatch } from '@/types/compatibility';
import { UserResultWithProfile } from '../types/matchingTypes';
import {
  AdvancedFilters,
  LocationFilter,
  CompatibilityScoreFilter,
  DealBreakerFilter,
} from '../types/advancedFilterTypes';
import { logInfo, logError } from './loggingService';

export class AdvancedFiltersService {
  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Parse location string to get coordinates (simplified implementation)
  private parseLocationCoordinates(location: string): { lat: number; lon: number } | null {
    // This is a simplified implementation - in real app you'd use geocoding service
    const locationMap: Record<string, { lat: number; lon: number }> = {
      Paris: { lat: 48.8566, lon: 2.3522 },
      London: { lat: 51.5074, lon: -0.1278 },
      'New York': { lat: 40.7128, lon: -74.006 },
      Cairo: { lat: 30.0444, lon: 31.2357 },
      Istanbul: { lat: 41.0082, lon: 28.9784 },
      Dubai: { lat: 25.2048, lon: 55.2708 },
    };

    const normalizedLocation = location.trim();
    return locationMap[normalizedLocation] || null;
  }

  applyLocationFilter(
    users: UserResultWithProfile[],
    filter: LocationFilter
  ): UserResultWithProfile[] {
    if (!filter.enabled || !filter.latitude || !filter.longitude) {
      return users;
    }

    return users.filter((user) => {
      if (!user.profiles.location) return false;

      const userCoords = this.parseLocationCoordinates(user.profiles.location);
      if (!userCoords) return false;

      const distance = this.calculateDistance(
        filter.latitude!,
        filter.longitude!,
        userCoords.lat,
        userCoords.lon
      );

      return distance <= filter.radiusKm;
    });
  }

  applyCompatibilityScoreFilter(
    matches: CompatibilityMatch[],
    filter: CompatibilityScoreFilter
  ): CompatibilityMatch[] {
    if (!filter.enabled) {
      return matches;
    }

    return matches.filter(
      (match) => match.score >= filter.minScore && match.score <= filter.maxScore
    );
  }

  applyDealBreakerFilter(
    matches: CompatibilityMatch[],
    filter: DealBreakerFilter
  ): CompatibilityMatch[] {
    if (!filter.enabled || filter.categories.length === 0) {
      return matches;
    }

    return matches.filter((match) => {
      if (!match.matchDetails?.dealbreakers || match.matchDetails.dealbreakers.length === 0) {
        return true; // No dealbreakers, so it passes
      }

      if (filter.strictMode) {
        // In strict mode, exclude any match that has dealbreakers in the selected categories
        return !match.matchDetails.dealbreakers.some((dealbreaker) =>
          filter.categories.some((category) =>
            dealbreaker.toLowerCase().includes(category.toLowerCase())
          )
        );
      } else {
        // In non-strict mode, only exclude if ALL dealbreakers are in selected categories
        return !match.matchDetails.dealbreakers.every((dealbreaker) =>
          filter.categories.some((category) =>
            dealbreaker.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
    });
  }

  applyAdvancedFilters(
    users: UserResultWithProfile[],
    matches: CompatibilityMatch[],
    filters: AdvancedFilters
  ): { filteredUsers: UserResultWithProfile[]; filteredMatches: CompatibilityMatch[] } {
    try {
      let filteredUsers = [...users];
      let filteredMatches = [...matches];

      // Apply location filter to users first
      if (filters.location) {
        filteredUsers = this.applyLocationFilter(filteredUsers, filters.location);
        logInfo(
          'advancedFilters',
          `Location filter applied: ${filteredUsers.length} users remaining`
        );
      }

      // Apply compatibility score filter to matches
      if (filters.compatibilityScore) {
        filteredMatches = this.applyCompatibilityScoreFilter(
          filteredMatches,
          filters.compatibilityScore
        );
        logInfo(
          'advancedFilters',
          `Compatibility score filter applied: ${filteredMatches.length} matches remaining`
        );
      }

      // Apply deal-breaker filter to matches
      if (filters.dealBreakers) {
        filteredMatches = this.applyDealBreakerFilter(filteredMatches, filters.dealBreakers);
        logInfo(
          'advancedFilters',
          `Deal-breaker filter applied: ${filteredMatches.length} matches remaining`
        );
      }

      // Filter matches to only include users that passed location filtering
      const filteredUserIds = new Set(filteredUsers.map((user) => user.user_id));
      filteredMatches = filteredMatches.filter((match) => filteredUserIds.has(match.userId));

      return { filteredUsers, filteredMatches };
    } catch (error) {
      logError('advancedFilters', error as Error, { filters });
      return { filteredUsers: users, filteredMatches: matches };
    }
  }

  getFilterSummary(filters: AdvancedFilters): string[] {
    const summary: string[] = [];

    if (filters.location?.enabled) {
      summary.push(`Within ${filters.location.radiusKm}km radius`);
    }

    if (filters.compatibilityScore?.enabled) {
      summary.push(
        `Compatibility: ${filters.compatibilityScore.minScore}-${filters.compatibilityScore.maxScore}%`
      );
    }

    if (filters.dealBreakers?.enabled && filters.dealBreakers.categories.length > 0) {
      const mode = filters.dealBreakers.strictMode ? 'strict' : 'flexible';
      summary.push(`Deal-breakers (${mode}): ${filters.dealBreakers.categories.join(', ')}`);
    }

    return summary;
  }
}

export const advancedFiltersService = new AdvancedFiltersService();
