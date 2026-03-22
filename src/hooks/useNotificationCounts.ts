/**
 * useNotificationCounts - Real-time unread notification counts
 *
 * Provides counts for:
 * - New profile views (since last visit to /visiteurs)
 * - Unread messages
 * - Pending matches
 *
 * Used by AppSidebar and MobileBottomNav to show badges.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationCounts {
  visitors: number;
  messages: number;
  matches: number;
  total: number;
}

const LAST_VISITORS_CHECK_KEY = 'zawaj_last_visitors_check';

export function useNotificationCounts(userId: string | null) {
  const [counts, setCounts] = useState<NotificationCounts>({
    visitors: 0,
    messages: 0,
    matches: 0,
    total: 0,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      try {
        // Get the last time the user checked visitors
        const lastCheck = localStorage.getItem(LAST_VISITORS_CHECK_KEY) || new Date(0).toISOString();

        // Fetch counts in parallel
        const [visitorsResult, messagesResult, matchesResult] = await Promise.all([
          // New visitors since last check
          supabase
            .from('profile_views')
            .select('id', { count: 'exact', head: true })
            .eq('viewed_id', userId)
            .gt('created_at', lastCheck),
          // Unread conversations (simplified: conversations with status 'active')
          supabase
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .eq('status', 'active'),
          // Pending matches (not mutual yet, where other user liked)
          supabase
            .from('matches')
            .select('id', { count: 'exact', head: true })
            .or(`and(user1_id.eq.${userId},user2_liked.eq.true,user1_liked.eq.false),and(user2_id.eq.${userId},user1_liked.eq.true,user2_liked.eq.false)`),
        ]);

        const visitors = visitorsResult.count ?? 0;
        const messages = messagesResult.count ?? 0;
        const matches = matchesResult.count ?? 0;

        setCounts({
          visitors,
          messages,
          matches,
          total: visitors + messages + matches,
        });
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchCounts();

    // Refresh every 60 seconds
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  /** Call this when user visits the visitors page to reset the badge */
  const markVisitorsRead = () => {
    localStorage.setItem(LAST_VISITORS_CHECK_KEY, new Date().toISOString());
    setCounts((prev) => ({
      ...prev,
      visitors: 0,
      total: prev.total - prev.visitors,
    }));
  };

  return { counts, markVisitorsRead };
}
