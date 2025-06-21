
import { Message } from '@/types/profile';

export interface FilterResult {
  isBlocked: boolean;
  confidence: number;
  reason: string;
  suggestedAction: 'warn' | 'block' | 'review' | 'escalate';
  filteredContent?: string;
}

export interface FilterRule {
  id: string;
  type: 'content' | 'pattern' | 'frequency' | 'context';
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: RegExp | string;
  description: string;
  action: 'warn' | 'block' | 'review' | 'escalate';
}

export class ProactiveFilter {
  private static readonly FILTER_RULES: FilterRule[] = [
    // Content-based rules
    {
      id: 'inappropriate_meeting',
      type: 'content',
      severity: 'high',
      pattern: /\b(meet\s+alone|private\s+meeting|secret\s+meet|without\s+wali)\b/i,
      description: 'Inappropriate meeting suggestions',
      action: 'block'
    },
    {
      id: 'personal_info_request',
      type: 'content',
      severity: 'medium',
      pattern: /\b(phone\s+number|address|home|location|where\s+do\s+you\s+live)\b/i,
      description: 'Personal information requests',
      action: 'warn'
    },
    {
      id: 'romantic_language',
      type: 'content',
      severity: 'medium',
      pattern: /\b(love|darling|sweetheart|baby|honey|sexy|beautiful)\b/i,
      description: 'Inappropriate romantic language',
      action: 'review'
    },
    {
      id: 'religious_violations',
      type: 'content',
      severity: 'high',
      pattern: /\b(dating|girlfriend|boyfriend|haram\s+relationship)\b/i,
      description: 'Religious compliance violations',
      action: 'escalate'
    },
    
    // Pattern-based rules
    {
      id: 'repetitive_contact',
      type: 'pattern',
      severity: 'medium',
      pattern: 'repetitive_messaging',
      description: 'Repetitive contact attempts',
      action: 'warn'
    },
    {
      id: 'pressure_tactics',
      type: 'pattern',
      severity: 'high',
      pattern: /\b(hurry|quick|fast|now|immediately|urgent)\b/i,
      description: 'Pressure tactics detected',
      action: 'review'
    }
  ];
  
  static filterMessage(content: string, context: {
    userId: string;
    conversationHistory: Message[];
    isFirstMessage: boolean;
  }): FilterResult {
    const results: FilterResult[] = [];
    
    // Apply content filters
    for (const rule of this.FILTER_RULES) {
      if (rule.type === 'content') {
        const result = this.applyContentRule(content, rule);
        if (result.isBlocked) {
          results.push(result);
        }
      }
    }
    
    // Apply pattern filters
    const patternResult = this.applyPatternFilters(content, context);
    if (patternResult.isBlocked) {
      results.push(patternResult);
    }
    
    // Apply frequency filters
    const frequencyResult = this.applyFrequencyFilters(context);
    if (frequencyResult.isBlocked) {
      results.push(frequencyResult);
    }
    
    // Return most severe result
    if (results.length === 0) {
      return {
        isBlocked: false,
        confidence: 1.0,
        reason: 'Content approved',
        suggestedAction: 'warn'
      };
    }
    
    // Find the most severe result
    const mostSevere = results.reduce((prev, current) => {
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const prevSeverity = this.getSeverityFromAction(prev.suggestedAction);
      const currentSeverity = this.getSeverityFromAction(current.suggestedAction);
      
      return severityOrder[currentSeverity as keyof typeof severityOrder] > 
             severityOrder[prevSeverity as keyof typeof severityOrder] ? current : prev;
    });
    
    return mostSevere;
  }
  
  private static applyContentRule(content: string, rule: FilterRule): FilterResult {
    const pattern = rule.pattern as RegExp;
    const match = pattern.test(content);
    
    if (match) {
      return {
        isBlocked: true,
        confidence: 0.9,
        reason: rule.description,
        suggestedAction: rule.action,
        filteredContent: content.replace(pattern, '[FILTERED]')
      };
    }
    
    return {
      isBlocked: false,
      confidence: 1.0,
      reason: 'No content violations',
      suggestedAction: 'warn'
    };
  }
  
  private static applyPatternFilters(content: string, context: {
    conversationHistory: Message[];
    isFirstMessage: boolean;
  }): FilterResult {
    // Check for repetitive patterns
    if (context.conversationHistory.length > 0) {
      const recentMessages = context.conversationHistory.slice(-5);
      const similarMessages = recentMessages.filter(msg => 
        this.calculateSimilarity(msg.content, content) > 0.8
      );
      
      if (similarMessages.length > 2) {
        return {
          isBlocked: true,
          confidence: 0.8,
          reason: 'Repetitive messaging pattern detected',
          suggestedAction: 'warn'
        };
      }
    }
    
    // Check for first message appropriateness
    if (context.isFirstMessage) {
      const inappropriateFirstMessage = /\b(hey\s+beautiful|gorgeous|stunning)\b/i;
      if (inappropriateFirstMessage.test(content)) {
        return {
          isBlocked: true,
          confidence: 0.9,
          reason: 'Inappropriate first message',
          suggestedAction: 'review'
        };
      }
    }
    
    return {
      isBlocked: false,
      confidence: 1.0,
      reason: 'No pattern violations',
      suggestedAction: 'warn'
    };
  }
  
  private static applyFrequencyFilters(context: {
    userId: string;
    conversationHistory: Message[];
  }): FilterResult {
    const userMessages = context.conversationHistory.filter(msg => msg.sender_id === context.userId);
    
    // Check message frequency in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMessages = userMessages.filter(msg => 
      new Date(msg.created_at) > oneHourAgo
    );
    
    if (recentMessages.length > 20) {
      return {
        isBlocked: true,
        confidence: 0.9,
        reason: 'Excessive messaging frequency',
        suggestedAction: 'block'
      };
    }
    
    return {
      isBlocked: false,
      confidence: 1.0,
      reason: 'Normal frequency',
      suggestedAction: 'warn'
    };
  }
  
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }
  
  private static getSeverityFromAction(action: string): string {
    switch (action) {
      case 'escalate':
        return 'critical';
      case 'block':
        return 'high';
      case 'review':
        return 'medium';
      case 'warn':
        return 'low';
      default:
        return 'low';
    }
  }
}
