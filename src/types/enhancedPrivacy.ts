
import { PrivacySettings } from './profile';

export interface ProgressiveRevealSettings {
  enabled: boolean;
  revealStages: {
    basic: boolean; // Name, age, location
    education: boolean; // Education, occupation
    religious: boolean; // Religious practice, prayer frequency
    personal: boolean; // About me, family background
    contact: boolean; // Wali information
  };
  requiresCompatibilityScore: number; // Minimum score to reveal each stage
  autoRevealAfterDays: number; // Auto-reveal after X days of conversation
}

export interface IncognitoSettings {
  enabled: boolean;
  hideFromSearch: boolean;
  hideLastActive: boolean;
  hideViewHistory: boolean;
  limitProfileViews: boolean;
  maxProfileViewsPerDay: number;
}

export interface ProfileVisibilitySettings {
  whoCanSeeProfile: 'everyone' | 'matches_only' | 'verified_only' | 'custom';
  customCriteria: {
    minCompatibilityScore: number;
    requireVerification: boolean;
    requireWaliApproval: boolean;
    allowedAgeRange: [number, number];
    allowedLocations: string[];
    blockedUsers: string[];
  };
  showInSearchResults: boolean;
  allowProfileScreenshots: boolean;
}

export interface EnhancedPrivacySettings extends PrivacySettings {
  progressiveReveal: ProgressiveRevealSettings;
  incognito: IncognitoSettings;
  profileVisibility: ProfileVisibilitySettings;
  dataRetention: {
    deleteViewHistoryAfterDays: number;
    deleteConversationsAfterDays: number;
    autoDeleteRejectedMatches: boolean;
  };
}

export interface ProfileViewEvent {
  id: string;
  viewerId: string;
  viewedUserId: string;
  timestamp: Date;
  revealLevel: keyof ProgressiveRevealSettings['revealStages'];
  compatibilityScore?: number;
}

export interface PrivacyAuditLog {
  id: string;
  userId: string;
  action: 'profile_viewed' | 'data_revealed' | 'privacy_changed' | 'incognito_enabled';
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}
