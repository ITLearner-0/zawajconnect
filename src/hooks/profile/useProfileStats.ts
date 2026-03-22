/**
 * useProfileStats - Loads real profile statistics from the database
 *
 * Fetches:
 * - Total profile views (from profile_views table)
 * - Total favorites/likes received (from profile_favorites table)
 * - Total conversations (from conversations table)
 *
 * Also provides a function to record a new profile view.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileStats {
  views: number;
  likes: number;
  messages: number;
  loading: boolean;
}

export function useProfileStats(userId: string | null) {
  const [stats, setStats] = useState<ProfileStats>({
    views: 0,
    likes: 0,
    messages: 0,
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setStats({ views: 0, likes: 0, messages: 0, loading: false });
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch all three counts in parallel
        const [viewsResult, likesResult, conversationsResult] = await Promise.all([
          supabase
            .from('profile_views')
            .select('id', { count: 'exact', head: true })
            .eq('viewed_id', userId),
          supabase
            .from('profile_favorites')
            .select('id', { count: 'exact', head: true })
            .eq('profile_id', userId),
          supabase
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`),
        ]);

        setStats({
          views: viewsResult.count ?? 0,
          likes: likesResult.count ?? 0,
          messages: conversationsResult.count ?? 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [userId]);

  /**
   * Record a profile view. Call this when viewing another user's profile.
   * Deduplicates: won't record if the same viewer viewed within the last hour.
   */
  const recordView = useCallback(
    async (viewerId: string) => {
      if (!userId || viewerId === userId) return;

      try {
        // Check rate limit: don't record if same viewer viewed within last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('profile_views')
          .select('id', { count: 'exact', head: true })
          .eq('viewer_id', viewerId)
          .eq('viewed_id', userId)
          .gte('created_at', oneHourAgo);

        if ((count ?? 0) > 0) return;

        await supabase.from('profile_views').insert({
          viewer_id: viewerId,
          viewed_id: userId,
        });

        // Optimistically update the count
        setStats((prev) => ({ ...prev, views: prev.views + 1 }));
      } catch (error) {
        console.error('Error recording profile view:', error);
      }
    },
    [userId]
  );

  return { stats, recordView };
}
