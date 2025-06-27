
import { AbuseDetectionResult, UserPatterns, RateLimitStateEntry } from './types';

export class AbuseDetectionService {
  detectAbuse(
    userId: string, 
    endpoint: string, 
    requestData: any,
    rateLimitState: Map<string, RateLimitStateEntry>
  ): AbuseDetectionResult {
    const patterns = this.analyzeUserPatterns(userId, rateLimitState);
    
    // Check for various abuse patterns
    const checks = [
      this.checkRapidFireRequests(patterns),
      this.checkDistributedAttack(patterns),
      this.checkSuspiciousContent(requestData),
      this.checkTimeBasedPatterns(patterns)
    ];

    // Find the highest severity issue
    const highestSeverity = checks.reduce((highest, current) => {
      const severityOrder = { low: 0, medium: 1, high: 2 };
      return severityOrder[current.severity] > severityOrder[highest.severity] ? current : highest;
    });

    return highestSeverity;
  }

  private analyzeUserPatterns(userId: string, rateLimitState: Map<string, RateLimitStateEntry>): UserPatterns {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    let requestsInLastMinute = 0;
    let requestsInLastHour = 0;
    let distinctEndpoints = new Set<string>();
    let failedAuthAttempts = 0;

    for (const [key, entry] of rateLimitState.entries()) {
      if (!key.startsWith(`${userId}:`)) continue;

      const endpoint = key.split(':')[1];
      distinctEndpoints.add(endpoint);

      if (now - entry.windowStart < oneMinute) {
        requestsInLastMinute += entry.count;
      }
      if (now - entry.windowStart < oneHour) {
        requestsInLastHour += entry.count;
      }

      if (endpoint.includes('auth') && entry.count > 3) {
        failedAuthAttempts += entry.count;
      }
    }

    return {
      requestsInLastMinute,
      requestsInLastHour,
      distinctEndpointsHit: distinctEndpoints.size,
      failedAuthAttempts
    };
  }

  private checkRapidFireRequests(patterns: UserPatterns): AbuseDetectionResult {
    if (patterns.requestsInLastMinute > 100) {
      return {
        isAbusive: true,
        severity: 'high',
        reason: 'Rapid fire requests detected',
        recommendedAction: 'block'
      };
    }
    
    if (patterns.requestsInLastMinute > 50) {
      return {
        isAbusive: true,
        severity: 'medium',
        reason: 'High request rate detected',
        recommendedAction: 'throttle'
      };
    }

    return {
      isAbusive: false,
      severity: 'low',
      reason: 'Normal request pattern',
      recommendedAction: 'warn'
    };
  }

  private checkDistributedAttack(patterns: UserPatterns): AbuseDetectionResult {
    if (patterns.distinctEndpointsHit > 10 && patterns.requestsInLastMinute > 30) {
      return {
        isAbusive: true,
        severity: 'high',
        reason: 'Distributed attack pattern detected',
        recommendedAction: 'block'
      };
    }

    return {
      isAbusive: false,
      severity: 'low',
      reason: 'Normal endpoint usage',
      recommendedAction: 'warn'
    };
  }

  private checkSuspiciousContent(requestData: any): AbuseDetectionResult {
    if (!requestData) {
      return {
        isAbusive: false,
        severity: 'low',
        reason: 'No request data to analyze',
        recommendedAction: 'warn'
      };
    }

    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /union\s+select/i,
      /drop\s+table/i
    ];

    const content = JSON.stringify(requestData).toLowerCase();
    const foundPattern = suspiciousPatterns.some(pattern => pattern.test(content));

    if (foundPattern) {
      return {
        isAbusive: true,
        severity: 'high',
        reason: 'Suspicious content detected in request',
        recommendedAction: 'block'
      };
    }

    return {
      isAbusive: false,
      severity: 'low',
      reason: 'Content appears normal',
      recommendedAction: 'warn'
    };
  }

  private checkTimeBasedPatterns(patterns: UserPatterns): AbuseDetectionResult {
    // Check for failed authentication attempts
    if (patterns.failedAuthAttempts > 10) {
      return {
        isAbusive: true,
        severity: 'high',
        reason: 'Multiple failed authentication attempts',
        recommendedAction: 'block'
      };
    }

    if (patterns.failedAuthAttempts > 5) {
      return {
        isAbusive: true,
        severity: 'medium',
        reason: 'Suspicious authentication pattern',
        recommendedAction: 'throttle'
      };
    }

    return {
      isAbusive: false,
      severity: 'low',
      reason: 'Normal authentication pattern',
      recommendedAction: 'warn'
    };
  }
}
