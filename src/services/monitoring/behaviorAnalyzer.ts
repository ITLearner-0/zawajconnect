
import { Message } from '@/types/profile';

/**
 * Analyzes the behavioral aspects of messages
 */
export function analyzeBehavior(messages: Message[]): number {
  // Simple algorithm to score behavior (would be more sophisticated in real implementation)
  let score = 100; // Start with perfect score
  
  // If no messages, return default score
  if (!messages || messages.length === 0) {
    return score;
  }
  
  const flaggedWords = ['meet', 'alone', 'secret', 'private'];
  
  // Calculate time difference for rapid message detection
  const patternOfRapidMessages = messages.length > 10 && (
    new Date(messages[messages.length - 1].created_at).valueOf() - 
    new Date(messages[messages.length - 10].created_at).valueOf()
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
