
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitState {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockUntil: number;
}

export interface AbuseLog {
  endpoint: string;
  timestamp: string;
  userAgent: string;
  ip: string;
  requestData: string | null;
}
