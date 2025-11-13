import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserBadge, BadgeRarity } from '@/types/gamification';

export const useUserBadges = (userId?: string) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (fetchError) throw fetchError;

      setBadges(data || []);
    } catch (err) {
      console.error('Error fetching badges:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load badges';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getBadgesByRarity = (rarity: BadgeRarity): UserBadge[] => {
    return badges.filter(badge => badge.rarity === rarity);
  };

  const getTotalBadges = (): number => {
    return badges.length;
  };

  const getLatestBadge = (): UserBadge | null => {
    return badges.length > 0 ? badges[0] || null : null;
  };

  const getBadgesByCategory = (): Record<BadgeRarity, UserBadge[]> => {
    return {
      common: getBadgesByRarity('common'),
      rare: getBadgesByRarity('rare'),
      epic: getBadgesByRarity('epic'),
      legendary: getBadgesByRarity('legendary'),
    };
  };

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges,
    getBadgesByRarity,
    getTotalBadges,
    getLatestBadge,
    getBadgesByCategory,
  };
};
