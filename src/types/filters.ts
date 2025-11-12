import { AdvancedFilters } from '@/hooks/compatibility/types/advancedFilterTypes';

export interface MadhabFilter {
  enabled: boolean;
  madhabs: string[];
}

export interface LanguageFilter {
  enabled: boolean;
  languages: string[];
  preferNative?: boolean;
}

export interface MaritalStatusFilter {
  enabled: boolean;
  statuses: string[];
}

export interface PolygamyStanceFilter {
  enabled: boolean;
  acceptableStances: string[];
  strictMode?: boolean;
}

export interface EnhancedAdvancedFilters extends AdvancedFilters {
  madhab?: MadhabFilter;
  languages?: LanguageFilter;
  maritalStatus?: MaritalStatusFilter;
  polygamyStance?: PolygamyStanceFilter;
}

export interface DailyLimits {
  suggestionsPerDay: number;
  currentDayCount: number;
  lastResetDate: string;
}

export interface CompatibilityPoint {
  category: string;
  score: number;
  weight: number;
  description: string;
  isStrength: boolean;
  isDifference: boolean;
}

export interface CompatibilityVisualization {
  overallScore: number;
  strengths: CompatibilityPoint[];
  differences: CompatibilityPoint[];
  dealbreakers: string[];
  compatibilityBreakdown: {
    religious: number;
    lifestyle: number;
    personal: number;
    family: number;
  };
}
