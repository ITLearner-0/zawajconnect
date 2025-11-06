import { supabase } from '@/integrations/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  ProfileRow,
  UserMatchingRole,
  FetchMatchingProfilesOptions
} from '@/types/supabase';

/**
 * Re-export types for backwards compatibility
 */
export type {
  UserMatchingRole,
  FetchMatchingProfilesOptions
};

/**
 * Utility function to get Wali user IDs that should be excluded from matching
 * Walis are supervisors/guardians and should not appear as potential matches
 */
export const getWaliUserIds = async (): Promise<string[]> => {
  try {
    const { data: waliUsers, error } = await supabase
      .from('family_members')
      .select('invited_user_id')
      .eq('is_wali', true)
      .eq('invitation_status', 'accepted')
      .not('invited_user_id', 'is', null);

    if (error) {
      throw error as PostgrestError;
    }

    return (waliUsers ?? [])
      .map((w: { invited_user_id: string | null }) => w.invited_user_id)
      .filter((id): id is string => id !== null && id !== undefined);
  } catch (error) {
    console.error('Error fetching Wali user IDs:', error as PostgrestError);
    return [];
  }
};

/**
 * Utility function to get the opposite gender for matching
 */
export const getOppositeGender = async (userId: string): Promise<string | undefined> => {
  try {
    const { data: currentUserProfile, error } = await supabase
      .from('profiles')
      .select('gender')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error as PostgrestError;
    }

    const gender = currentUserProfile?.gender ?? undefined;
    if (!gender) return undefined;
    
    return gender === 'male' ? 'female' : 'male';
  } catch (error) {
    console.error('Error fetching user gender:', error as PostgrestError);
    return undefined;
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
  options: FetchMatchingProfilesOptions = {}
): Promise<ProfileRow[]> => {
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

    if (error) {
      throw error as PostgrestError;
    }
    
    // Cast data as unknown first to safely convert to ProfileRow[]
    return (data ?? []) as unknown as ProfileRow[];

  } catch (error) {
    console.error('Error fetching matching profiles:', error as PostgrestError);
    throw error;
  }
};

/**
 * Check if a user is a Wali (supervisor/guardian)
 */
export const isUserWali = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('id')
      .eq('invited_user_id', userId)
      .eq('is_wali', true)
      .eq('invitation_status', 'accepted')
      .limit(1);

    if (error) {
      throw error as PostgrestError;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error checking Wali status:', error as PostgrestError);
    return false;
  }
};

/**
 * Get user's role information for matching purposes
 */
export const getUserMatchingRole = async (userId: string): Promise<UserMatchingRole> => {
  try {
    const [isWali, profile] = await Promise.all([
      isUserWali(userId),
      supabase.from('profiles').select('gender, age, bio').eq('user_id', userId).maybeSingle()
    ]);

    if (profile.error) {
      throw profile.error as PostgrestError;
    }

    const profileData = profile.data ? {
      gender: profile.data.gender ?? undefined,
      age: profile.data.age ?? undefined,
      bio: profile.data.bio ?? undefined
    } : undefined;

    const hasCompleteProfile = Boolean(
      profileData && 
      profileData.age !== undefined && 
      profileData.gender !== undefined && 
      profileData.bio
    );

    return {
      isWali,
      hasCompleteProfile,
      canBeMatched: hasCompleteProfile && !isWali, // Only users with complete profiles who are not Walis can be matched
      profile: profileData
    };
  } catch (error) {
    console.error('Error getting user matching role:', error as PostgrestError);
    return {
      isWali: false,
      hasCompleteProfile: false,
      canBeMatched: false,
      profile: undefined
    };
  }
};