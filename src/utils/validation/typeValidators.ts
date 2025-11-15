// Runtime type validators for improved type safety

import {
  DatabaseId,
  EmailAddress,
  PhoneNumber,
  isValidUuid,
  isValidEmail,
  isValidPhoneNumber,
} from '@/types/typeUtils';
import {
  StrictProfileData,
  StrictMessage,
  StrictConversation,
  StrictCompatibilityResult,
  StrictPrivacySettings,
  StrictVerificationStatus,
} from '@/types/strictTypes';

// Profile data validator
export const validateProfileData = (data: unknown): data is StrictProfileData => {
  if (!data || typeof data !== 'object') return false;

  const profile = data as any;

  return (
    isValidUuid(profile.id) &&
    typeof profile.first_name === 'string' &&
    (profile.last_name === null || typeof profile.last_name === 'string') &&
    isValidEmail(profile.email) &&
    typeof profile.birth_date === 'string' &&
    (profile.gender === 'male' || profile.gender === 'female') &&
    validatePrivacySettings(profile.privacy_settings) &&
    validateVerificationStatus(profile.verification_status)
  );
};

// Privacy settings validator
export const validatePrivacySettings = (data: unknown): data is StrictPrivacySettings => {
  if (!data || typeof data !== 'object') return false;

  const settings = data as any;

  return (
    typeof settings.profileVisibilityLevel === 'number' &&
    [0, 1, 2].includes(settings.profileVisibilityLevel) &&
    typeof settings.showAge === 'boolean' &&
    typeof settings.showLocation === 'boolean' &&
    typeof settings.showOccupation === 'boolean' &&
    typeof settings.allowNonMatchMessages === 'boolean'
  );
};

// Verification status validator
export const validateVerificationStatus = (data: unknown): data is StrictVerificationStatus => {
  if (!data || typeof data !== 'object') return false;

  const status = data as any;

  return (
    typeof status.email === 'boolean' &&
    typeof status.phone === 'boolean' &&
    typeof status.id === 'boolean' &&
    typeof status.wali === 'boolean'
  );
};

// Message validator
export const validateMessage = (data: unknown): data is StrictMessage => {
  if (!data || typeof data !== 'object') return false;

  const message = data as any;

  return (
    isValidUuid(message.id) &&
    isValidUuid(message.conversation_id) &&
    isValidUuid(message.sender_id) &&
    typeof message.content === 'string' &&
    typeof message.created_at === 'string' &&
    typeof message.is_read === 'boolean' &&
    Array.isArray(message.attachments) &&
    typeof message.is_wali_visible === 'boolean' &&
    typeof message.encrypted === 'boolean'
  );
};

// Conversation validator
export const validateConversation = (data: unknown): data is StrictConversation => {
  if (!data || typeof data !== 'object') return false;

  const conversation = data as any;

  return (
    isValidUuid(conversation.id) &&
    Array.isArray(conversation.participants) &&
    conversation.participants.every((p: unknown) => isValidUuid(p)) &&
    typeof conversation.wali_supervised === 'boolean' &&
    typeof conversation.encryption_enabled === 'boolean' &&
    typeof conversation.created_at === 'string'
  );
};

// Compatibility result validator
export const validateCompatibilityResult = (data: unknown): data is StrictCompatibilityResult => {
  if (!data || typeof data !== 'object') return false;

  const result = data as any;

  return (
    isValidUuid(result.id) &&
    isValidUuid(result.user_id) &&
    typeof result.score === 'number' &&
    result.score >= 0 &&
    result.score <= 100 &&
    typeof result.answers === 'object' &&
    typeof result.preferences === 'object' &&
    Array.isArray(result.dealbreakers) &&
    typeof result.created_at === 'string'
  );
};

// Generic array validator
export const validateArray = <T>(
  data: unknown,
  itemValidator: (item: unknown) => item is T
): data is T[] => {
  return Array.isArray(data) && data.every(itemValidator);
};

// API response validator
export const validateApiResponse = <T>(
  data: unknown,
  dataValidator: (item: unknown) => item is T
): data is { data: T | null; error: string | null; success: boolean } => {
  if (!data || typeof data !== 'object') return false;

  const response = data as any;

  return (
    (response.data === null || dataValidator(response.data)) &&
    (response.error === null || typeof response.error === 'string') &&
    typeof response.success === 'boolean'
  );
};
