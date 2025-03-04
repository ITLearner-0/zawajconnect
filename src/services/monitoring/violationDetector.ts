
import { Message } from '@/types/profile';
import { Violation, ISLAMIC_GUIDELINES } from './types';

/**
 * Detects violations in real-time
 */
export function detectViolations(message: Message): Violation[] {
  const violations: Violation[] = [];
  
  if (!message) {
    return violations;
  }
  
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
