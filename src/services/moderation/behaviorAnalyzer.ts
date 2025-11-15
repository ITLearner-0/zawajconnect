import { Message } from '@/types/profile';

export interface BehaviorPattern {
  type: 'rapid_messaging' | 'inappropriate_content' | 'harassment' | 'spam' | 'suspicious_requests';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  evidence: string[];
}

export interface BehaviorScore {
  overall: number;
  communication: number;
  respect: number;
  compliance: number;
  trustworthiness: number;
  patterns: BehaviorPattern[];
}

export class BehaviorAnalyzer {
  private static readonly RAPID_MESSAGE_THRESHOLD = 10; // messages per minute
  private static readonly INAPPROPRIATE_WORDS = [
    'meet alone',
    'secret',
    'private meeting',
    "don't tell",
    'bypass',
    'avoid wali',
    'without permission',
  ];

  static analyzeBehavior(messages: Message[], userId: string): BehaviorScore {
    const userMessages = messages.filter((msg) => msg.sender_id === userId);
    const patterns: BehaviorPattern[] = [];

    // Analyze rapid messaging
    const rapidMessaging = this.detectRapidMessaging(userMessages);
    if (rapidMessaging) patterns.push(rapidMessaging);

    // Analyze content appropriateness
    const inappropriateContent = this.detectInappropriateContent(userMessages);
    if (inappropriateContent) patterns.push(inappropriateContent);

    // Analyze harassment patterns
    const harassment = this.detectHarassment(userMessages);
    if (harassment) patterns.push(harassment);

    // Analyze spam behavior
    const spam = this.detectSpam(userMessages);
    if (spam) patterns.push(spam);

    // Calculate scores
    const scores = this.calculateScores(patterns, userMessages.length);

    return {
      ...scores,
      patterns,
    };
  }

  private static detectRapidMessaging(messages: Message[]): BehaviorPattern | null {
    if (messages.length < 10) return null;

    // Check last 10 messages timing
    const recentMessages = messages.slice(-10);
    const lastMessage = recentMessages[recentMessages.length - 1];
    const firstMessage = recentMessages[0];
    if (!lastMessage || !firstMessage) return null;

    const timeSpan =
      new Date(lastMessage.created_at).getTime() - new Date(firstMessage.created_at).getTime();

    if (timeSpan < 60000) {
      // Less than 1 minute
      return {
        type: 'rapid_messaging',
        severity: 'medium',
        confidence: 0.8,
        description: 'Sending messages too rapidly',
        evidence: [`${recentMessages.length} messages in ${Math.round(timeSpan / 1000)} seconds`],
      };
    }

    return null;
  }

  private static detectInappropriateContent(messages: Message[]): BehaviorPattern | null {
    const flaggedMessages: string[] = [];

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      this.INAPPROPRIATE_WORDS.forEach((word) => {
        if (content.includes(word)) {
          flaggedMessages.push(`Message contains: "${word}"`);
        }
      });
    });

    if (flaggedMessages.length > 0) {
      return {
        type: 'inappropriate_content',
        severity: flaggedMessages.length > 2 ? 'high' : 'medium',
        confidence: 0.9,
        description: 'Inappropriate content detected',
        evidence: flaggedMessages,
      };
    }

    return null;
  }

  private static detectHarassment(messages: Message[]): BehaviorPattern | null {
    // Simple harassment detection based on message frequency and repetitive content
    const contentMap = new Map<string, number>();

    messages.forEach((msg) => {
      const normalized = msg.content.toLowerCase().trim();
      contentMap.set(normalized, (contentMap.get(normalized) || 0) + 1);
    });

    const repetitiveMessages = Array.from(contentMap.entries())
      .filter(([_, count]) => count > 3)
      .map(([content, count]) => `"${content}" repeated ${count} times`);

    if (repetitiveMessages.length > 0) {
      return {
        type: 'harassment',
        severity: 'high',
        confidence: 0.7,
        description: 'Repetitive message patterns detected',
        evidence: repetitiveMessages,
      };
    }

    return null;
  }

  private static detectSpam(messages: Message[]): BehaviorPattern | null {
    const spamIndicators = [
      'click here',
      'visit my profile',
      'check this out',
      'limited time',
      'act now',
      'free money',
    ];

    const spamMessages: string[] = [];

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      spamIndicators.forEach((indicator) => {
        if (content.includes(indicator)) {
          spamMessages.push(`Spam indicator: "${indicator}"`);
        }
      });
    });

    if (spamMessages.length > 0) {
      return {
        type: 'spam',
        severity: 'medium',
        confidence: 0.6,
        description: 'Spam-like content detected',
        evidence: spamMessages,
      };
    }

    return null;
  }

  private static calculateScores(
    patterns: BehaviorPattern[],
    messageCount: number
  ): Omit<BehaviorScore, 'patterns'> {
    let baseScore = 100;

    // Deduct points based on patterns
    patterns.forEach((pattern) => {
      switch (pattern.severity) {
        case 'critical':
          baseScore -= 30;
          break;
        case 'high':
          baseScore -= 20;
          break;
        case 'medium':
          baseScore -= 10;
          break;
        case 'low':
          baseScore -= 5;
          break;
      }
    });

    const overall = Math.max(0, baseScore);

    // Calculate component scores
    const communication = this.calculateCommunicationScore(patterns, overall);
    const respect = this.calculateRespectScore(patterns, overall);
    const compliance = this.calculateComplianceScore(patterns, overall);
    const trustworthiness = this.calculateTrustworthinessScore(patterns, overall);

    return {
      overall,
      communication,
      respect,
      compliance,
      trustworthiness,
    };
  }

  private static calculateCommunicationScore(
    patterns: BehaviorPattern[],
    baseScore: number
  ): number {
    const communicationPatterns = patterns.filter(
      (p) => p.type === 'rapid_messaging' || p.type === 'spam'
    );
    return Math.max(0, baseScore - communicationPatterns.length * 15);
  }

  private static calculateRespectScore(patterns: BehaviorPattern[], baseScore: number): number {
    const respectPatterns = patterns.filter(
      (p) => p.type === 'harassment' || p.type === 'inappropriate_content'
    );
    return Math.max(0, baseScore - respectPatterns.length * 20);
  }

  private static calculateComplianceScore(patterns: BehaviorPattern[], baseScore: number): number {
    const compliancePatterns = patterns.filter(
      (p) => p.type === 'inappropriate_content' || p.type === 'suspicious_requests'
    );
    return Math.max(0, baseScore - compliancePatterns.length * 18);
  }

  private static calculateTrustworthinessScore(
    patterns: BehaviorPattern[],
    baseScore: number
  ): number {
    const trustPatterns = patterns.filter(
      (p) => p.type === 'spam' || p.type === 'suspicious_requests'
    );
    return Math.max(0, baseScore - trustPatterns.length * 16);
  }
}
