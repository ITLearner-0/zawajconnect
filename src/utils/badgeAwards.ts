import { supabase } from '@/integrations/supabase/client';

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

/**
 * Award a badge to a user based on their action
 * This is a silent award (no toast) for background operations
 */
export const awardBadgeSilent = async (badge_id: BadgeId, progress_value = 0) => {
  try {
    const { data, error } = await supabase.functions.invoke('award-badge', {
      body: {
        badge_id,
        progress_value,
      },
    });

    if (error) {
      console.error(`[badgeAwards] Error awarding badge ${badge_id}:`, error);
      return { success: false, error };
    }

    console.log(`[badgeAwards] Badge ${badge_id} awarded successfully`);
    return { success: true, data };
  } catch (error) {
    console.error(`[badgeAwards] Exception awarding badge ${badge_id}:`, error);
    return { success: false, error };
  }
};

/**
 * Check and award profile completion badges based on percentage
 */
export const checkAndAwardProfileCompletion = async (completionPercentage: number) => {
  const milestones = [
    { threshold: 100, badge: 'profile_complete_100' as BadgeId },
    { threshold: 75, badge: 'profile_complete_75' as BadgeId },
    { threshold: 50, badge: 'profile_complete_50' as BadgeId },
    { threshold: 25, badge: 'profile_complete_25' as BadgeId },
  ];

  for (const milestone of milestones) {
    if (completionPercentage >= milestone.threshold) {
      await awardBadgeSilent(milestone.badge, completionPercentage);
      break; // Only award the highest milestone reached
    }
  }
};

/**
 * Check and award match-related badges
 */
export const checkAndAwardMatchBadges = async (totalMatches: number) => {
  const milestones = [
    { threshold: 25, badge: 'match_streak_25' as BadgeId },
    { threshold: 7, badge: 'match_streak_7' as BadgeId },
    { threshold: 1, badge: 'first_match' as BadgeId },
  ];

  for (const milestone of milestones) {
    if (totalMatches === milestone.threshold) {
      await awardBadgeSilent(milestone.badge, totalMatches);
    }
  }
};

/**
 * Check and award message-related badges
 */
export const checkAndAwardMessageBadges = async (totalMessages: number) => {
  const milestones = [
    { threshold: 500, badge: 'messages_500' as BadgeId },
    { threshold: 100, badge: 'messages_100' as BadgeId },
    { threshold: 1, badge: 'first_message' as BadgeId },
  ];

  for (const milestone of milestones) {
    if (totalMessages === milestone.threshold) {
      await awardBadgeSilent(milestone.badge, totalMessages);
    }
  }
};
