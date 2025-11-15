// Validation utilities for better data integrity
export const validators = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // URL validation
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Check if value is within range
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  // Check if string is not empty after trimming
  isNonEmptyString: (value: string): boolean => {
    return typeof value === 'string' && value.trim().length > 0;
  },

  // Validate compatibility score
  isValidCompatibilityScore: (score: number): boolean => {
    return validators.isInRange(score, 0, 100);
  },

  // Check if array has items
  hasItems: <T>(array: T[]): boolean => {
    return Array.isArray(array) && array.length > 0;
  },
};
