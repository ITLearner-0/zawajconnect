// Type utility functions for better type safety across the app

// Strict utility types
export type StrictRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type StrictPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type NonEmptyArray<T> = [T, ...T[]];

// Database field validation types
export type DatabaseId = string & { readonly __brand: unique symbol };
export type EmailAddress = string & { readonly __brand: unique symbol };
export type PhoneNumber = string & { readonly __brand: unique symbol };

// Type guards for runtime validation
export const isValidUuid = (value: unknown): value is DatabaseId => {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
};

export const isValidEmail = (value: unknown): value is EmailAddress => {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isValidPhoneNumber = (value: unknown): value is PhoneNumber => {
  return typeof value === 'string' && /^\+?[\d\s\-\(\)]+$/.test(value);
};

// Safe type assertion helpers
export const assertDefined = <T>(value: T | null | undefined, errorMessage?: string): T => {
  if (value === null || value === undefined) {
    throw new Error(errorMessage || 'Value is null or undefined');
  }
  return value;
};

export const assertIsArray = <T>(value: unknown, errorMessage?: string): value is T[] => {
  if (!Array.isArray(value)) {
    throw new Error(errorMessage || 'Value is not an array');
  }
  return true;
};

// API response type guards
export const isApiError = (response: unknown): response is { error: string } => {
  return typeof response === 'object' && response !== null && 'error' in response;
};

export const isApiSuccess = <T>(response: unknown): response is { data: T; success: true } => {
  return (
    typeof response === 'object' && response !== null && 'data' in response && 'success' in response
  );
};
