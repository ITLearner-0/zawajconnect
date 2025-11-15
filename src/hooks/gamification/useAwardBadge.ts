import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type BadgeId =
  | 'profile_complete_25'
  | 'profile_complete_50'
  | 'profile_complete_75'
  | 'profile_complete_100'
  | 'email_verified'
  | 'phone_verified'
  | 'id_verified'
  | 'first_match'
  | 'match_streak_7'
  | 'match_streak_25'
  | 'first_message'
  | 'messages_100'
  | 'messages_500'
  | 'daily_login_7'
  | 'daily_login_30'
  | 'family_added'
  | 'wali_verified'
  | 'test_completed'
  | 'high_compatibility'
  | 'early_adopter'
  | 'community_helper';

interface AwardBadgeParams {
  badge_id: BadgeId;
  progress_value?: number;
  showToast?: boolean;
}

export const useAwardBadge = () => {
  const [awarding, setAwarding] = useState(false);
  const { toast } = useToast();

  const awardBadge = async ({
    badge_id,
    progress_value = 0,
    showToast = true,
  }: AwardBadgeParams) => {
    try {
      setAwarding(true);

      const { data, error } = await supabase.functions.invoke('award-badge', {
        body: {
          badge_id,
          progress_value,
        },
      });

      if (error) throw error;

      if (data?.success && showToast) {
        toast({
          title: '🎉 Badge Earned!',
          description: data.message || `You've earned a new badge!`,
          duration: 5000,
        });
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error awarding badge:', error);

      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to award badge',
          variant: 'destructive',
        });
      }

      return { success: false, error };
    } finally {
      setAwarding(false);
    }
  };

  // Helper functions for common badge awards
  const awardProfileCompletionBadge = async (completionPercentage: number) => {
    let badge_id: BadgeId | null = null;

    if (completionPercentage >= 100) {
      badge_id = 'profile_complete_100';
    } else if (completionPercentage >= 75) {
      badge_id = 'profile_complete_75';
    } else if (completionPercentage >= 50) {
      badge_id = 'profile_complete_50';
    } else if (completionPercentage >= 25) {
      badge_id = 'profile_complete_25';
    }

    if (badge_id) {
      return awardBadge({ badge_id, progress_value: completionPercentage });
    }

    return { success: false, error: 'Completion percentage too low' };
  };

  const awardVerificationBadge = async (verificationType: 'email' | 'phone' | 'id') => {
    const badgeMap: Record<typeof verificationType, BadgeId> = {
      email: 'email_verified',
      phone: 'phone_verified',
      id: 'id_verified',
    };

    return awardBadge({ badge_id: badgeMap[verificationType] });
  };

  const awardMatchBadge = async (totalMatches: number) => {
    let badge_id: BadgeId | null = null;

    if (totalMatches === 1) {
      badge_id = 'first_match';
    } else if (totalMatches === 7) {
      badge_id = 'match_streak_7';
    } else if (totalMatches === 25) {
      badge_id = 'match_streak_25';
    }

    if (badge_id) {
      return awardBadge({ badge_id, progress_value: totalMatches });
    }

    return { success: false, error: 'Not at milestone match count' };
  };

  const awardMessageBadge = async (totalMessages: number) => {
    let badge_id: BadgeId | null = null;

    if (totalMessages === 1) {
      badge_id = 'first_message';
    } else if (totalMessages === 100) {
      badge_id = 'messages_100';
    } else if (totalMessages === 500) {
      badge_id = 'messages_500';
    }

    if (badge_id) {
      return awardBadge({ badge_id, progress_value: totalMessages });
    }

    return { success: false, error: 'Not at milestone message count' };
  };

  return {
    awardBadge,
    awarding,
    awardProfileCompletionBadge,
    awardVerificationBadge,
    awardMatchBadge,
    awardMessageBadge,
  };
};

export type { BadgeId };
