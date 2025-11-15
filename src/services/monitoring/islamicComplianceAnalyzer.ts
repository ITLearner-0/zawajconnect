import { Message } from '@/types/profile';
import { Violation, ISLAMIC_GUIDELINES } from './types';

/**
 * Analyzes Islamic compliance in messages
 */
export function analyzeIslamicCompliance(messages: Message[]): {
  score: number;
  violations: Violation[];
} {
  let score = 100;
  const violations: Violation[] = [];

  // If no messages, return default score
  if (!messages || messages.length === 0) {
    return { score, violations };
  }

  messages.forEach((message) => {
    ISLAMIC_GUIDELINES.forEach((guideline) => {
      if (guideline.pattern.test(message.content.toLowerCase())) {
        const severityScore =
          guideline.severity === 'high' ? 20 : guideline.severity === 'medium' ? 10 : 5;
        score -= severityScore;

        violations.push({
          type: 'islamic',
          severity: guideline.severity,
          message: guideline.message,
          messageId: message.id,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  return { score: Math.max(0, score), violations };
}
