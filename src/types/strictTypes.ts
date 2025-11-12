// Strict type definitions to improve type safety

import { DatabaseId, EmailAddress, PhoneNumber } from './typeUtils';

// Enhanced profile types with strict validation
export interface StrictProfileData {
  readonly id: DatabaseId;
  readonly first_name: string;
  readonly last_name: string | null;
  readonly email: EmailAddress;
  readonly birth_date: string; // ISO date string
  readonly gender: 'male' | 'female';
  readonly location: string | null;
  readonly education_level: string | null;
  readonly occupation: string | null;
  readonly religious_practice_level: 'beginner' | 'practicing' | 'devout' | 'scholar' | null;
  readonly prayer_frequency: 'rarely' | 'sometimes' | 'regularly' | 'always' | null;
  readonly about_me: string | null;
  readonly profile_picture: string | null;
  readonly gallery: readonly string[];
  readonly privacy_settings: StrictPrivacySettings;
  readonly verification_status: StrictVerificationStatus;
  readonly created_at: string; // ISO timestamp
  readonly updated_at: string; // ISO timestamp
}

export interface StrictPrivacySettings {
  readonly profileVisibilityLevel: 0 | 1 | 2; // 0=public, 1=moderate, 2=private
  readonly showAge: boolean;
  readonly showLocation: boolean;
  readonly showOccupation: boolean;
  readonly allowNonMatchMessages: boolean;
}

export interface StrictVerificationStatus {
  readonly email: boolean;
  readonly phone: boolean;
  readonly id: boolean;
  readonly wali: boolean;
}

// Enhanced message types
export interface StrictMessage {
  readonly id: DatabaseId;
  readonly conversation_id: DatabaseId;
  readonly sender_id: DatabaseId;
  readonly content: string;
  readonly created_at: string; // ISO timestamp
  readonly is_read: boolean;
  readonly attachments: readonly string[];
  readonly is_wali_visible: boolean;
  readonly encrypted: boolean;
  readonly content_flags: readonly StrictContentFlag[];
}

export interface StrictContentFlag {
  readonly id: DatabaseId;
  readonly flag_type: 'inappropriate' | 'spam' | 'harassment' | 'other';
  readonly severity: 'low' | 'medium' | 'high';
  readonly flagged_by: DatabaseId;
  readonly created_at: string; // ISO timestamp
  readonly resolved: boolean;
}

// Enhanced conversation types
export interface StrictConversation {
  readonly id: DatabaseId;
  readonly participants: readonly DatabaseId[];
  readonly wali_supervised: boolean;
  readonly encryption_enabled: boolean;
  readonly created_at: string; // ISO timestamp
  readonly last_message?: StrictMessage;
}

// Enhanced compatibility types
export interface StrictCompatibilityResult {
  readonly id: DatabaseId;
  readonly user_id: DatabaseId;
  readonly score: number; // 0-100
  readonly answers: Record<string, StrictAnswerValue>;
  readonly preferences: StrictUserPreferences;
  readonly dealbreakers: readonly string[];
  readonly created_at: string; // ISO timestamp
}

export interface StrictAnswerValue {
  readonly value: number;
  readonly weight: number;
  readonly isBreaker: boolean;
  readonly breakerThreshold?: number;
}

export interface StrictUserPreferences {
  readonly categories: readonly StrictCategoryPreference[];
  readonly dealbreakers: readonly string[];
  readonly minCompatibilityScore: number;
}

export interface StrictCategoryPreference {
  readonly category: string;
  readonly weight: number; // 0-1
}

// Enhanced API response types
export interface StrictApiResponse<T> {
  readonly data: T | null;
  readonly error: string | null;
  readonly success: boolean;
  readonly timestamp: string; // ISO timestamp
}

export interface StrictPaginatedResponse<T> {
  readonly data: readonly T[];
  readonly pagination: StrictPaginationInfo;
  readonly error: string | null;
}

export interface StrictPaginationInfo {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

// Form validation types
export interface StrictFormValidation<T> {
  readonly isValid: boolean;
  readonly errors: Partial<Record<keyof T, string>>;
  readonly warnings: Partial<Record<keyof T, string>>;
}

// Enhanced error types
export interface StrictErrorInfo {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string; // ISO timestamp
  readonly userId?: DatabaseId;
  readonly sessionId?: string;
}
