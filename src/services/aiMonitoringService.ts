
import { Message } from '@/types/profile';

// AI monitoring types
export interface MonitoringReport {
  behavioralScore: number;
  islamicComplianceScore: number;
  sentimentScore: number;
  violations: Violation[];
  timestamp: string;
}

export interface Violation {
  type: 'behavioral' | 'islamic' | 'sentiment';
  severity: 'low' | 'medium' | 'high';
  message: string;
  messageId: string;
  timestamp: string;
}

// Sample Islamic guidelines (simplified for demonstration)
const ISLAMIC_GUIDELINES = [
  { pattern: /dating|boyfriend|girlfriend/, severity: 'high' as const, message: 'Dating terms detected' },
  { pattern: /alcohol|wine|beer|drinking/, severity: 'medium' as const, message: 'Alcohol references detected' },
  { pattern: /meet alone|private meeting/, severity: 'medium' as const, message: 'Meeting without wali supervision' },
  { pattern: /inappropriate|flirting/, severity: 'medium' as const, message: 'Potentially inappropriate tone' },
  { pattern: /phone number|address|location/, severity: 'low' as const, message: 'Sharing personal details' },
];

/**
 * Analyzes the behavioral aspects of messages
 */
export function analyzeBehavior(messages: Message[]): number {
  // Simple algorithm to score behavior (would be more sophisticated in real implementation)
  let score = 100; // Start with perfect score
  
  const flaggedWords = ['meet', 'alone', 'secret', 'private'];
  
  // Calculate time difference for rapid message detection
  const patternOfRapidMessages = messages.length > 10 && (
    new Date(messages[messages.length - 1].created_at).getTime() - 
    new Date(messages[messages.length - 10].created_at).getTime()
  ) < 60000; // 10 messages in less than a minute
  
  // Check for flagged words
  messages.forEach(message => {
    flaggedWords.forEach(word => {
      if (message.content.toLowerCase().includes(word)) {
        score -= 5;
      }
    });
  });
  
  // Check for rapid message patterns
  if (patternOfRapidMessages) {
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes Islamic compliance in messages
 */
export function analyzeIslamicCompliance(messages: Message[]): { score: number; violations: Violation[] } {
  let score = 100;
  const violations: Violation[] = [];
  
  messages.forEach(message => {
    ISLAMIC_GUIDELINES.forEach(guideline => {
      if (guideline.pattern.test(message.content.toLowerCase())) {
        const severityScore = guideline.severity === 'high' ? 20 : guideline.severity === 'medium' ? 10 : 5;
        score -= severityScore;
        
        violations.push({
          type: 'islamic',
          severity: guideline.severity,
          message: guideline.message,
          messageId: message.id,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  return { score: Math.max(0, score), violations };
}

/**
 * Analyzes sentiment in messages
 */
export function analyzeSentiment(messages: Message[]): number {
  // Simple scoring for sentiment (would use NLP in real implementation)
  let score = 50; // Neutral starting point
  
  const positiveWords = ['happy', 'glad', 'nice', 'good', 'like', 'well', 'respect', 'appreciate'];
  const negativeWords = ['angry', 'sad', 'bad', 'dislike', 'hate', 'terrible', 'annoyed', 'disrespectful'];
  
  messages.forEach(message => {
    const content = message.content.toLowerCase();
    
    positiveWords.forEach(word => {
      if (content.includes(word)) score += 2;
    });
    
    negativeWords.forEach(word => {
      if (content.includes(word)) score -= 2;
    });
  });
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Detects violations in real-time
 */
export function detectViolations(message: Message): Violation[] {
  const violations: Violation[] = [];
  
  // Check for behavioral violations
  if (message.content.length > 500) {
    violations.push({
      type: 'behavioral',
      severity: 'low',
      message: 'Unusually long message detected',
      messageId: message.id,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check for Islamic compliance violations
  ISLAMIC_GUIDELINES.forEach(guideline => {
    if (guideline.pattern.test(message.content.toLowerCase())) {
      violations.push({
        type: 'islamic',
        severity: guideline.severity,
        message: guideline.message,
        messageId: message.id,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  return violations;
}

/**
 * Generates a comprehensive monitoring report
 */
export function generateReport(messages: Message[]): MonitoringReport {
  const behavioralScore = analyzeBehavior(messages);
  const { score: islamicComplianceScore, violations: islamicViolations } = analyzeIslamicCompliance(messages);
  const sentimentScore = analyzeSentiment(messages);
  
  // Add any behavioral or sentiment violations
  const violations: Violation[] = [...islamicViolations];
  
  if (behavioralScore < 70) {
    violations.push({
      type: 'behavioral',
      severity: 'medium',
      message: 'Concerning behavioral patterns detected',
      messageId: messages[messages.length - 1]?.id || '',
      timestamp: new Date().toISOString()
    });
  }
  
  if (sentimentScore < 30) {
    violations.push({
      type: 'sentiment',
      severity: 'medium',
      message: 'Negative sentiment detected',
      messageId: messages[messages.length - 1]?.id || '',
      timestamp: new Date().toISOString()
    });
  }
  
  return {
    behavioralScore,
    islamicComplianceScore,
    sentimentScore,
    violations,
    timestamp: new Date().toISOString()
  };
}
