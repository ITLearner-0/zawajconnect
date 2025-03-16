
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAnalyticsData, getEmergencyStats, getModerationStats, getUserActivityStats, getWaliStats } from '@/services/analytics';
import { AnalyticsData, EmergencyStats, ModerationStats, UserActivityStats, WaliStats } from '@/types/analytics';
import { DateRange } from 'react-day-picker';

// Update the hook to accept DateRange which has an optional to property
export const useAnalyticsData = (dateRange?: DateRange) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [emergencyStats, setEmergencyStats] = useState<EmergencyStats | null>(null);
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
  const [userActivityStats, setUserActivityStats] = useState<UserActivityStats | null>(null);
  const [waliStats, setWaliStats] = useState<WaliStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert date range to ISO strings if provided, handle optional to date
      const fromDate = dateRange?.from ? dateRange.from.toISOString() : undefined;
      const toDate = dateRange?.to ? dateRange.to.toISOString() : undefined;
      
      // Fetch all analytics data in parallel
      const [
        analyticsData,
        emergencyData, 
        moderationData, 
        userActivityData, 
        waliData
      ] = await Promise.all([
        getAnalyticsData(fromDate, toDate),
        getEmergencyStats(fromDate, toDate),
        getModerationStats(fromDate, toDate),
        getUserActivityStats(fromDate, toDate),
        getWaliStats(fromDate, toDate)
      ]);
      
      setAnalytics(analyticsData);
      setEmergencyStats(emergencyData);
      setModerationStats(moderationData);
      setUserActivityStats(userActivityData);
      setWaliStats(waliData);
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch data on initial load and when date range changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    analytics,
    emergencyStats,
    moderationStats,
    userActivityStats,
    waliStats,
    loading,
    error,
    refreshData: fetchData
  };
};
