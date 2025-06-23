// Suspicious activity detection system
import { supabase } from '@/integrations/supabase/client';

export interface ActivityPattern {
  userId: string;
  actionType: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface ThreatLevel {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  reasons: string[];
}

export class SuspiciousActivityDetector {
  private static readonly ACTIVITY_BUFFER_SIZE = 100;
  private static readonly ANALYSIS_WINDOW = 60 * 60 * 1000; // 1 hour
  private static activityBuffer: ActivityPattern[] = [];

  // Record user activity
  static recordActivity(userId: string, actionType: string, metadata: Record<string, any> = {}) {
    const activity: ActivityPattern = {
      userId,
      actionType,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      }
    };

    this.activityBuffer.push(activity);
    
    // Keep buffer size manageable
    if (this.activityBuffer.length > this.ACTIVITY_BUFFER_SIZE) {
      this.activityBuffer.shift();
    }

    // Analyze activity in real-time
    this.analyzeActivity(userId);
  }

  // Analyze user activity for suspicious patterns
  private static analyzeActivity(userId: string): void {
    const userActivities = this.getUserActivities(userId);
    const threatLevel = this.assessThreatLevel(userActivities);

    if (threatLevel.level === 'high' || threatLevel.level === 'critical') {
      this.handleSuspiciousActivity(userId, threatLevel);
    }
  }

  // Get recent activities for a user
  private static getUserActivities(userId: string): ActivityPattern[] {
    const now = Date.now();
    const windowStart = now - this.ANALYSIS_WINDOW;

    return this.activityBuffer.filter(activity => 
      activity.userId === userId && 
      activity.timestamp >= windowStart
    );
  }

  // Assess threat level based on activity patterns
  private static assessThreatLevel(activities: ActivityPattern[]): ThreatLevel {
    let score = 0;
    const reasons: string[] = [];

    // Check for rapid successive actions
    const rapidActions = this.detectRapidActions(activities);
    if (rapidActions > 10) {
      score += 30;
      reasons.push(`Rapid actions detected: ${rapidActions} actions in short time`);
    }

    // Check for unusual access patterns
    const unusualPatterns = this.detectUnusualPatterns(activities);
    score += unusualPatterns.score;
    reasons.push(...unusualPatterns.reasons);

    // Check for multiple failed attempts
    const failedAttempts = activities.filter(a => a.actionType.includes('failed')).length;
    if (failedAttempts > 5) {
      score += 25;
      reasons.push(`Multiple failed attempts: ${failedAttempts}`);
    }

    // Check for suspicious metadata
    const suspiciousMetadata = this.analyzeSuspiciousMetadata(activities);
    score += suspiciousMetadata.score;
    reasons.push(...suspiciousMetadata.reasons);

    // Determine threat level
    let level: ThreatLevel['level'] = 'low';
    if (score >= 80) level = 'critical';
    else if (score >= 60) level = 'high';
    else if (score >= 40) level = 'medium';

    return { level, score, reasons };
  }

  // Detect rapid successive actions
  private static detectRapidActions(activities: ActivityPattern[]): number {
    if (activities.length < 2) return 0;

    let rapidCount = 0;
    const threshold = 1000; // 1 second

    for (let i = 1; i < activities.length; i++) {
      const timeDiff = activities[i].timestamp - activities[i - 1].timestamp;
      if (timeDiff < threshold) {
        rapidCount++;
      }
    }

    return rapidCount;
  }

  // Detect unusual access patterns
  private static detectUnusualPatterns(activities: ActivityPattern[]): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Check for access from multiple locations
    const userAgents = new Set(activities.map(a => a.metadata.userAgent));
    if (userAgents.size > 3) {
      score += 20;
      reasons.push(`Multiple user agents: ${userAgents.size}`);
    }

    // Check for unusual time patterns
    const hours = activities.map(a => new Date(a.timestamp).getHours());
    const nightActivity = hours.filter(h => h < 6 || h > 23).length;
    if (nightActivity > activities.length * 0.8) {
      score += 15;
      reasons.push('Unusual time patterns detected');
    }

    return { score, reasons };
  }

  // Analyze suspicious metadata
  private static analyzeSuspiciousMetadata(activities: ActivityPattern[]): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    activities.forEach(activity => {
      // Check for suspicious referrers
      if (activity.metadata.referrer && this.isSuspiciousReferrer(activity.metadata.referrer)) {
        score += 10;
        reasons.push('Suspicious referrer detected');
      }

      // Check for bot-like user agents
      if (activity.metadata.userAgent && this.isBotUserAgent(activity.metadata.userAgent)) {
        score += 25;
        reasons.push('Bot-like user agent detected');
      }
    });

    return { score, reasons };
  }

  // Check if referrer is suspicious
  private static isSuspiciousReferrer(referrer: string): boolean {
    const suspiciousDomains = ['malware', 'phishing', 'spam', 'bot'];
    return suspiciousDomains.some(domain => referrer.toLowerCase().includes(domain));
  }

  // Check if user agent indicates a bot
  private static isBotUserAgent(userAgent: string): boolean {
    const botIndicators = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'];
    return botIndicators.some(indicator => userAgent.toLowerCase().includes(indicator));
  }

  // Handle suspicious activity
  private static async handleSuspiciousActivity(userId: string, threatLevel: ThreatLevel): Promise<void> {
    console.warn(`Suspicious activity detected for user ${userId}:`, threatLevel);

    try {
      // Log to security events
      await supabase.from('security_events').insert({
        user_id: userId,
        event_type: 'suspicious_activity',
        details: {
          threat_level: threatLevel.level,
          score: threatLevel.score,
          reasons: threatLevel.reasons,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });

      // Take action based on threat level
      if (threatLevel.level === 'critical') {
        // Lock account temporarily
        await this.lockAccount(userId, 'Critical suspicious activity detected');
      } else if (threatLevel.level === 'high') {
        // Require additional verification
        await this.requireAdditionalVerification(userId);
      }
    } catch (error) {
      console.error('Failed to handle suspicious activity:', error);
    }
  }

  // Lock user account
  private static async lockAccount(userId: string, reason: string): Promise<void> {
    try {
      await supabase.from('security_events').insert({
        user_id: userId,
        event_type: 'account_locked',
        details: { reason, timestamp: new Date().toISOString() }
      });
      
      // Force logout
      await supabase.auth.signOut();
      window.location.href = '/auth?locked=true';
    } catch (error) {
      console.error('Failed to lock account:', error);
    }
  }

  // Require additional verification
  private static async requireAdditionalVerification(userId: string): Promise<void> {
    // This would trigger additional security checks
    console.log(`Additional verification required for user ${userId}`);
  }
}
