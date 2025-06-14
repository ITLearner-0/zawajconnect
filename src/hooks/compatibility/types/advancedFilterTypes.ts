
export interface LocationFilter {
  enabled: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm: number;
}

export interface CompatibilityScoreFilter {
  enabled: boolean;
  minScore: number;
  maxScore: number;
}

export interface DealBreakerFilter {
  enabled: boolean;
  categories: string[];
  strictMode: boolean; // If true, exclude any matches with dealbreakers in selected categories
}

export interface AdvancedFilters {
  location?: LocationFilter;
  compatibilityScore?: CompatibilityScoreFilter;
  dealBreakers?: DealBreakerFilter;
}

// Extend the existing MatchingFilters to include advanced filters
export interface EnhancedMatchingFilters {
  ageRange?: [number, number];
  gender?: string;
  location?: string;
  religiousLevel?: string[];
  minCompatibilityScore?: number;
  verifiedOnly?: boolean;
  advanced?: AdvancedFilters;
  pagination?: {
    limit?: number;
    offset?: number;
  };
}
