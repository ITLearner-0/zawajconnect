
import { Message } from '@/types/profile';
import { MonitoringReport, Violation } from './types';
import { analyzeBehavior } from './behaviorAnalyzer';
import { analyzeIslamicCompliance } from './islamicComplianceAnalyzer';
import { analyzeSentiment } from './sentimentAnalyzer';
import { detectViolations } from './violationDetector';

/**
 * Generates a comprehensive monitoring report
 */
export function generateReport(messages: Message[]): MonitoringReport {
  if (!messages) {
    messages = [];
  }
  
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
  
  // Generate recommendations based on violations
  const recommendations: string[] = violations.map(v => `Consider addressing: ${v.message}`);
  
  // If no recommendations but scores aren't perfect, add general advice
  if (recommendations.length === 0 && (behavioralScore < 95 || islamicComplianceScore < 95 || sentimentScore < 60)) {
    recommendations.push("Consider maintaining a respectful and positive tone in your conversations");
  }
  
  return {
    behavioralScore,
    islamicComplianceScore,
    sentimentScore,
    violations,
    recommendations,
    timestamp: new Date().toISOString()
  };
}

// Re-export everything for backward compatibility
export * from './types';
export * from './behaviorAnalyzer';
export * from './islamicComplianceAnalyzer';
export * from './sentimentAnalyzer';
export * from './violationDetector';
