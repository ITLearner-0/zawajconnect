
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliDashboardStats } from '@/types/wali';

export const useWaliStats = (
  waliId: string | null,
  pendingRequests: number,
  activeConversations: number,
  flaggedContent: number
) => {
  const [stats, setStats] = useState<WaliDashboardStats>({
    pendingRequests: 0,
    activeConversations: 0,
    flaggedMessages: 0,
    totalSupervised: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!waliId) return;
      
      setLoading(true);
      try {
        // Get total supervised users
        const { data: waliProfile, error: waliError } = await supabase
          .from('wali_profiles')
          .select('managed_users')
          .eq('user_id', waliId)
          .single();

        if (waliError) {
          setError(waliError.message);
          return;
        }

        const totalSupervised = waliProfile?.managed_users?.length || 0;

        // Update statistics
        setStats({
          pendingRequests,
          activeConversations,
          flaggedMessages: flaggedContent,
          totalSupervised
        });
      } catch (err: any) {
        console.error('Error fetching wali statistics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [waliId, pendingRequests, activeConversations, flaggedContent]);

  return {
    stats,
    loading,
    error
  };
};
