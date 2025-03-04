
import { useState, useEffect } from 'react';
import { Message } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';
import { 
  MonitoringReport, 
  Violation, 
  detectViolations, 
  generateReport 
} from '@/services/aiMonitoringService';
import { useToast } from '@/hooks/use-toast';

export const useAIMonitoring = (
  conversationId: string | undefined, 
  messages: Message[], 
  userId: string | null
) => {
  const { toast } = useToast();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [latestReport, setLatestReport] = useState<MonitoringReport | null>(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check new messages for violations in real-time
  useEffect(() => {
    if (!monitoringEnabled || messages.length === 0) return;
    
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;
    
    // Check only the newest message
    const newViolations = detectViolations(latestMessage);
    
    if (newViolations.length > 0) {
      setViolations(prev => [...prev, ...newViolations]);
      
      // Alert about high severity violations
      const highSeverityViolations = newViolations.filter(v => v.severity === 'high');
      if (highSeverityViolations.length > 0) {
        toast({
          title: "Compliance Alert",
          description: highSeverityViolations[0].message,
          variant: "destructive"
        });
      }
    }
  }, [messages, monitoringEnabled, toast]);

  // Generate comprehensive report periodically or when messages change significantly
  useEffect(() => {
    if (!monitoringEnabled || messages.length < 5 || !conversationId) return;
    
    const generateMonitoringReport = async () => {
      try {
        setLoading(true);
        const report = generateReport(messages);
        setLatestReport(report);
        
        // Save report to database
        if (userId) {
          const { error: reportError } = await supabase
            .from('monitoring_reports')
            .insert({
              conversation_id: conversationId,
              user_id: userId,
              behavioral_score: report.behavioralScore,
              islamic_compliance_score: report.islamicComplianceScore,
              sentiment_score: report.sentimentScore,
              violation_count: report.violations.length,
              report_data: report
            });
            
          if (reportError) {
            console.error("Error saving monitoring report:", reportError);
          }
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error in AI monitoring:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Generate report when we have 5 messages or message count is multiple of 10
    if (messages.length === 5 || messages.length % 10 === 0) {
      generateMonitoringReport();
    }
    
  }, [messages, conversationId, userId, monitoringEnabled]);

  // Toggle monitoring status
  const toggleMonitoring = () => {
    setMonitoringEnabled(prev => !prev);
  };

  return {
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    loading,
    error
  };
};
