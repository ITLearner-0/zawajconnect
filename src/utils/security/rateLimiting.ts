interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  requests: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(identifier, {
        requests: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (entry.requests >= config.maxRequests) {
      return false;
    }

    entry.requests++;
    this.limits.set(identifier, entry);
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Cleanup old entries every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

// Rate limit configurations
export const RATE_LIMITS = {
  PROFILE_UPDATE: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  MESSAGE_SEND: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 messages per minute
  SEARCH_QUERY: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 searches per minute
  CHAT_REQUEST: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 chat requests per minute
} as const;

export const checkRateLimit = (identifier: string, action: keyof typeof RATE_LIMITS): boolean => {
  return rateLimiter.isAllowed(identifier, RATE_LIMITS[action]);
};
