import { RateLimitConfig } from './types';

// Default rate limit configurations for different endpoints
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  'auth/signin': { windowMs: 15 * 60 * 1000, maxRequests: 5, blockDurationMs: 30 * 60 * 1000 }, // 5 attempts per 15 min
  'auth/signup': { windowMs: 60 * 60 * 1000, maxRequests: 3, blockDurationMs: 60 * 60 * 1000 }, // 3 attempts per hour
  'auth/reset-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 },

  // API endpoints
  'api/compatibility': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  'api/messages': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 messages per minute
  'api/profile': { windowMs: 60 * 1000, maxRequests: 20 }, // 20 profile updates per minute
  'api/search': { windowMs: 60 * 1000, maxRequests: 15 }, // 15 searches per minute

  // File upload endpoints
  'api/upload': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 uploads per minute

  // General API
  'api/general': { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
};
