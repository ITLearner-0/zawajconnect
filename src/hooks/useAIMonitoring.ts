
import { useState, useEffect } from 'react';
import { Message } from '@/types/profile';
import { MonitoringReport, Violation, analyzeBehavior, analyzeIslamicCompliance, analyzeSentiment, detectViolations, generateReport } from '@/services/aiMonitoringService';
import { supabase } from '@/integrations/supabase/client';
import { flagContent } from '@/services/contentModerationService';

interface UseAIMonitoringProps {
  conversationId: string;
  messages: Message[];
  userId: string;
}

export const useAIMonitoring = ({ conversationId, messages, userId }: UseAIMonitoringProps) => {
  const [report, setReport] = useState<MonitoringReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(0);

  // Generate monitoring report
  useEffect(() => {
    // Only regenerate when we have 5+ new messages
    if (messages.length === 0 || messages.length < lastAnalyzedCount + 5) {
      return;
    }
    
    setLoading(true);
    const generatedReport = generateReport(messages);
    setReport(generatedReport);
    setViolations(generatedReport.violations);
    setLastAnalyzedCount(messages.length);
    setLoading(false);
    
    // Automatically flag severe violations in the system
    generatedReport.violations
      .filter(v => v.severity === 'high')
      .forEach(violation => {
        // Auto-flag high severity violations
        flagContent(
          violation.messageId,
          'message',
          violation.type === 'islamic' ? 'religious_violation' : 
                 violation.type === 'behavioral' ? 'suspicious' : 'inappropriate',
          'high',
          'system'
        );
      });
  }, [messages, lastAnalyzedCount]);
  
  // Real-time message monitoring
  const monitorNewMessage = (message: Message) => {
    const newViolations = detectViolations(message);
    
    if (newViolations.length > 0) {
      // Update violations list
      setViolations(prev => [...prev, ...newViolations]);
      
      // Auto-flag high severity violations
      newViolations
        .filter(v => v.severity === 'high')
        .forEach(violation => {
          flagContent(
            violation.messageId,
            'message',
            violation.type === 'islamic' ? 'religious_violation' : 
                  violation.type === 'behavioral' ? 'suspicious' : 'inappropriate',
            'high',
            'system'
          );
        });
      
      return true;
    }
    
    return false;
  };
  
  // Save the report to the database
  const saveReport = async () => {
    if (!report) return false;
    
    try {
      const { error } = await supabase
        .from('monitoring_reports')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          behavioral_score: report.behavioralScore,
          islamic_compliance_score: report.islamicComplianceScore,
          sentiment_score: report.sentimentScore,
          violations: report.violations,
          created_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error saving monitoring report:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in saveReport:', err);
      return false;
    }
  };
  
  return {
    report,
    loading,
    isOpen,
    setIsOpen,
    violations,
    monitorNewMessage,
    saveReport
  };
};
