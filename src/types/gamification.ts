export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type RewardType = 'xp' | 'badge' | 'unlock' | 'boost' | 'premium_trial';

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string | null;
  badge_icon: string | null;
  rarity: BadgeRarity;
  earned_at: string;
  progress_value: number;
  display_order: number;
  created_at: string;
}

export interface GamificationReward {
  id: string;
  user_id: string;
  reward_type: RewardType;
  reward_amount: number | null;
  reward_description: string;
  source_action: string;
  claimed: boolean;
  claimed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface BadgeProgress {
  badge_id: string;
  current_value: number;
  target_value: number;
  percentage: number;
}
