
import { useState, useEffect } from 'react';
import { Message, ContentFlag } from '@/types/profile';
import { 
  MonitoringReport, 
  Violation, 
  detectViolations, 
  generateReport 
} from '@/services/monitoring';  // Updated import path
import { useToast } from '@/hooks/use-toast';
import { filterMessageContent, flagContent } from '@/services/moderation';

export const useMessageModeration = (
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
    if (!monitoringEnabled || messages.length === 0 || !userId) return;
    
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;
    
    // Only check sent messages, not received ones
    if (latestMessage.sender_id !== userId) return;
    
    // Check message content through the filter
    const { flags } = filterMessageContent(latestMessage.content);
    
    // If flags detected, record them in the database
    if (flags.length > 0) {
      flags.forEach(flag => {
        if (flag.flag_type && flag.severity) {
          flagContent(
            latestMessage.id,
            'message',
            flag.flag_type as ContentFlag['flag_type'],
            flag.severity as ContentFlag['severity'],
            userId
          ).catch(err => {
            console.error("Error flagging content:", err);
          });
        }
      });
    }
    
    // Check only the newest message for violations
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
  }, [messages, monitoringEnabled, toast, userId]);

  // Generate comprehensive report periodically or when messages change significantly
  useEffect(() => {
    if (!monitoringEnabled || messages.length < 5 || !conversationId) return;
    
    const generateMonitoringReport = async () => {
      try {
        setLoading(true);
        const report = generateReport(messages);
        setLatestReport(report);
        
        // Save report to database - just log for now since table doesn't exist
        if (userId) {
          console.log("Would save monitoring report:", {
            conversation_id: conversationId,
            user_id: userId,
            behavioral_score: report.behavioralScore,
            islamic_compliance_score: report.islamicComplianceScore,
            sentiment_score: report.sentimentScore,
            violation_count: report.violations.length,
            report_data: report
          });
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error in AI monitoring:", err);
        toast({
          title: "Monitoring Error",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Generate report when we have 5 messages or message count is multiple of 10
    if (messages.length === 5 || messages.length % 10 === 0) {
      generateMonitoringReport();
    }
    
  }, [messages, conversationId, userId, monitoringEnabled, toast]);

  // Toggle monitoring status
  const toggleMonitoring = () => {
    setMonitoringEnabled(prev => !prev);
    toast({
      title: monitoringEnabled ? "Monitoring Disabled" : "Monitoring Enabled",
      description: monitoringEnabled 
        ? "Message monitoring has been turned off" 
        : "Message monitoring has been turned on",
      variant: "default"
    });
  };

  // Process content for flags and moderation
  const moderateMessageContent = (content: string) => {
    if (!content) {
      return { flags: [], isFiltered: false, filteredContent: "" };
    }
    return filterMessageContent(content);
  };

  // Flag content for review
  const processContentFlags = (
    messageId: string, 
    contentType: 'message' | 'profile' | 'image', 
    flagType: 'inappropriate' | 'harassment' | 'religious_violation' | 'suspicious', 
    severity: 'low' | 'medium' | 'high'
  ) => {
    if (!userId) return Promise.resolve(null);
    return flagContent(messageId, contentType, flagType, severity, userId);
  };

  return {
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    loading,
    error,
    moderateMessageContent,
    processContentFlags
  };
};
