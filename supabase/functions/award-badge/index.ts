import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Badge definitions with their properties
const BADGE_DEFINITIONS = {
  // Profile Completion Badges
  profile_complete_25: {
    name: 'Getting Started',
    description: 'Complete 25% of your profile',
    icon: '🌱',
    rarity: 'common' as const,
    xp_reward: 50,
  },
  profile_complete_50: {
    name: 'Half Way There',
    description: 'Complete 50% of your profile',
    icon: '🌿',
    rarity: 'common' as const,
    xp_reward: 100,
  },
  profile_complete_75: {
    name: 'Almost Complete',
    description: 'Complete 75% of your profile',
    icon: '🌳',
    rarity: 'rare' as const,
    xp_reward: 200,
  },
  profile_complete_100: {
    name: 'Profile Master',
    description: 'Complete 100% of your profile',
    icon: '✨',
    rarity: 'epic' as const,
    xp_reward: 500,
  },

  // Verification Badges
  email_verified: {
    name: 'Email Verified',
    description: 'Successfully verified your email address',
    icon: '📧',
    rarity: 'common' as const,
    xp_reward: 100,
  },
  phone_verified: {
    name: 'Phone Verified',
    description: 'Successfully verified your phone number',
    icon: '📱',
    rarity: 'rare' as const,
    xp_reward: 150,
  },
  id_verified: {
    name: 'Identity Verified',
    description: 'Successfully verified your identity',
    icon: '🆔',
    rarity: 'epic' as const,
    xp_reward: 300,
  },

  // Matching Badges
  first_match: {
    name: 'First Connection',
    description: 'Make your first match',
    icon: '💚',
    rarity: 'rare' as const,
    xp_reward: 250,
  },
  match_streak_7: {
    name: 'Social Butterfly',
    description: 'Match with 7 different people',
    icon: '🦋',
    rarity: 'epic' as const,
    xp_reward: 500,
  },
  match_streak_25: {
    name: 'Popular Connection',
    description: 'Match with 25 different people',
    icon: '⭐',
    rarity: 'legendary' as const,
    xp_reward: 1000,
  },

  // Messaging Badges
  first_message: {
    name: 'Conversation Starter',
    description: 'Send your first message',
    icon: '💬',
    rarity: 'common' as const,
    xp_reward: 100,
  },
  messages_100: {
    name: 'Chatty',
    description: 'Send 100 messages',
    icon: '💭',
    rarity: 'rare' as const,
    xp_reward: 300,
  },
  messages_500: {
    name: 'Master Communicator',
    description: 'Send 500 messages',
    icon: '🗣️',
    rarity: 'epic' as const,
    xp_reward: 750,
  },

  // Activity Badges
  daily_login_7: {
    name: 'Week Warrior',
    description: 'Log in for 7 consecutive days',
    icon: '🔥',
    rarity: 'rare' as const,
    xp_reward: 300,
  },
  daily_login_30: {
    name: 'Monthly Champion',
    description: 'Log in for 30 consecutive days',
    icon: '🏆',
    rarity: 'epic' as const,
    xp_reward: 1000,
  },

  // Family Badges
  family_added: {
    name: 'Family Involvement',
    description: 'Add a family member to your profile',
    icon: '👨‍👩‍👧',
    rarity: 'rare' as const,
    xp_reward: 200,
  },
  wali_verified: {
    name: 'Wali Verified',
    description: 'Have your wali verified',
    icon: '🛡️',
    rarity: 'epic' as const,
    xp_reward: 400,
  },

  // Compatibility Badges
  test_completed: {
    name: 'Self Aware',
    description: 'Complete the compatibility test',
    icon: '🎯',
    rarity: 'common' as const,
    xp_reward: 150,
  },
  high_compatibility: {
    name: 'Perfect Match',
    description: 'Find a match with 90%+ compatibility',
    icon: '💎',
    rarity: 'legendary' as const,
    xp_reward: 1500,
  },

  // Special Badges
  early_adopter: {
    name: 'Early Adopter',
    description: 'Join during beta phase',
    icon: '🚀',
    rarity: 'legendary' as const,
    xp_reward: 500,
  },
  community_helper: {
    name: 'Community Helper',
    description: 'Help other users with valuable feedback',
    icon: '🤝',
    rarity: 'epic' as const,
    xp_reward: 300,
  },
};

interface AwardBadgeRequest {
  user_id: string;
  badge_id: keyof typeof BADGE_DEFINITIONS;
  progress_value?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { badge_id, progress_value = 0 }: AwardBadgeRequest = await req.json();

    console.log(`[award-badge] Processing badge award: ${badge_id} for user: ${user.id}`);

    // Validate badge_id
    if (!BADGE_DEFINITIONS[badge_id]) {
      throw new Error(`Invalid badge_id: ${badge_id}`);
    }

    const badgeInfo = BADGE_DEFINITIONS[badge_id];

    // Check if user already has this badge
    const { data: existingBadge, error: checkError } = await supabaseClient
      .from('user_badges')
      .select('id')
      .eq('user_id', user.id)
      .eq('badge_id', badge_id)
      .maybeSingle();

    if (checkError) {
      console.error('[award-badge] Error checking existing badge:', checkError);
      throw checkError;
    }

    if (existingBadge) {
      console.log(`[award-badge] User already has badge: ${badge_id}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Badge already awarded',
          badge: existingBadge,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Award the badge
    const { data: newBadge, error: badgeError } = await supabaseClient
      .from('user_badges')
      .insert({
        user_id: user.id,
        badge_id,
        badge_name: badgeInfo.name,
        badge_description: badgeInfo.description,
        badge_icon: badgeInfo.icon,
        rarity: badgeInfo.rarity,
        progress_value,
        display_order: 0,
      })
      .select()
      .single();

    if (badgeError) {
      console.error('[award-badge] Error awarding badge:', badgeError);
      throw badgeError;
    }

    console.log(`[award-badge] Badge awarded successfully: ${badge_id}`);

    // Create XP reward
    const { data: reward, error: rewardError } = await supabaseClient
      .from('gamification_rewards')
      .insert({
        user_id: user.id,
        reward_type: 'xp',
        reward_amount: badgeInfo.xp_reward,
        reward_description: `${badgeInfo.xp_reward} XP for earning "${badgeInfo.name}" badge`,
        source_action: `badge_${badge_id}`,
        claimed: false,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (rewardError) {
      console.error('[award-badge] Error creating reward:', rewardError);
      // Don't throw - badge was awarded successfully
    } else {
      console.log(`[award-badge] Reward created: ${badgeInfo.xp_reward} XP`);
    }

    // Update user progression total_xp
    const { error: progressionError } = await supabaseClient
      .rpc('increment_user_xp', {
        p_user_id: user.id,
        p_xp_amount: badgeInfo.xp_reward,
      })
      .catch(() => {
        // If RPC doesn't exist, try direct update
        return supabaseClient
          .from('user_progression')
          .update({
            total_xp: supabaseClient.raw(`total_xp + ${badgeInfo.xp_reward}`),
          })
          .eq('user_id', user.id);
      });

    if (progressionError) {
      console.error('[award-badge] Error updating progression:', progressionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        badge: newBadge,
        reward: reward,
        message: `Badge "${badgeInfo.name}" awarded successfully!`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[award-badge] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
