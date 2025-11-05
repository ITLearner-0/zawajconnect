/**
 * Content Moderation Service
 *
 * Centralized service for enforcing Islamic content moderation rules
 * across the platform. Automatically moderates user-generated content
 * in real-time and logs violations.
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface ModerationRule {
  id: string;
  rule_type: 'keyword' | 'pattern' | 'length' | 'format' | 'content_type';
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'warn' | 'block' | 'escalate' | 'auto_moderate';
  is_active: boolean;
  description: string;
}

export interface ModerationViolation {
  user_id: string;
  content: string;
  content_type: 'message' | 'profile' | 'bio' | 'photo' | 'comment';
  rules_violated: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  action_taken: 'warned' | 'blocked' | 'escalated' | 'auto_moderated';
  auto_moderated_content?: string;
  created_at: string;
}

export interface ModerationStats {
  total_checks: number;
  violations_found: number;
  content_blocked: number;
  users_warned: number;
  escalations: number;
  auto_moderated: number;
  by_severity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  by_content_type: {
    message: number;
    profile: number;
    bio: number;
    photo: number;
    comment: number;
  };
}

class ContentModerationService {
  private rules: ModerationRule[] = [];
  private rulesLoaded = false;

  /**
   * Load moderation rules from database
   */
  async loadRules(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('moderation_rules')
        .select('*')
        .eq('is_active', true)
        .order('severity', { ascending: false });

      if (error) throw error;

      this.rules = data || [];
      this.rulesLoaded = true;

      logger.log('Moderation rules loaded', {
        count: this.rules.length,
        bySeverity: this.groupBy(this.rules, 'severity')
      });
    } catch (error) {
      logger.error('Failed to load moderation rules', error);
      this.rules = this.getFallbackRules();
      this.rulesLoaded = true;
    }
  }

  /**
   * Get fallback rules if database is unavailable
   */
  private getFallbackRules(): ModerationRule[] {
    return [
      {
        id: 'fb-1',
        rule_type: 'keyword',
        pattern: '\\b(dating|hookup|girlfriend|boyfriend)\\b',
        severity: 'high',
        action: 'block',
        is_active: true,
        description: 'Inappropriate relationship terminology'
      },
      {
        id: 'fb-2',
        rule_type: 'keyword',
        pattern: '\\b(alcohol|bar|nightclub|party)\\b',
        severity: 'medium',
        action: 'warn',
        is_active: true,
        description: 'References to non-Islamic activities'
      },
      {
        id: 'fb-3',
        rule_type: 'pattern',
        pattern: '(http|https)://(?!zawajconnect\\.)',
        severity: 'medium',
        action: 'escalate',
        is_active: true,
        description: 'External links'
      },
      {
        id: 'fb-4',
        rule_type: 'length',
        pattern: '^.{500,}$',
        severity: 'low',
        action: 'warn',
        is_active: true,
        description: 'Excessive message length'
      }
    ];
  }

  /**
   * Moderate content and return result
   */
  async moderateContent(
    content: string,
    userId: string,
    contentType: 'message' | 'profile' | 'bio' | 'photo' | 'comment' = 'message',
    matchId?: string
  ): Promise<{
    approved: boolean;
    action: 'approved' | 'warned' | 'blocked' | 'escalated' | 'auto_moderated';
    moderatedContent?: string;
    violations: string[];
    severity: 'low' | 'medium' | 'high' | 'critical' | null;
    reason: string;
  }> {
    // Ensure rules are loaded
    if (!this.rulesLoaded) {
      await this.loadRules();
    }

    const violations: string[] = [];
    let highestSeverity: 'low' | 'medium' | 'high' | 'critical' | null = null;
    let actionToTake: 'approved' | 'warned' | 'blocked' | 'escalated' | 'auto_moderated' = 'approved';
    let moderatedContent: string | undefined;

    // Check content against all active rules
    for (const rule of this.rules) {
      if (!rule.is_active) continue;

      let violated = false;

      switch (rule.rule_type) {
        case 'keyword':
        case 'pattern': {
          const regex = new RegExp(rule.pattern, 'gi');
          if (regex.test(content)) {
            violated = true;

            // Auto-moderate by replacing matched content
            if (rule.action === 'auto_moderate') {
              moderatedContent = content.replace(regex, '[modéré]');
            }
          }
          break;
        }

        case 'length': {
          const lengthRegex = new RegExp(rule.pattern);
          if (lengthRegex.test(content)) {
            violated = true;
          }
          break;
        }

        case 'format':
          // Check content format (e.g., excessive caps, special characters)
          violated = this.checkFormat(content, rule.pattern);
          break;
      }

      if (violated) {
        violations.push(rule.id);

        // Update highest severity
        if (this.severityLevel(rule.severity) > this.severityLevel(highestSeverity)) {
          highestSeverity = rule.severity;
          // Map rule.action to actionToTake (verb → past tense)
          const actionMap: Record<typeof rule.action, typeof actionToTake> = {
            'warn': 'warned',
            'block': 'blocked',
            'escalate': 'escalated',
            'auto_moderate': 'auto_moderated'
          };
          actionToTake = actionMap[rule.action];
        }
      }
    }

    // Determine final action
    const approved = violations.length === 0 || actionToTake === 'auto_moderated';

    // Log violation if any
    if (violations.length > 0) {
      await this.logViolation({
        user_id: userId,
        content,
        content_type: contentType,
        rules_violated: violations,
        severity: highestSeverity || 'low',
        action_taken: actionToTake as 'warned' | 'blocked' | 'escalated' | 'auto_moderated',
        auto_moderated_content: moderatedContent,
        created_at: new Date().toISOString()
      });

      logger.log('Content moderation violation', {
        userId,
        contentType,
        violations,
        action: actionToTake,
        severity: highestSeverity
      });
    }

    // Generate reason message
    const reason = this.generateReasonMessage(violations, highestSeverity, actionToTake);

    return {
      approved,
      action: approved ? 'approved' : actionToTake,
      moderatedContent,
      violations,
      severity: highestSeverity,
      reason
    };
  }

  /**
   * Check content format
   */
  private checkFormat(content: string, pattern: string): boolean {
    switch (pattern) {
      case 'excessive_caps': {
        const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
        return capsRatio > 0.5 && content.length > 10;
      }

      case 'excessive_punctuation': {
        const punctRatio = (content.match(/[!?.,;:]/g) || []).length / content.length;
        return punctRatio > 0.3;
      }

      case 'repeated_characters':
        return /(.)\1{4,}/.test(content);

      default:
        return false;
    }
  }

  /**
   * Get severity level as number for comparison
   */
  private severityLevel(severity: string | null): number {
    const levels: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
    return levels[severity || ''] || 0;
  }

  /**
   * Log moderation violation
   */
  private async logViolation(violation: ModerationViolation): Promise<void> {
    try {
      const { error } = await supabase
        .from('moderation_violations')
        .insert(violation);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to log moderation violation', error);
    }
  }

  /**
   * Generate user-friendly reason message
   */
  private generateReasonMessage(
    violations: string[],
    severity: string | null,
    action: string
  ): string {
    if (violations.length === 0) {
      return 'Contenu approuvé';
    }

    const severityMessages: Record<string, string> = {
      low: 'Votre contenu pourrait être amélioré.',
      medium: 'Votre contenu viole les directives de la communauté.',
      high: 'Votre contenu viole gravement les directives islamiques.',
      critical: 'Votre contenu est strictement interdit sur cette plateforme.'
    };

    const actionMessages: Record<string, string> = {
      warn: 'Veuillez réviser votre message.',
      block: 'Votre contenu a été bloqué.',
      escalate: 'Votre contenu sera examiné par un modérateur.',
      auto_moderated: 'Votre contenu a été automatiquement modéré.'
    };

    return `${severityMessages[severity || 'low']} ${actionMessages[action]}`;
  }

  /**
   * Get moderation statistics for admin dashboard
   */
  async getStats(startDate?: Date, endDate?: Date): Promise<ModerationStats> {
    try {
      let query = supabase
        .from('moderation_violations')
        .select('*');

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const violations = data || [];

      return {
        total_checks: violations.length,
        violations_found: violations.length,
        content_blocked: violations.filter(v => v.action_taken === 'blocked').length,
        users_warned: violations.filter(v => v.action_taken === 'warned').length,
        escalations: violations.filter(v => v.action_taken === 'escalated').length,
        auto_moderated: violations.filter(v => v.action_taken === 'auto_moderated').length,
        by_severity: {
          low: violations.filter(v => v.severity === 'low').length,
          medium: violations.filter(v => v.severity === 'medium').length,
          high: violations.filter(v => v.severity === 'high').length,
          critical: violations.filter(v => v.severity === 'critical').length
        },
        by_content_type: {
          message: violations.filter(v => v.content_type === 'message').length,
          profile: violations.filter(v => v.content_type === 'profile').length,
          bio: violations.filter(v => v.content_type === 'bio').length,
          photo: violations.filter(v => v.content_type === 'photo').length,
          comment: violations.filter(v => v.content_type === 'comment').length
        }
      };
    } catch (error) {
      logger.error('Failed to get moderation stats', error);
      throw error;
    }
  }

  /**
   * Helper: Group array by key
   */
  private groupBy<T>(arr: T[], key: keyof T): Record<string, number> {
    return arr.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Export singleton instance
export const contentModerationService = new ContentModerationService();

// Initialize on import
contentModerationService.loadRules();
