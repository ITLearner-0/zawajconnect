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

export interface UserPatterns {
  requestsInLastMinute: number;
  requestsInLastHour: number;
  distinctEndpointsHit: number;
  failedAuthAttempts: number;
}

export interface RateLimitStateEntry {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}
