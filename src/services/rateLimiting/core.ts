
import { RateLimitConfig, RateLimitResult, RateLimitStateEntry } from './types';
import { DEFAULT_RATE_LIMITS } from './config';
import { MemoryStore } from './memoryStore';
import { AbuseDetectionService } from './abuseDetection';

export class RateLimitCore {
  private memoryStore = new MemoryStore();
  private abuseDetection = new AbuseDetectionService();

  async checkRateLimit(userId: string, endpoint: string): Promise<RateLimitResult> {
    this.memoryStore.cleanupExpiredEntries();

    const config = DEFAULT_RATE_LIMITS[endpoint] || DEFAULT_RATE_LIMITS['api/general'];
    if (!config) {
      throw new Error('Rate limit configuration not found');
    }
    
    const key = this.memoryStore.getKey(userId, endpoint);
    const now = Date.now();

    let data = this.memoryStore.get(key);

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
      this.memoryStore.set(key, data);
    }

    // Check if limit exceeded
    if (data.count >= config.maxRequests) {
      // Block user if block duration is configured
      if (config.blockDurationMs) {
        data.blockedUntil = now + config.blockDurationMs;
        this.memoryStore.set(key, data);

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
    this.memoryStore.set(key, data);

    return {
      allowed: true,
      remaining: config.maxRequests - data.count,
      resetTime: data.windowStart + config.windowMs,
      blocked: false
    };
  }

  async detectAbuse(userId: string, endpoint: string, requestData?: any) {
    return this.abuseDetection.detectAbuse(userId, endpoint, requestData, new Map(this.memoryStore.entries()));
  }

  async blockUser(userId: string, durationMs: number, reason: string): Promise<void> {
    const now = Date.now();
    const blockUntil = now + durationMs;

    // Block user across all endpoints
    for (const endpoint of Object.keys(DEFAULT_RATE_LIMITS)) {
      const key = this.memoryStore.getKey(userId, endpoint);
      this.memoryStore.set(key, {
        count: 999,
        windowStart: now,
        blockedUntil: blockUntil
      });
    }

    console.warn('User blocked:', { userId, reason, blockUntil: new Date(blockUntil) });
  }

  async unblockUser(userId: string): Promise<void> {
    // Remove all blocks for the user
    const userKeys = this.memoryStore.getUserKeys(userId);
    for (const key of userKeys) {
      this.memoryStore.delete(key);
    }

    console.info('User unblocked:', { userId });
  }

  getStats(): { totalKeys: number; blockedUsers: number } {
    this.memoryStore.cleanupExpiredEntries();
    
    const totalKeys = this.memoryStore.size();
    const blockedUsers = this.memoryStore.getBlockedUsers().size;

    return { totalKeys, blockedUsers };
  }

  private logRateLimitViolation(userId: string, endpoint: string, violationType: string): void {
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
}
