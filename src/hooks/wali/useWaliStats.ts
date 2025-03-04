
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliDashboardStats } from '@/types/wali';

export const useWaliStats = (
  waliId: string | null,
  pendingRequests: number,
  activeConversations: number,
  flaggedContent: number
) => {
  const [statistics, setStatistics] = useState<WaliDashboardStats>({
    pendingRequests: 0,
    activeConversations: 0,
    flaggedMessages: 0,
    totalSupervised: 0
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!waliId) return;

      try {
        // Get total supervised users
        const { data: waliProfile } = await supabase
          .from('wali_profiles')
          .select('managed_users')
          .eq('user_id', waliId)
          .single();

        const totalSupervised = waliProfile?.managed_users?.length || 0;

        // Update statistics
        setStatistics({
          pendingRequests,
          activeConversations,
          flaggedMessages: flaggedContent,
          totalSupervised
        });
      } catch (err) {
        console.error('Error fetching wali statistics:', err);
      }
    };

    fetchStatistics();
  }, [waliId, pendingRequests, activeConversations, flaggedContent]);

  return statistics;
};
