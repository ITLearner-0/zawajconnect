import { useState, useEffect } from 'react';
import { Message } from '@/types/profile';
import { 
  MonitoringReport, 
  generateReport 
} from '@/services/aiMonitoringService';
import { supabase } from '@/integrations/supabase/client';

export const useAIMonitoring = (conversationId: string | undefined) => {
  const [latestReport, setLatestReport] = useState<MonitoringReport | null>(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!monitoringEnabled || !conversationId) return;
    
    const fetchMessagesAndGenerateReport = async () => {
      try {
        setLoading(true);
        
        // Fetch all messages for the conversation
        const { data: messages, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (fetchError) {
          setError(fetchError.message);
          return;
        }
        
        if (!messages || messages.length === 0) {
          // No messages, nothing to report
          setLatestReport(null);
          return;
        }
        
        // Generate the monitoring report
        const report = generateReport(messages as Message[]);
        setLatestReport(report);
        
        // Save report to database
        if (conversationId) {
          await saveMonitoringReport(conversationId, report);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error in AI monitoring:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessagesAndGenerateReport();
    
    // Set up interval to periodically generate report
    const intervalId = setInterval(fetchMessagesAndGenerateReport, 60000); // Every 60 seconds
    
    return () => clearInterval(intervalId); // Cleanup interval on unmount
    
  }, [conversationId, monitoringEnabled]);

  // Save monitoring report to the database
  const saveMonitoringReport = async (conversationId: string, report: MonitoringReport) => {
    try {
      // Fix the monitoring_reports table insert
      const { error: saveError } = await supabase
        .from('monitoring_reports')
        .insert({
          conversation_id: conversationId,
          content: JSON.stringify(report),
          behavioral_score: report.behavioralScore,
          is_flagged: report.violations.length > 0,
          warning_triggers: report.violations.map(v => v.type),
          recommendations: report.recommendations
        });
      
      if (saveError) {
        console.error("Error saving monitoring report:", saveError);
      } else {
        console.log("Monitoring report saved successfully.");
      }
    } catch (err) {
      console.error("Error saving monitoring report:", err);
    }
  };

  // Toggle monitoring status
  const toggleMonitoring = () => {
    setMonitoringEnabled(prev => !prev);
  };

  return {
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    loading,
    error
  };
};
