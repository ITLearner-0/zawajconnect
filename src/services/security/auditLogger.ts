
// Security audit logging service
import { supabase } from '@/integrations/supabase/client';

export interface AuditEvent {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  success: boolean;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
}

export class SecurityAuditLogger {
  private static readonly BATCH_SIZE = 10;
  private static pendingEvents: AuditEvent[] = [];

  // Log security event
  static async logEvent(event: AuditEvent): Promise<void> {
    const auditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      ip: await this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };

    this.pendingEvents.push(auditEvent);

    // Batch process events
    if (this.pendingEvents.length >= this.BATCH_SIZE) {
      await this.flushEvents();
    }
  }

  // Flush pending events to database
  private static async flushEvents(): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    const events = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      const { error } = await (supabase as any)
        .from('security_events')
        .insert(events.map((event: any) => ({
          event_type: event.action,
          description: `${event.resource} - ${event.success ? 'success' : 'failed'}`,
          severity: event.success ? 'low' : 'medium',
          metadata: {
            user_id: event.userId ?? '',
            resource: event.resource,
            resource_id: event.resourceId ?? '',
            success: event.success,
            details: event.details ?? {},
            ip_address: event.ip ?? '',
            user_agent: event.userAgent ?? '',
            timestamp: event.timestamp ?? ''
          }
        })));

      if (error) {
        console.error('Failed to log audit events:', error);
        // Re-add events to queue for retry
        this.pendingEvents.unshift(...events);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      this.pendingEvents.unshift(...events);
    }
  }

  // Log authentication events
  static async logAuth(action: string, success: boolean, details?: Record<string, any>): Promise<void> {
    await this.logEvent({
      action: `auth_${action}`,
      resource: 'authentication',
      success,
      details
    });
  }

  // Log profile access
  static async logProfileAccess(userId: string, profileId: string, success: boolean): Promise<void> {
    await this.logEvent({
      userId,
      action: 'profile_access',
      resource: 'profile',
      resourceId: profileId,
      success
    });
  }

  // Log message events
  static async logMessage(userId: string, conversationId: string, action: string, success: boolean): Promise<void> {
    await this.logEvent({
      userId,
      action: `message_${action}`,
      resource: 'conversation',
      resourceId: conversationId,
      success
    });
  }

  // Log admin actions
  static async logAdminAction(userId: string, action: string, resource: string, resourceId: string, success: boolean): Promise<void> {
    await this.logEvent({
      userId,
      action: `admin_${action}`,
      resource,
      resourceId,
      success,
      details: { admin_action: true }
    });
  }

  // Log security violations
  static async logSecurityViolation(userId: string, violation: string, details: Record<string, any>): Promise<void> {
    await this.logEvent({
      userId,
      action: 'security_violation',
      resource: 'security',
      success: false,
      details: { violation, ...details }
    });
  }

  // Get client IP (simplified - in production use proper service)
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Get session ID
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  // Initialize audit logger
  static initialize(): void {
    // Flush events periodically
    setInterval(() => {
      this.flushEvents();
    }, 30 * 1000); // Flush every 30 seconds

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  // Get audit statistics
  static async getAuditStats(userId?: string): Promise<any> {
    try {
      let query = supabase
        .from('security_events')
        .select('event_type, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process statistics
      const stats = {
        total: data.length,
        byType: {} as Record<string, number>,
        byHour: Array(24).fill(0)
      };

      data.forEach(event => {
        // Count by type
        stats.byType[event.event_type] = (stats.byType[event.event_type] || 0) + 1;
        
        // Count by hour
        const hour = new Date(event.created_at).getHours();
        stats.byHour[hour]++;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      return null;
    }
  }
}
