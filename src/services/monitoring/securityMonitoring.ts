import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'suspicious_activity' | 'rate_limit' | 'xss_attempt' | 'sql_injection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  details: Record<string, any>;
  ip?: string;
  userAgent?: string;
  url?: string;
}

interface ThreatIntelligence {
  knownMaliciousIPs: Set<string>;
  suspiciousPatterns: RegExp[];
  lastUpdated: Date;
}

class SecurityMonitoringService {
  private events: SecurityEvent[] = [];
  private threatIntel: ThreatIntelligence = {
    knownMaliciousIPs: new Set(),
    suspiciousPatterns: [
      /\b(select|insert|update|delete|drop|create|alter)\b.*?\b(from|into|table|database)\b/i,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:\s*[^;]/gi,
      /on\w+\s*=\s*['"]/gi
    ],
    lastUpdated: new Date()
  };

  private alertThresholds = {
    failed_logins: 5,
    suspicious_requests: 10,
    rate_limit_violations: 3,
    xss_attempts: 1,
    sql_injection_attempts: 1
  };

  // Log security event
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.events.push(securityEvent);
    this.processSecurityEvent(securityEvent);
    this.persistEvent(securityEvent);

    console.group(`🔒 Security Event [${securityEvent.severity.toUpperCase()}]`);
    console.log('Type:', securityEvent.type);
    console.log('Details:', securityEvent.details);
    console.log('Timestamp:', securityEvent.timestamp);
    console.groupEnd();
  }

  // Process and analyze security event
  private processSecurityEvent(event: SecurityEvent): void {
    // Check for patterns and escalate if needed
    this.checkForPatterns(event);
    
    // Trigger alerts for critical events
    if (event.severity === 'critical') {
      this.triggerCriticalAlert(event);
    }

    // Update threat intelligence
    this.updateThreatIntel(event);
  }

  // Check for attack patterns
  private checkForPatterns(event: SecurityEvent): void {
    const recentEvents = this.getRecentEvents(5 * 60 * 1000); // Last 5 minutes
    
    // Check for brute force attempts
    if (event.type === 'authentication') {
      const failedLogins = recentEvents.filter(e => 
        e.type === 'authentication' && 
        e.details.success === false &&
        e.userId === event.userId
      ).length;

      if (failedLogins >= this.alertThresholds.failed_logins) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          details: {
            pattern: 'brute_force_attempt',
            failed_attempts: failedLogins,
            target_user: event.userId
          }
        });
      }
    }

    // Check for rapid requests (potential DDoS)
    const rapidRequests = recentEvents.filter(e => 
      e.ip === event.ip && 
      e.timestamp.getTime() > Date.now() - 60000 // Last minute
    ).length;

    if (rapidRequests >= this.alertThresholds.suspicious_requests) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        details: {
          pattern: 'rapid_requests',
          request_count: rapidRequests,
          ip: event.ip
        }
      });
    }
  }

  // Trigger critical security alert
  private triggerCriticalAlert(event: SecurityEvent): void {
    // Show immediate user notification
    toast.error('Alerte de sécurité critique', {
      description: 'Une activité suspecte a été détectée',
      duration: 10000
    });

    // Log to console for immediate visibility
    console.error('🚨 CRITICAL SECURITY ALERT 🚨', event);

    // In production, would send to security team
    this.notifySecurityTeam(event);
  }

  // Notify security team (mock implementation)
  private notifySecurityTeam(event: SecurityEvent): void {
    console.log('📧 Security team notification sent for event:', event.id);
    
    // In production:
    // - Send email/Slack notification
    // - Create incident ticket
    // - Trigger automated response
  }

  // Update threat intelligence
  private updateThreatIntel(event: SecurityEvent): void {
    if (event.ip && (event.severity === 'high' || event.severity === 'critical')) {
      this.threatIntel.knownMaliciousIPs.add(event.ip);
    }
  }

  // Get recent events
  private getRecentEvents(timeframe: number): SecurityEvent[] {
    const cutoff = Date.now() - timeframe;
    return this.events.filter(event => event.timestamp.getTime() >= cutoff);
  }

  // Check if IP is suspicious
  isIPSuspicious(ip: string): boolean {
    return this.threatIntel.knownMaliciousIPs.has(ip);
  }

  // Check content for threats
  analyzeContent(content: string): { isThreat: boolean; threats: string[] } {
    const threats: string[] = [];

    this.threatIntel.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        threats.push(`Pattern ${index + 1} matched`);
      }
    });

    return {
      isThreat: threats.length > 0,
      threats
    };
  }

  // Generate security report
  generateSecurityReport(): {
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    eventsByType: Record<string, number>;
    recentCriticalEvents: SecurityEvent[];
    threatSummary: string;
  } {
    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentCriticalEvents = this.getRecentEvents(24 * 60 * 60 * 1000)
      .filter(event => event.severity === 'critical')
      .slice(-10);

    const threatSummary = this.generateThreatSummary();

    return {
      totalEvents: this.events.length,
      eventsBySeverity,
      eventsByType,
      recentCriticalEvents,
      threatSummary
    };
  }

  // Generate threat summary
  private generateThreatSummary(): string {
    const recentEvents = this.getRecentEvents(24 * 60 * 60 * 1000);
    const criticalCount = recentEvents.filter(e => e.severity === 'critical').length;
    const highCount = recentEvents.filter(e => e.severity === 'high').length;

    if (criticalCount > 0) {
      return `Niveau de menace CRITIQUE: ${criticalCount} événements critiques détectés`;
    } else if (highCount > 5) {
      return `Niveau de menace ÉLEVÉ: ${highCount} événements à risque détectés`;
    } else if (highCount > 0) {
      return `Niveau de menace MOYEN: ${highCount} événements à surveiller`;
    } else {
      return 'Niveau de menace FAIBLE: Aucun événement critique récent';
    }
  }

  // Persist event to storage
  private persistEvent(event: SecurityEvent): void {
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push({
        ...event,
        timestamp: event.timestamp.toISOString()
      });
      
      // Keep only last 1000 events
      const recentEvents = events.slice(-1000);
      localStorage.setItem('security_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to persist security event:', error);
    }
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear old events
  cleanup(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp.getTime() >= oneDayAgo);
  }
}

export const securityMonitoring = new SecurityMonitoringService();

// Helper functions for common security events
export const logAuthenticationAttempt = (success: boolean, userId?: string, details?: any) => {
  securityMonitoring.logSecurityEvent({
    type: 'authentication',
    severity: success ? 'low' : 'medium',
    userId,
    details: { success, ...details }
  });
};

export const logDataAccess = (resource: string, userId?: string, authorized: boolean = true) => {
  securityMonitoring.logSecurityEvent({
    type: 'data_access',
    severity: authorized ? 'low' : 'high',
    userId,
    details: { resource, authorized }
  });
};

export const logSuspiciousActivity = (activity: string, details?: any) => {
  securityMonitoring.logSecurityEvent({
    type: 'suspicious_activity',
    severity: 'medium',
    details: { activity, ...details }
  });
};

export const logXSSAttempt = (content: string, userId?: string) => {
  securityMonitoring.logSecurityEvent({
    type: 'xss_attempt',
    severity: 'critical',
    userId,
    details: { attempted_content: content.substring(0, 100) }
  });
};

export const logSQLInjectionAttempt = (query: string, userId?: string) => {
  securityMonitoring.logSecurityEvent({
    type: 'sql_injection',
    severity: 'critical',
    userId,
    details: { attempted_query: query.substring(0, 100) }
  });
};
