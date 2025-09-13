import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to get Wali user IDs that should be excluded from matching
 * Walis are supervisors/guardians and should not appear as potential matches
 */
export const getWaliUserIds = async (): Promise<string[]> => {
  try {
    const { data: waliUsers } = await supabase
      .from('family_members')
      .select('invited_user_id')
      .eq('is_wali', true)
      .eq('invitation_status', 'accepted')
      .not('invited_user_id', 'is', null);

    return waliUsers?.map(w => w.invited_user_id).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching Wali user IDs:', error);
    return [];
  }
};

/**
 * Utility function to get the opposite gender for matching
 */
export const getOppositeGender = async (userId: string): Promise<string | null> => {
  try {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('user_id', userId)
      .single();

    return currentUserProfile?.gender === 'male' ? 'female' : 'male';
  } catch (error) {
    console.error('Error fetching user gender:', error);
    return null;
  }
};

/**
 * Enhanced function to fetch profiles for matching, excluding:
 * - Current user
 * - Same gender users  
 * - Wali/supervisors (they are not candidates)
 */
export const fetchMatchingProfiles = async (
  userId: string, 
  options: {
    limit?: number;
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
  } = {}
) => {
  const { 
    limit = 50, 
    select = '*',
    orderBy = { column: 'created_at', ascending: false }
  } = options;

  try {
    // Get opposite gender and Wali IDs in parallel
    const [oppositeGender, waliUserIds] = await Promise.all([
      getOppositeGender(userId),
      getWaliUserIds()
    ]);

    if (!oppositeGender) {
      throw new Error('Unable to determine user gender');
    }

    // Build the query with exclusions
    let query = supabase
      .from('profiles')
      .select(select)
      .neq('user_id', userId)
      .eq('gender', oppositeGender);

    // Exclude Walis if any exist
    if (waliUserIds.length > 0) {
      query = query.not('user_id', 'in', `(${waliUserIds.join(',')})`);
    }

    // Apply ordering and limit
    query = query.order(orderBy.column, { ascending: orderBy.ascending }).limit(limit);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];

  } catch (error) {
    console.error('Error fetching matching profiles:', error);
    throw error;
  }
};

/**
 * Check if a user is a Wali (supervisor/guardian)
 */
export const isUserWali = async (userId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('family_members')
      .select('id')
      .eq('invited_user_id', userId)
      .eq('is_wali', true)
      .eq('invitation_status', 'accepted')
      .limit(1);

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking Wali status:', error);
    return false;
  }
};

/**
 * Get user's role information for matching purposes
 */
export const getUserMatchingRole = async (userId: string) => {
  try {
    const [isWali, profile] = await Promise.all([
      isUserWali(userId),
      supabase.from('profiles').select('gender, age, bio').eq('user_id', userId).single()
    ]);

    const hasCompleteProfile = profile.data && profile.data.age && profile.data.gender && Boolean(profile.data.bio);

    return {
      isWali,
      hasCompleteProfile,
      canBeMatched: hasCompleteProfile && !isWali, // Only users with complete profiles who are not Walis can be matched
      profile: profile.data
    };
  } catch (error) {
    console.error('Error getting user matching role:', error);
    return {
      isWali: false,
      hasCompleteProfile: false,
      canBeMatched: false,
      profile: null
    };
  }
};