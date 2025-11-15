import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserBadge, BadgeRarity } from '@/types/gamification';

interface BadgeNotification {
  id: string;
  badge: {
    badge_name: string;
    badge_description: string | null;
    badge_icon: string | null;
    rarity: BadgeRarity;
  };
}

export const useBadgeNotifications = () => {
  const [currentNotification, setCurrentNotification] = useState<BadgeNotification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<BadgeNotification[]>([]);

  // Get the current user
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Show notification from queue
  const showNextNotification = useCallback(() => {
    if (notificationQueue.length > 0 && !currentNotification) {
      const [next, ...rest] = notificationQueue;
      setCurrentNotification(next || null);
      setNotificationQueue(rest);
    }
  }, [notificationQueue, currentNotification]);

  // Add notification to queue
  const addNotification = useCallback((badge: UserBadge) => {
    const notification: BadgeNotification = {
      id: badge.id,
      badge: {
        badge_name: badge.badge_name,
        badge_description: badge.badge_description,
        badge_icon: badge.badge_icon,
        rarity: badge.rarity,
      },
    };

    setNotificationQueue(prev => [...prev, notification]);
  }, []);

  // Close current notification
  const closeNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  // Process queue when notification closes
  useEffect(() => {
    if (!currentNotification) {
      showNextNotification();
    }
  }, [currentNotification, showNextNotification]);

  // Subscribe to real-time badge insertions
  useEffect(() => {
    if (!userId) return;

    console.log('[BadgeNotifications] Setting up real-time subscription for user:', userId);

    const channel = supabase
      .channel('badge-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[BadgeNotifications] New badge received:', payload);
          
          // Cast payload to UserBadge type
          const newBadge = payload.new as UserBadge;
          
          // Add to notification queue
          addNotification(newBadge);
        }
      )
      .subscribe((status) => {
        console.log('[BadgeNotifications] Subscription status:', status);
      });

    return () => {
      console.log('[BadgeNotifications] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, addNotification]);

  return {
    currentNotification,
    closeNotification,
    hasNotifications: notificationQueue.length > 0,
  };
};
