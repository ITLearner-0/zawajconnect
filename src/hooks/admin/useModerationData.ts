import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getModerationStats } from '@/services/moderation/statistics';
import { tableExists } from '@/utils/database/core';

export const useModerationData = () => {
  const [moderationStats, setModerationStats] = useState({
    pendingReports: 0,
    flaggedContent: 0,
    totalProcessed: 0,
    resolvedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetupButton, setShowSetupButton] = useState(false);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);

  // Function to fetch moderation statistics
  const fetchModerationStats = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await getModerationStats();
      setModerationStats(stats);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching moderation stats:', err);
      setError(err.message || 'Failed to load moderation statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to check if moderation tables exist
  const checkModerationTables = useCallback(async () => {
    try {
      const flagsTableExists = await tableExists('content_flags');
      const reportsTableExists = await tableExists('content_reports');

      setShowSetupButton(!flagsTableExists || !reportsTableExists);
      setError(null);
    } catch (err: any) {
      console.error('Error checking moderation tables:', err);
      setError(err.message || 'Failed to check if moderation tables exist');
      // If we can't check if tables exist, show setup button anyway
      setShowSetupButton(true);
    }
  }, []);

  // Function to fetch flagged content
  const fetchFlaggedContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('content_flags' as any)
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flagged content:', error);
        setError('Failed to load flagged content');
        return;
      }

      setFlaggedContent(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching flagged content:', err);
      setError(err.message || 'Failed to load flagged content');
    }
  }, []);

  // Function to refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Run these in parallel for better performance
      await Promise.all([checkModerationTables(), fetchModerationStats(), fetchFlaggedContent()]);
    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [checkModerationTables, fetchModerationStats, fetchFlaggedContent]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    moderationStats,
    loading,
    error,
    showSetupButton,
    flaggedContent,
    refreshData,
  };
};
