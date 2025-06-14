
import { supabase } from '@/integrations/supabase/client';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after limit exceeded
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

export interface AbuseDetectionResult {
  isAbusive: boolean;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  recommendedAction: 'warn' | 'throttle' | 'block';
}

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

class RateLimitingService {
  private inMemoryStore = new Map<string, { count: number; windowStart: number; blockedUntil?: number }>();

  private getKey(userId: string, endpoint: string): string {
    return `${userId}:${endpoint}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, data] of this.inMemoryStore.entries()) {
      // Clean up expired windows and blocks
      if (data.blockedUntil && data.blockedUntil < now) {
        this.inMemoryStore.delete(key);
      } else if (!data.blockedUntil && (now - data.windowStart) > 24 * 60 * 60 * 1000) {
        // Clean up old windows after 24 hours
        this.inMemoryStore.delete(key);
      }
    }
  }

  async checkRateLimit(userId: string, endpoint: string): Promise<RateLimitResult> {
    this.cleanupExpiredEntries();

    const config = DEFAULT_RATE_LIMITS[endpoint] || DEFAULT_RATE_LIMITS['api/general'];
    const key = this.getKey(userId, endpoint);
    const now = Date.now();

    let data = this.inMemoryStore.get(key);

    // Check if user is currently blocked
    if (data?.blockedUntil && data.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.blockedUntil,
        blocked: true,
        blockUntil: data.blockedUntil
      };
    }

    // Initialize or reset window if expired
    if (!data || (now - data.windowStart) >= config.windowMs) {
      data = {
        count: 0,
        windowStart: now
      };
      this.inMemoryStore.set(key, data);
    }

    // Check if limit exceeded
    if (data.count >= config.maxRequests) {
      // Block user if block duration is configured
      if (config.blockDurationMs) {
        data.blockedUntil = now + config.blockDurationMs;
        this.inMemoryStore.set(key, data);

        // Log rate limit violation
        this.logRateLimitViolation(userId, endpoint, 'rate_limit_exceeded');

        return {
          allowed: false,
          remaining: 0,
          resetTime: data.windowStart + config.windowMs,
          blocked: true,
          blockUntil: data.blockedUntil
        };
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: data.windowStart + config.windowMs,
        blocked: false
      };
    }

    // Increment counter and allow request
    data.count++;
    this.inMemoryStore.set(key, data);

    return {
      allowed: true,
      remaining: config.maxRequests - data.count,
      resetTime: data.windowStart + config.windowMs,
      blocked: false
    };
  }

  async detectAbuse(userId: string, endpoint: string, requestData?: any): Promise<AbuseDetectionResult> {
    const patterns = await this.analyzeUserPatterns(userId);
    
    // Check for various abuse patterns
    if (patterns.requestsInLastHour > 500) {
      return {
        isAbusive: true,
        severity: 'high',
        reason: 'Excessive API usage detected',
        recommendedAction: 'block'
      };
    }

    if (patterns.distinctEndpointsHit > 20 && patterns.requestsInLastMinute > 50) {
      return {
        isAbusive: true,
        severity: 'medium',
        reason: 'Suspicious automation detected',
        recommendedAction: 'throttle'
      };
    }

    if (patterns.failedAuthAttempts > 10) {
      return {
        isAbusive: true,
        severity: 'medium',
        reason: 'Multiple authentication failures',
        recommendedAction: 'block'
      };
    }

    // Check for content-specific abuse
    if (requestData && this.detectSuspiciousContent(requestData)) {
      return {
        isAbusive: true,
        severity: 'low',
        reason: 'Suspicious content patterns',
        recommendedAction: 'warn'
      };
    }

    return {
      isAbusive: false,
      severity: 'low',
      reason: 'Normal usage pattern',
      recommendedAction: 'warn'
    };
  }

  private async analyzeUserPatterns(userId: string): Promise<{
    requestsInLastMinute: number;
    requestsInLastHour: number;
    distinctEndpointsHit: number;
    failedAuthAttempts: number;
  }> {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    let requestsInLastMinute = 0;
    let requestsInLastHour = 0;
    let distinctEndpoints = new Set<string>();
    let failedAuthAttempts = 0;

    // Analyze in-memory data
    for (const [key, data] of this.inMemoryStore.entries()) {
      if (key.startsWith(`${userId}:`)) {
        const endpoint = key.split(':')[1];
        distinctEndpoints.add(endpoint);

        if (data.windowStart >= oneMinuteAgo) {
          requestsInLastMinute += data.count;
        }
        if (data.windowStart >= oneHourAgo) {
          requestsInLastHour += data.count;
        }

        // Count failed auth attempts
        if (endpoint.includes('auth') && data.blockedUntil) {
          failedAuthAttempts++;
        }
      }
    }

    return {
      requestsInLastMinute,
      requestsInLastHour,
      distinctEndpointsHit: distinctEndpoints.size,
      failedAuthAttempts
    };
  }

  private detectSuspiciousContent(data: any): boolean {
    if (typeof data === 'string') {
      // Check for suspicious patterns in text
      const suspiciousPatterns = [
        /script|javascript|eval|function/i,
        /select.*from|insert.*into|delete.*from/i,
        /\<\s*script|\<\s*iframe/i
      ];

      return suspiciousPatterns.some(pattern => pattern.test(data));
    }

    if (typeof data === 'object' && data !== null) {
      // Check for suspicious object patterns
      const jsonString = JSON.stringify(data);
      return this.detectSuspiciousContent(jsonString);
    }

    return false;
  }

  private async logRateLimitViolation(userId: string, endpoint: string, violationType: string): Promise<void> {
    try {
      // In a real implementation, you'd store this in a dedicated table
      console.warn('Rate limit violation:', {
        userId,
        endpoint,
        violationType,
        timestamp: new Date().toISOString()
      });

      // You could also send this to your monitoring service
    } catch (error) {
      console.error('Failed to log rate limit violation:', error);
    }
  }

  async blockUser(userId: string, durationMs: number, reason: string): Promise<void> {
    const now = Date.now();
    const blockUntil = now + durationMs;

    // Block user across all endpoints
    for (const endpoint of Object.keys(DEFAULT_RATE_LIMITS)) {
      const key = this.getKey(userId, endpoint);
      this.inMemoryStore.set(key, {
        count: 999,
        windowStart: now,
        blockedUntil: blockUntil
      });
    }

    console.warn('User blocked:', { userId, reason, blockUntil: new Date(blockUntil) });
  }

  async unblockUser(userId: string): Promise<void> {
    // Remove all blocks for the user
    for (const [key] of this.inMemoryStore.entries()) {
      if (key.startsWith(`${userId}:`)) {
        this.inMemoryStore.delete(key);
      }
    }

    console.info('User unblocked:', { userId });
  }

  getStats(): { totalKeys: number; blockedUsers: number } {
    this.cleanupExpiredEntries();
    
    const totalKeys = this.inMemoryStore.size;
    const blockedUsers = new Set(
      Array.from(this.inMemoryStore.entries())
        .filter(([, data]) => data.blockedUntil && data.blockedUntil > Date.now())
        .map(([key]) => key.split(':')[0])
    ).size;

    return { totalKeys, blockedUsers };
  }
}

export const rateLimitingService = new RateLimitingService();
