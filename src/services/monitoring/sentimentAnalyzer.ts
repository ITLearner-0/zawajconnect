
import { Message } from '@/types/profile';

/**
 * Analyzes sentiment in messages
 */
export function analyzeSentiment(messages: Message[]): number {
  // Simple scoring for sentiment (would use NLP in real implementation)
  let score = 50; // Neutral starting point
  
  // If no messages, return default score
  if (!messages || messages.length === 0) {
    return score;
  }
  
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
