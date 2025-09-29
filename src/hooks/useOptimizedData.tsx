import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  total_matches: number;
  mutual_matches: number;
  messages_count: number;
  profile_views: number;
  verification_score: number;
}

export const useOptimizedDashboardData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total_matches: 0,
    mutual_matches: 0,
    messages_count: 0,
    profile_views: 0,
    verification_score: 0
  });
  const [loading, setLoading] = useState(true);

  const loadAllStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [
        matchesResult,
        messagesResult,
        profileViewsResult,
        verificationResult
      ] = await Promise.allSettled([
        supabase
          .from('matches')
          .select('id, is_mutual', { count: 'exact' })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .limit(100),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', user.id),
        supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('viewed_id', user.id),
        supabase
          .from('user_verifications')
          .select('verification_score')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      // Process results
      const matches = matchesResult.status === 'fulfilled' ? matchesResult.value.data : [];
      const mutualMatches = matches?.filter(m => m.is_mutual)?.length || 0;
      const totalMatches = matches?.length || 0;

      const messagesCount = messagesResult.status === 'fulfilled' ? messagesResult.value.count || 0 : 0;
      const profileViews = profileViewsResult.status === 'fulfilled' ? profileViewsResult.value.count || 0 : 0;
      const verificationScore = verificationResult.status === 'fulfilled' ? 
        verificationResult.value.data?.verification_score || 0 : 0;

      setStats({
        total_matches: totalMatches,
        mutual_matches: mutualMatches,
        messages_count: messagesCount,
        profile_views: profileViews,
        verification_score: verificationScore
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllStats();
  }, [loadAllStats]);

  const memoizedStats = useMemo(() => stats, [stats]);

  return { stats: memoizedStats, loading, refreshStats: loadAllStats };
};

export const useOptimizedUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();

    // Set up real-time subscription
    const channel = supabase
      .channel('unread_messages_optimized')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user?.id}`
        },
        fetchUnreadCount
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user?.id}`
        },
        fetchUnreadCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadCount, user?.id]);

  return unreadCount;
};