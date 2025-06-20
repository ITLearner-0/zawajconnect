
import { RateLimitResult, AbuseDetectionResult } from './types';
import { RateLimitCore } from './core';

class RateLimitingService {
  private core = new RateLimitCore();

  async checkRateLimit(userId: string, endpoint: string): Promise<RateLimitResult> {
    return this.core.checkRateLimit(userId, endpoint);
  }

  async detectAbuse(userId: string, endpoint: string, requestData?: any): Promise<AbuseDetectionResult> {
    return this.core.detectAbuse(userId, endpoint, requestData);
  }

  async blockUser(userId: string, durationMs: number, reason: string): Promise<void> {
    return this.core.blockUser(userId, durationMs, reason);
  }

  async unblockUser(userId: string): Promise<void> {
    return this.core.unblockUser(userId);
  }

  getStats(): { totalKeys: number; blockedUsers: number } {
    return this.core.getStats();
  }
}

export const rateLimitingService = new RateLimitingService();

// Re-export types and config for backward compatibility
export type { RateLimitConfig, RateLimitResult, AbuseDetectionResult } from './types';
export { DEFAULT_RATE_LIMITS } from './config';
