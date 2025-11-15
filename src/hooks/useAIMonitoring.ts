import { useState, useEffect } from 'react';
import { Message } from '@/types/profile';
import { MonitoringReport, generateReport } from '@/services/monitoring'; // Updated import path
import { supabase } from '@/integrations/supabase/client';

// Helper function to safely parse content_flags
const parseContentFlags = (flags: any): any[] => {
  if (!flags) return [];
  if (Array.isArray(flags)) return flags;
  if (typeof flags === 'string') {
    try {
      return JSON.parse(flags);
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to convert database message to our Message type
const convertDbMessageToMessage = (dbMessage: any): Message => {
  return {
    ...dbMessage,
    content_flags: parseContentFlags(dbMessage.content_flags),
  };
};

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
        const { data: messagesData, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        if (!messagesData || messagesData.length === 0) {
          // No messages, nothing to report
          setLatestReport(null);
          return;
        }

        // Convert database messages to our Message type
        const messages = messagesData.map(convertDbMessageToMessage);

        // Generate the monitoring report
        const report = generateReport(messages);
        setLatestReport(report);

        // Save report to database - just log for now since monitoring_reports table doesn't exist
        if (conversationId) {
          console.log('Would save monitoring report:', {
            conversation_id: conversationId,
            content: JSON.stringify(report),
            behavioral_score: report.behavioralScore,
            is_flagged: report.violations.length > 0,
            warning_triggers: report.violations.map((v) => v.type),
            recommendations: report.recommendations,
          });
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error in AI monitoring:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessagesAndGenerateReport();

    // Set up interval to periodically generate report
    const intervalId = setInterval(fetchMessagesAndGenerateReport, 60000); // Every 60 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [conversationId, monitoringEnabled]);

  // Toggle monitoring status
  const toggleMonitoring = () => {
    setMonitoringEnabled((prev) => !prev);
  };

  return {
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    loading,
    error,
  };
};
