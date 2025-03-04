
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getModerationStats } from '@/services/moderation';
import { tableExists } from '@/utils/database/core';

export const useModerationData = () => {
  const [moderationStats, setModerationStats] = useState({
    pendingReports: 0,
    flaggedContent: 0,
    totalProcessed: 0,
    resolvedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetupButton, setShowSetupButton] = useState(false);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);

  // Fetch moderation statistics
  useEffect(() => {
    const fetchModerationStats = async () => {
      setLoading(true);
      try {
        const stats = await getModerationStats();
        setModerationStats(stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModerationStats();
  }, []);

  // Check if moderation tables exist
  useEffect(() => {
    const checkModerationTables = async () => {
      const flagsTableExists = await tableExists('content_flags');
      const reportsTableExists = await tableExists('content_reports');
      
      setShowSetupButton(!flagsTableExists || !reportsTableExists);
    };
    
    checkModerationTables();
  }, []);

  // Fetch flagged content
  useEffect(() => {
    const fetchFlaggedContent = async () => {
      try {
        const { data, error } = await supabase
          .from('content_flags')
          .select('*')
          .eq('resolved', false)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching flagged content:', error);
          setError('Failed to load flagged content');
          return;
        }
        
        setFlaggedContent(data || []);
      } catch (err: any) {
        console.error('Error fetching flagged content:', err);
        setError(err.message || 'Failed to load flagged content');
      }
    };
    
    fetchFlaggedContent();
  }, []);

  return {
    moderationStats,
    loading,
    error,
    showSetupButton,
    flaggedContent
  };
};
