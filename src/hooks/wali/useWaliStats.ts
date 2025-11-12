import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliDashboardStats } from '@/types/wali';

export const useWaliStats = (
  userId: string | null,
  pendingRequests: number,
  activeConversations: number,
  flaggedItems: number
) => {
  const [stats, setStats] = useState<WaliDashboardStats>({
    pendingRequests: 0,
    activeConversations: 0,
    flaggedMessages: 0,
    totalSupervised: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        // Get total supervised conversations using existing conversations table
        const { count, error: countError } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('wali_supervised', true);

        if (countError) {
          console.error('Error fetching supervision count:', countError);
          setError('Failed to load statistics');
          return;
        }

        // Set stats using the counts we already have plus total supervised
        setStats({
          pendingRequests,
          activeConversations,
          flaggedMessages: flaggedItems,
          totalSupervised: count || 0,
        });
      } catch (err: any) {
        console.error('Error fetching wali stats:', err);
        setError(err.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, pendingRequests, activeConversations, flaggedItems]);

  return {
    stats,
    loading,
    error,
  };
};
