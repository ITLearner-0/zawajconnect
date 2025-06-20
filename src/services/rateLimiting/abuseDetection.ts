
import { AbuseDetectionResult, UserPatterns, RateLimitStateEntry } from './types';

export class AbuseDetectionService {
  async analyzeUserPatterns(userId: string, rateLimitStore: Map<string, RateLimitStateEntry>): Promise<UserPatterns> {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    let requestsInLastMinute = 0;
    let requestsInLastHour = 0;
    let distinctEndpoints = new Set<string>();
    let failedAuthAttempts = 0;

    // Analyze in-memory data
    for (const [key, data] of rateLimitStore.entries()) {
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

  async detectAbuse(userId: string, endpoint: string, requestData: any, rateLimitStore: Map<string, RateLimitStateEntry>): Promise<AbuseDetectionResult> {
    const patterns = await this.analyzeUserPatterns(userId, rateLimitStore);
    
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
}
